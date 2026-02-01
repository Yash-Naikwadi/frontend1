import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AccessRequestsPanel } from '../components/AccessRequest';
import { ProfileForm } from '../components/ProfileForm';
import { Sidebar } from '../components/Sidebar';
import Header from '../components/DocHeader';
import PatientsTab from '../components/PatientTab';
import Navbar from '../components/Navbar';

const StatsCards = () => {
  const stats = [
    { title: 'Total Patients', value: '1,247', change: '+12%' },
    { title: "Today's Appointments", value: '18', change: '+3' },
    { title: 'Pending Requests', value: '7', change: '+2' },
    { title: 'AI Diagnoses', value: '156', change: '+24%' }
  ];

  return (
    <div>
      {stats.map((stat, index) => (
        <div key={index}>
          <div>
            <p>{stat.title}</p>
            <p>{stat.value}</p>
            <p>{stat.change} from last month</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const AppointmentsPanel = () => {
  const todayAppointments = [
    { id: 1, time: '09:00 AM', patient: 'Sarah Johnson', type: 'Follow-up', status: 'confirmed' },
    { id: 2, time: '10:30 AM', patient: 'Mike Davis', type: 'Consultation', status: 'pending' },
    { id: 3, time: '02:00 PM', patient: 'Lisa Wong', type: 'Check-up', status: 'confirmed' },
    { id: 4, time: '03:30 PM', patient: 'Robert Miller', type: 'Emergency', status: 'urgent' }
  ];

  return (
    <div>
      <div>
        <h3>Today's Appointments</h3>
        <div>
          {todayAppointments.map((appointment) => (
            <div key={appointment.id}>
              <div>
                <div>🕐</div>
                <div>
                  <h4>{appointment.patient}</h4>
                  <p>{appointment.type}</p>
                  <p>{appointment.time}</p>
                </div>
              </div>
              <span>{appointment.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const OverviewPanel = () => {
  return (
    <div>
      <StatsCards />
      <div>
        <div>
          <PatientsTab />
        </div>
        <div>
          <div>
            <h3>Quick Actions</h3>
            <div>
              <button>➕ Add New Patient</button>
              <button>📅 Schedule Appointment</button>
              <button>
                <Link to="/prescription">💊 Prescription Generator</Link>
              </button>
            </div>
          </div>
          
          <div>
            <h3>Health Insights</h3>
            <div>
              <div>
                <span>Critical Cases</span>
                <span>3</span>
              </div>
              <div>
                <span>Improving Cases</span>
                <span>12</span>
              </div>
              <div>
                <span>Stable Cases</span>
                <span>28</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPanel />;
      case 'patients':
        return <PatientsTab />;
      case 'requests':
        return <AccessRequestsPanel />;
      case 'appointments':
        return <AppointmentsPanel />;
      case 'profile':
        return <ProfileForm />;
      case 'settings':
        return (
          <div>
            <h3>Settings</h3>
            <p>Settings panel coming soon...</p>
          </div>
        );
      default:
        return <OverviewPanel />;
    }
  };

  return (
    <div>
      <div>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div>
          <Navbar/>
          <div>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;