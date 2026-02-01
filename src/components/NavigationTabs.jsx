import React from 'react';

const NavigationTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'symptom-checker', label: 'AI Symptom Checker' },
    { id: 'disease-detection', label: 'Report Analyze' },
    { id: 'doctors', label: 'Find Doctors' },
    { id: 'health-records', label: 'Health Records' },
    { id: 'access-requests', label: 'Access Requests' },
    { id: 'guardian-management', label: 'Guardian Management' },
    { id: 'image-analyze', label: 'Image Analyze' }
  ];

  return (
    <div>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          data-active={activeTab === tab.id}
        >
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default NavigationTabs;