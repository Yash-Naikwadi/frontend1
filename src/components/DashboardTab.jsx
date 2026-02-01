import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from "../context/AuthContext";
import { useMediChain } from "../context/BlockChainContext";
import axios from "axios";

const DashboardTab = ({ wearableData }) => {
  const { user } = useContext(AuthContext);
  const { userHealthID, userWallet } = useMediChain();
  
  const appointments = [
    { date: "Today", time: "2:30 PM", doctor: "Dr. Sarah Johnson", type: "Cardiology Checkup", status: "Confirmed" },
    { date: "Tomorrow", time: "10:00 AM", doctor: "Dr. Michael Chen", type: "General Consultation", status: "Pending" },
    { date: "Thu, May 29", time: "3:00 PM", doctor: "Dr. Emily Davis", type: "Skin Examination", status: "Confirmed" }
  ];

  const quickActions = [
    { label: 'Symptom Check', icon: '🔍', color: 'bg-primary-50 text-primary-600', action: () => {} },
    { label: 'Upload Scan', icon: '📤', color: 'bg-secondary-50 text-secondary-600', action: () => {} },
    { label: 'Find Doctor', icon: '👨‍⚕️', color: 'bg-accent-50 text-accent-600', action: () => {} },
    { label: 'Book Appointment', icon: '📅', color: 'bg-warning-50 text-warning-600', action: () => {} }
  ];

  const [healthIdInfo, setHealthIdInfo] = useState({
    hasHealthID: false,
    tokenId: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchHealthIdInfo = async () => {
      if (!userWallet) {
        setHealthIdInfo({
          hasHealthID: false,
          tokenId: null,
          loading: false,
          error: null
        });
        return;
      }

      try {
        setHealthIdInfo(prev => ({ ...prev, loading: true }));
        const response = await axios.get(`/api/blockchain/check-health-id/${userWallet}`);
        
        setHealthIdInfo({
          hasHealthID: response.data.hasHealthID,
          tokenId: response.data.tokenId,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error("Error fetching HealthID info:", error);
        setHealthIdInfo({
          hasHealthID: false,
          tokenId: null,
          loading: false,
          error: "Failed to fetch HealthID information"
        });
      }
    };

    fetchHealthIdInfo();
  }, [userWallet, userHealthID]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || 'User'}! 👋</h2>
          <p className="text-gray-500 mt-1">Here's your health overview for today</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-xl">🆔</div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">HealthID Status</p>
              {healthIdInfo.loading ? (
                <div className="h-4 w-20 bg-gray-100 animate-pulse rounded mt-1"></div>
              ) : healthIdInfo.error ? (
                <p className="text-sm font-bold text-danger-500">{healthIdInfo.error}</p>
              ) : healthIdInfo.hasHealthID || userHealthID ? (
                <p className="text-sm font-bold text-primary-600">Active: #{healthIdInfo.tokenId || userHealthID}</p>
              ) : (
                <p className="text-sm font-bold text-warning-500">Not Minted</p>
              )}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center text-xl">🦊</div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet</p>
              <p className="text-sm font-bold text-gray-900">
                {userWallet ? `${userWallet.slice(0, 6)}...${userWallet.slice(-4)}` : 'Not Connected'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
          <div className="w-12 h-12 bg-danger-50 text-danger-500 rounded-xl flex items-center justify-center text-2xl mb-4">❤️</div>
          <p className="text-3xl font-bold text-gray-900">{wearableData?.heartRate || '72'}</p>
          <p className="text-sm font-medium text-gray-500">Heart Rate (BPM)</p>
          <div className="mt-4 flex items-center gap-1 text-xs font-medium text-success-600">
            <span>↑ 2%</span>
            <span className="text-gray-400">from yesterday</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
          <div className="w-12 h-12 bg-primary-50 text-primary-500 rounded-xl flex items-center justify-center text-2xl mb-4">📊</div>
          <p className="text-3xl font-bold text-gray-900">{wearableData?.oxygenLevel || '98'}%</p>
          <p className="text-sm font-medium text-gray-500">O2 Level</p>
          <div className="mt-4 flex items-center gap-1 text-xs font-medium text-success-600">
            <span>Stable</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
          <div className="w-12 h-12 bg-accent-50 text-accent-500 rounded-xl flex items-center justify-center text-2xl mb-4">📈</div>
          <p className="text-3xl font-bold text-gray-900">{wearableData?.bloodPressure || '120/80'}</p>
          <p className="text-sm font-medium text-gray-500">Blood Pressure</p>
          <div className="mt-4 flex items-center gap-1 text-xs font-medium text-warning-600">
            <span>Normal Range</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
          <div className="w-12 h-12 bg-secondary-50 text-secondary-500 rounded-xl flex items-center justify-center text-2xl mb-4">👟</div>
          <p className="text-3xl font-bold text-gray-900">{wearableData?.steps?.toLocaleString() || '5,280'}</p>
          <p className="text-sm font-medium text-gray-500">Steps Today</p>
          <div className="mt-4 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-secondary-500 h-full w-[52%]"></div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Upcoming Appointments</h3>
            <button className="text-primary-600 text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="divide-y divide-gray-100">
            {appointments.map((apt, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">👨‍⚕️</div>
                  <div>
                    <p className="font-bold text-gray-900">{apt.doctor}</p>
                    <p className="text-sm text-gray-500">{apt.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{apt.date}</p>
                  <p className="text-sm text-gray-500">{apt.time}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  apt.status === 'Confirmed' ? 'bg-success-50 text-success-600' : 'bg-warning-50 text-warning-600'
                }`}>
                  {apt.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all duration-200 group"
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform duration-200`}>
                  {action.icon}
                </div>
                <span className="text-sm font-bold text-gray-700 text-center">{action.label}</span>
              </button>
            ))}
          </div>
          
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-lg">
            <h4 className="font-bold text-lg mb-2">Need Help?</h4>
            <p className="text-primary-100 text-sm mb-4">Our AI assistant is available 24/7 to help with your medical queries.</p>
            <button className="w-full py-3 bg-white text-primary-600 font-bold rounded-lg hover:bg-primary-50 transition-colors duration-200">
              Start AI Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
