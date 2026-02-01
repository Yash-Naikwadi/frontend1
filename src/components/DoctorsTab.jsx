import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useWebSocket } from '../hooks/useWebSocket';
import ChatModal from './ChatModal';

const DoctorsTab = () => {
  const [doctors, setDoctors] = useState([]);
  const [doctorUsers, setDoctorUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  const token = localStorage.getItem('token');
  
  const {
    isConnected,
    messages,
    notifications,
    joinChat,
    sendMessage,
    markAsRead,
    sendTyping,
    clearNotifications
  } = useWebSocket(token);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorUsersRes = await axios.get("http://localhost:5000/api/auth/doctors", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDoctorUsers(doctorUsersRes.data);

        const doctorDetailsRes = await axios.get("http://localhost:5000/api/doctors", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const mergedDoctors = doctorUsersRes.data.map(doctorUser => {
          const doctorDetails = doctorDetailsRes.data.find(doc => 
            doc.userId === doctorUser._id || doc.email === doctorUser.email
          );
          
          return {
            ...doctorUser,
            specialization: doctorDetails?.specialization || 'General Practice',
            experience: doctorDetails?.experience || 'N/A',
            location: doctorDetails?.location || 'Not specified',
            fee: doctorDetails?.fee || 'Contact for pricing',
            rating: doctorDetails?.rating || '4.5',
            nextAvailable: doctorDetails?.nextAvailable || 'Contact to schedule',
            image: doctorDetails?.image || doctorUser.avatar || '👨‍⚕️',
            doctorDetails: doctorDetails
          };
        });

        setDoctors(mergedDoctors);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.usertype !== 'Patient') {
          console.error("Access denied: Only patients can view doctors");
          return;
        }
        
        setCurrentUser(res.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          const parsedUser = JSON.parse(userInfo);
          if (parsedUser.usertype === 'Patient') {
            setCurrentUser(parsedUser);
          }
        }
      }
    };

    if (token) {
      fetchDoctors();
      fetchCurrentUser();
    }
  }, [token]);

  useEffect(() => {
    if (notifications.length > 0) {
      setDoctors(prev => prev.map(doctor => {
        const doctorNotifications = notifications.filter(n => n.senderId === doctor._id);
        if (doctorNotifications.length > 0) {
          const latestNotification = doctorNotifications[doctorNotifications.length - 1];
          return {
            ...doctor,
            lastMessage: latestNotification.message,
            unreadCount: (doctor.unreadCount || 0) + doctorNotifications.length,
            lastMessageTime: new Date(latestNotification.timestamp)
          };
        }
        return doctor;
      }));
    }
  }, [notifications]);

  const openChat = (doctor) => {
    setSelectedDoctor(doctor);
    setIsChatOpen(true);
    joinChat(doctor._id);
    
    setDoctors(prev => prev.map(doc => 
      doc._id === doctor._id 
        ? { ...doc, unreadCount: 0 }
        : doc
    ));
    
    const doctorNotifications = notifications.filter(n => n.senderId === doctor._id);
    if (doctorNotifications.length > 0) {
      clearNotifications();
    }
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setSelectedDoctor(null);
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    if ((a.unreadCount || 0) > 0 && (b.unreadCount || 0) === 0) return -1;
    if ((a.unreadCount || 0) === 0 && (b.unreadCount || 0) > 0) return 1;
    
    const aTime = a.lastMessageTime || new Date(0);
    const bTime = b.lastMessageTime || new Date(0);
    return new Date(bTime) - new Date(aTime);
  });

  if (loading) {
    return <p>Loading doctors...</p>;
  }

  if (currentUser && currentUser.usertype !== 'Patient') {
    return (
      <div>
        <p>Access denied. Only patients can view doctors.</p>
      </div>
    );
  }

  if (!currentUser) {
    return <p>Loading user data...</p>;
  }

  return (
    <div>
      <div>
        <span>{isConnected ? '🟢 Connected' : '🔴 Disconnected'}</span>
      </div>

      <div>
        <h2>Find Doctors</h2>
        <div>
          <div>
            <input
              type="text"
              placeholder="Search doctors, specializations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button>📍 Near Me</button>
        </div>
      </div>

      <div>
        {sortedDoctors.map((doctor) => (
          <div key={doctor._id}>
            {(doctor.unreadCount || 0) > 0 && (
              <div>{doctor.unreadCount}</div>
            )}

            <div>
              <div>
                <div>
                  {doctor.avatar || doctor.image ? (
                    <img 
                      src={doctor.avatar || doctor.image} 
                      alt={doctor.name}
                    />
                  ) : (
                    <div>{doctor.image || '👨‍⚕️'}</div>
                  )}
                  <span>🟢</span>
                </div>
                <div>
                  <h3>{doctor.name}</h3>
                  <p>{doctor.specialization}</p>
                  <p>{doctor.email}</p>
                </div>
              </div>
              <div>
                <span>⭐</span>
                <span>{doctor.rating}</span>
              </div>
            </div>

            {doctor.lastMessage && (
              <div>
                <p>Last message: {doctor.lastMessage}</p>
              </div>
            )}

            <div>
              <div>
                <span>Experience:</span>
                <span>{doctor.experience} years</span>
              </div>
              <div>
                <span>Location:</span>
                <span>{doctor.location}</span>
              </div>
              <div>
                <span>Fee:</span>
                <span>${doctor.fee}</span>
              </div>
            </div>

            <div>
              <div>
                <span>🕐</span>
                <span>Next available: {doctor.nextAvailable}</span>
              </div>
            </div>

            <div>
              <button>Book Appointment</button>
              <button onClick={() => openChat(doctor)}>
                💬
                {(doctor.unreadCount || 0) > 0 && (
                  <span>🔔</span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {sortedDoctors.length === 0 && !loading && (
        <div>
          <div>👨‍⚕️</div>
          <h3>No doctors found</h3>
          <p>
            {searchTerm ? 'Try adjusting your search terms.' : 'No doctors available at the moment.'}
          </p>
        </div>
      )}

      {isChatOpen && selectedDoctor && currentUser && (
        <ChatModal
          doctor={{
            _id: selectedDoctor._id,
            name: selectedDoctor.name,
            specialization: selectedDoctor.specialization,
            image: selectedDoctor.avatar || selectedDoctor.image || '👨‍⚕️',
            email: selectedDoctor.email,
            usertype: selectedDoctor.usertype,
            ...selectedDoctor
          }}
          isOpen={isChatOpen}
          onClose={closeChat}
          messages={messages}
          onSendMessage={sendMessage}
          onTyping={sendTyping}
          isConnected={isConnected}
          currentUser={{ 
            _id: currentUser._id,
            usertype: currentUser.usertype,
            name: currentUser.name,
            email: currentUser.email
          }}
        />
      )}
    </div>
  );
};

export default DoctorsTab;