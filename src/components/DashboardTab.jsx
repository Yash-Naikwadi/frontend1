import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from "../context/AuthContext";
import { useMediChain } from "../context/BlockChainContext";
import axios from "axios";

const DashboardTab = ({ wearableData }) => {
  const { user } = useContext(AuthContext);
  const { userHealthID, userWallet } = useMediChain();
  
  const appointments = [
    { date: "Today", time: "2:30 PM", doctor: "Dr. Sarah Johnson", type: "Cardiology Checkup" },
    { date: "Tomorrow", time: "10:00 AM", doctor: "Dr. Michael Chen", type: "General Consultation" },
    { date: "Thu, May 29", time: "3:00 PM", doctor: "Dr. Emily Davis", type: "Skin Examination" }
  ];

  const quickActions = [
    { label: 'Symptom Check', action: () => {} },
    { label: 'Upload Scan', action: () => {} },
    { label: 'Find Doctor', action: () => {} },
    { label: 'Book Appointment', action: () => {} }
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
    <div>
      <div>
        <h2>Welcome back, {user?.name || 'User'}! 👋</h2>
        <p>Here's your health overview for today</p>
        
        <div>
          <div>
            <div>HealthID Status</div>
            {healthIdInfo.loading ? (
              <div>Loading...</div>
            ) : healthIdInfo.error ? (
              <div>{healthIdInfo.error}</div>
            ) : healthIdInfo.hasHealthID || userHealthID ? (
              <div>Active: #{healthIdInfo.tokenId || userHealthID}</div>
            ) : (
              <div>Not minted yet. Connect wallet and mint from navbar.</div>
            )}
          </div>
          <div>
            {userWallet ? 
              `Wallet: ${userWallet.slice(0, 6)}...${userWallet.slice(-4)}` : 
              'Wallet not connected'
            }
          </div>
        </div>
        
        <div>
          <div>
            <div>❤️</div>
            <div>{wearableData?.heartRate || '72'} BPM</div>
            <div>Heart Rate</div>
          </div>
          <div>
            <div>📊</div>
            <div>{wearableData?.oxygenLevel || '98'}%</div>
            <div>O2 Level</div>
          </div>
          <div>
            <div>📈</div>
            <div>{wearableData?.bloodPressure || '120/80'}</div>
            <div>Blood Pressure</div>
          </div>
          <div>
            <div>👟</div>
            <div>{wearableData?.steps?.toLocaleString() || '5,280'}</div>
            <div>Steps Today</div>
          </div>
        </div>
      </div>
      
      <div>
        <div>
          <h3>Upcoming Appointments</h3>
          <div>
            {appointments.map((apt, index) => (
              <div key={index}>
                <div>
                  <div>{apt.doctor}</div>
                  <div>{apt.type}</div>
                </div>
                <div>
                  <div>{apt.date}</div>
                  <div>{apt.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
          >
            <div>{action.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardTab;