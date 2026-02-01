import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useWebSocket } from '../hooks/useWebSocket';
import ChatModal from './ChatModal';
import ViewRecordsButton from './Viewrecordbutton';

export const PatientsTab = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
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
    const fetchPatients = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/patients", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const patientsWithRequiredFields = res.data.map(patient => ({
          ...patient,
          walletAddress: patient.walletAddress || null,
          _id: patient._id
        }));
        
        setPatients(patientsWithRequiredFields);
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.usertype !== 'Doctor') {
          console.error("Access denied: Only doctors can view patients");
          return;
        }
        
        setCurrentUser(res.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          const parsedUser = JSON.parse(userInfo);
          if (parsedUser.usertype === 'Doctor') {
            setCurrentUser(parsedUser);
          }
        }
      }
    };

    if (token) {
      fetchPatients();
      fetchCurrentUser();
    }
  }, [token]);

  useEffect(() => {
    if (notifications.length > 0) {
      setPatients(prev => prev.map(patient => {
        const patientNotifications = notifications.filter(n => n.senderId === patient._id);
        if (patientNotifications.length > 0) {
          const latestNotification = patientNotifications[patientNotifications.length - 1];
          return {
            ...patient,
            lastMessage: latestNotification.message,
            unreadCount: (patient.unreadCount || 0) + patientNotifications.length,
            lastMessageTime: new Date(latestNotification.timestamp),
            hasNewMessage: true
          };
        }
        return patient;
      }));
    }
  }, [notifications]);

  const openChat = (patient) => {
    setSelectedPatient(patient);
    setIsChatOpen(true);
    joinChat(patient._id);
    
    setPatients(prev => prev.map(pat => 
      pat._id === patient._id 
        ? { ...pat, unreadCount: 0, hasNewMessage: false }
        : pat
    ));
    
    const patientNotifications = notifications.filter(n => n.senderId === patient._id);
    if (patientNotifications.length > 0) {
      clearNotifications();
    }
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setSelectedPatient(null);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.condition?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    if ((a.unreadCount || 0) > 0 && (b.unreadCount || 0) === 0) return -1;
    if ((a.unreadCount || 0) === 0 && (b.unreadCount || 0) > 0) return 1;
    
    const aTime = a.lastMessageTime || new Date(0);
    const bTime = b.lastMessageTime || new Date(0);
    return new Date(bTime) - new Date(aTime);
  });

  if (loading) {
    return <p>Loading patients...</p>;
  }

  if (currentUser && currentUser.usertype !== 'Doctor') {
    return (
      <div>
        <p>Access denied. Only doctors can view patients.</p>
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
        <h2>My Patients</h2>
        <div>
          <input
            type="text"
            placeholder="Search patients, conditions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>📊 Health Overview</button>
        </div>
      </div>

      <div>
        {sortedPatients.map((patient) => (
          <div key={patient._id}>
            {(patient.unreadCount || 0) > 0 && (
              <>
                <div>{patient.unreadCount}</div>
                <div>🔔 New Message!</div>
              </>
            )}

            <div>
              <div>
                <div>
                  {patient.avatar ? (
                    <img 
                      src={patient.avatar} 
                      alt={patient.name}
                    />
                  ) : (
                    <div>
                      {patient.name?.charAt(0) || '👤'}
                    </div>
                  )}
                  <span>🟢</span>
                  {(patient.unreadCount || 0) > 0 && (
                    <div>🔔</div>
                  )}
                </div>
                <div>
                  <h3>{patient.name}</h3>
                  <p>{patient.email}</p>
                  {patient.age && (
                    <p>Age: {patient.age}</p>
                  )}
                </div>
              </div>
              {patient.healthScore && (
                <div>
                  <div>
                    <span>❤️</span>
                    <span>{patient.healthScore}%</span>
                  </div>
                </div>
              )}
            </div>

            {patient.lastMessage && (
              <div>
                <div>
                  <p>Last message: {patient.lastMessage}</p>
                  {patient.lastMessageTime && (
                    <p>{new Date(patient.lastMessageTime).toLocaleTimeString()}</p>
                  )}
                </div>
                {(patient.unreadCount || 0) > 0 && (
                  <div>●</div>
                )}
              </div>
            )}

            <div>
              {patient.condition && (
                <div>
                  <span>Condition:</span>
                  <span>{patient.condition}</span>
                </div>
              )}
              {patient.lastVisit && (
                <div>
                  <span>Last Visit:</span>
                  <span>{new Date(patient.lastVisit).toLocaleDateString()}</span>
                </div>
              )}
              {patient.phone && (
                <div>
                  <span>Phone:</span>
                  <span>{patient.phone}</span>
                </div>
              )}
            </div>

            {patient.status && (
              <div>
                <div>
                  <span>📊</span>
                  <span>Status: {patient.status}</span>
                </div>
              </div>
            )}

            {patient.nextAppointment && (
              <div>
                <div>
                  <span>🕐</span>
                  <span>
                    Next appointment: {new Date(patient.nextAppointment).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}

            <div>
              <ViewRecordsButton patient={patient} />
              <button onClick={() => openChat(patient)}>
                💬
                {(patient.unreadCount || 0) > 0 && (
                  <>
                    <span>🔔</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {sortedPatients.length === 0 && !loading && (
        <div>
          <h3>No patients found</h3>
          <p>
            {searchTerm ? 'Try adjusting your search terms.' : 'No patients assigned to you yet.'}
          </p>
        </div>
      )}

      {isChatOpen && selectedPatient && currentUser && (
        <ChatModal
          doctor={{
            _id: selectedPatient._id,
            name: selectedPatient.name,
            specialization: selectedPatient.condition || 'Patient',
            image: selectedPatient.avatar || '👤',
            ...selectedPatient
          }}
          isOpen={isChatOpen}
          onClose={closeChat}
          messages={messages}
          onSendMessage={sendMessage}
          onTyping={sendTyping}
          isConnected={isConnected}
          currentUser={{ 
            _id: currentUser._id,
            usertype: currentUser.usertype
          }}
        />
      )}
    </div>
  );
};

export default PatientsTab;