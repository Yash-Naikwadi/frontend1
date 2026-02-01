import React, { useContext, useState, useEffect } from "react";
import { Button } from "./button.jsx";
import { connectWallet, disconnectWallet } from "../utils/wallet";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { useMediChain } from "../context/BlockChainContext.jsx";
import axios from "axios";

const Navbar = () => {
  const [wallet, setWallet] = useState(null);
  const [doctorName, setDoctorName] = useState("");
  const navigate = useNavigate();

  const [mintStatus, setMintStatus] = useState({
    loading: false,
    error: null,
    success: false,
    tokenId: null
  });
  
  const { user, logout } = useContext(AuthContext);
  const { userHealthID, connectWallet: connectBlockchainWallet } = useMediChain();

  const handleWalletConnect = async () => {
    const address = await connectWallet();
    setWallet(address);
    
    if (address) {
      await connectBlockchainWallet();
      
      try {
        const response = await axios.get(`http://localhost:5000/api/blockchain/check-health-id/${address}`);
        if (response.data.hasHealthID) {
          setMintStatus({
            loading: false,
            error: null,
            success: true,
            tokenId: response.data.tokenId
          });
        }
      } catch (error) {
        console.error("Error checking HealthID:", error);
      }
    }
  };

  const handleWalletDisconnect = () => {
    disconnectWallet();
    setWallet(null);
    setMintStatus({
      loading: false,
      error: null,
      success: false,
      tokenId: null
    });
  };

  const handleMintHealthID = async () => {
    if (!wallet) return;
    
    setMintStatus({
      loading: true,
      error: null,
      success: false,
      tokenId: null
    });
    
    try {
      const token = localStorage.getItem('token') || (user && user.token);
      const response = await axios.post('http://localhost:5000/api/blockchain/mint-health-id', {
        walletAddress: wallet
      }, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      
      setMintStatus({
        loading: false,
        error: null,
        success: true,
        tokenId: response.data.tokenId
      });
    } catch (error) {
      console.error("Error minting HealthID:", error);
      setMintStatus({
        loading: false,
        error: error.response?.data?.error || "Failed to mint HealthID",
        success: false,
        tokenId: null
      });
    }
  };

  useEffect(() => {
    const fetchDoctorInfo = async () => {
      if (user && user._id) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`http://localhost:5000/api/doctors/${user._id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (response.data?.name) {
            setDoctorName(response.data.name);
          }
        } catch (error) {
          console.error("Error fetching doctor name:", error);
        }
      }
    };
  
    fetchDoctorInfo();
  }, [user]);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2 text-2xl font-bold text-primary-600">
        <span className="text-3xl">🧠</span> MedLink AI
      </div>

      <div className="flex items-center gap-6">
        {user && (
          <span className="text-gray-700 font-medium hidden md:inline-block">
            👋 Hello, <span className="text-primary-600">{user.name}</span>
          </span>
        )}

        {wallet && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-semibold border border-primary-100">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
            🦊 {wallet.slice(0, 6)}...{wallet.slice(-4)}
          </div>
        )}

        {(userHealthID || mintStatus.tokenId) && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary-50 text-secondary-700 rounded-full text-sm font-semibold border border-secondary-100">
            🆔 HealthID: #{userHealthID || mintStatus.tokenId}
          </div>
        )}

        <div className="flex items-center gap-3">
          {user ? (
            <Button
              variant="outline"
              className="px-4 py-2 text-sm"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Logout
            </Button>
          ) : (
            <>
              <Link to="/login">
                <Button className="px-4 py-2 text-sm">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" className="px-4 py-2 text-sm">Sign Up</Button>
              </Link>
            </>
          )}

          {wallet ? (
            <Button variant="outline" className="px-4 py-2 text-sm" onClick={handleWalletDisconnect}>
              Disconnect Wallet
            </Button>
          ) : (
            <Button variant="outline" className="px-4 py-2 text-sm" onClick={handleWalletConnect}>
              Connect Wallet
            </Button>
          )}

          {wallet && !userHealthID && !mintStatus.success && (
            <Button 
              variant="primary" 
              className="px-4 py-2 text-sm"
              onClick={handleMintHealthID}
              disabled={mintStatus.loading}
            >
              {mintStatus.loading ? "Minting..." : "Mint HealthID"}
            </Button>
          )}
        </div>

        {mintStatus.error && (
          <span className="text-danger-500 text-xs font-medium bg-danger-50 px-2 py-1 rounded border border-danger-100">
            {mintStatus.error}
          </span>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
