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
    <nav>
      <div>🧠 MedLink AI</div>

      <div>
        {user && (
          <span>👋 Hello, {user.name}</span>
        )}

        {wallet && (
          <span>
            🦊 {wallet.slice(0, 6)}...{wallet.slice(-4)}
          </span>
        )}

        {(userHealthID || mintStatus.tokenId) && (
          <span>
            🆔 HealthID: #{userHealthID || mintStatus.tokenId}
          </span>
        )}

        {user ? (
          <Button
            variant="outline"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Logout
          </Button>
        ) : (
          <>
            <Button><Link to="/login">Sign In</Link></Button>
            <Button variant="secondary"><Link to="/register">Sign Up</Link></Button>
          </>
        )}

        {wallet ? (
          <Button variant="outline" onClick={handleWalletDisconnect}>
            Disconnect Wallet
          </Button>
        ) : (
          <Button variant="outline" onClick={handleWalletConnect}>
            Connect Wallet
          </Button>
        )}

        {wallet && !userHealthID && !mintStatus.success && (
          <Button 
            variant="primary" 
            onClick={handleMintHealthID}
            disabled={mintStatus.loading}
          >
            {mintStatus.loading ? "Minting..." : "Mint HealthID"}
          </Button>
        )}

        {mintStatus.error && (
          <span>{mintStatus.error}</span>
        )}
      </div>
    </nav>
  );
};

export default Navbar;