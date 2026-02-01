import React from "react";

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'patients', label: 'Patients' },
    { id: 'requests', label: 'Access Requests' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'profile', label: 'Profile' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <div>
      <div>
        <div>
          <div>🩺</div>
          <div>
            <h1>MedLink AI</h1>
            <p>Doctor Portal</p>
          </div>
        </div>

        <nav>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              data-active={activeTab === item.id}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};