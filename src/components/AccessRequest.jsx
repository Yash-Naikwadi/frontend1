import React, { useState, useEffect } from "react";
import { ethers } from 'ethers';
import axios from 'axios';
import MedVaultABI from '../abis/MedVaultAbi.json';

export const AccessRequestsPanel = () => {
  const [accessRequests, setAccessRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(null);
  const [error, setError] = useState(null);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  
  const token = localStorage.getItem('token');
  const CONTRACT_ADDRESS = "0x652c5Ae2b16B0717F5B0D2f95C9eA2ad2D96b973";

  useEffect(() => {
    const initializeContract = async () => {
      try {
        if (typeof window.ethereum === 'undefined') {
          setError("Please install MetaMask to use this feature");
          return;
        }

        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await web3Provider.getSigner();
        const accounts = await web3Provider.listAccounts();
        
        if (accounts.length === 0) {
          setError("No accounts found. Please connect your wallet.");
          return;
        }

        let contractABI;
        if (Array.isArray(MedVaultABI)) {
          contractABI = MedVaultABI;
        } else if (MedVaultABI.abi && Array.isArray(MedVaultABI.abi)) {
          contractABI = MedVaultABI.abi;
        } else {
          throw new Error("Invalid ABI format");
        }
        
        const contractInstance = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractABI,
          signer
        );
        
        setProvider(web3Provider);
        setContract(contractInstance);
        setAccount(accounts[0].address);
        console.log("Contract initialized successfully");
        
      } catch (error) {
        console.error("Error initializing contract:", error);
        let errorMessage = "Failed to connect to blockchain";
        
        if (error.code === 4001) {
          errorMessage = "User rejected the connection request";
        } else if (error.code === -32002) {
          errorMessage = "Connection request already pending";
        } else if (error.message.includes("Invalid ABI")) {
          errorMessage = "Contract ABI configuration error";
        } else if (error.message.includes("network")) {
          errorMessage = "Network connection error. Please check your connection.";
        }
        
        setError(errorMessage);
      }
    };

    initializeContract();
  }, []);

  useEffect(() => {
    const fetchAccessRequests = async () => {
      if (!contract || !account || !provider) {
        console.log('Missing dependencies:', { contract: !!contract, account: !!account, provider: !!provider });
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 10000);
        
        console.log(`Querying events from block ${fromBlock} to ${currentBlock}`);
        
        const filter = contract.filters.AccessRequested(null, account);
        const events = await contract.queryFilter(filter, fromBlock, currentBlock);
        
        console.log('Found access request events:', events);
        
        if (events.length === 0) {
          setAccessRequests([]);
          setLoading(false);
          return;
        }
        
        const doctorRequestMap = new Map();
        
        events.forEach(event => {
          const doctorAddress = event.args[0];
          const blockNumber = event.blockNumber;
          
          if (!doctorRequestMap.has(doctorAddress) || 
              doctorRequestMap.get(doctorAddress).blockNumber < blockNumber) {
            doctorRequestMap.set(doctorAddress, {
              doctorAddress,
              blockNumber,
              transactionHash: event.transactionHash,
              timestamp: null
            });
          }
        });
        
        const doctorRequests = [];
        
        for (const [doctorAddress, requestInfo] of doctorRequestMap) {
          try {
            const hasAccess = await contract.doctorPermissions(account, doctorAddress);
            
            if (hasAccess) {
              console.log(`Doctor ${doctorAddress} already has access, skipping`);
              continue;
            }
            
            let requestDate = new Date().toISOString();
            try {
              const block = await provider.getBlock(requestInfo.blockNumber);
              if (block && block.timestamp) {
                requestDate = new Date(block.timestamp * 1000).toISOString();
              }
            } catch (blockError) {
              console.warn('Could not fetch block timestamp:', blockError);
            }
            
            try {
              const response = await axios.get(
                `http://localhost:5000/api/auth/doctors/wallet/${doctorAddress}`, 
                {
                  headers: { Authorization: `Bearer ${token}` },
                  timeout: 10000
                }
              );
              
              const doctorInfo = response.data;
              
              doctorRequests.push({
                id: doctorAddress,
                doctorName: doctorInfo.name || 'Unknown Doctor',
                doctorAddress: doctorAddress,
                requestDate: requestDate,
                urgency: doctorInfo.urgency || 'medium',
                specialization: doctorInfo.specialization || 'Not specified',
                email: doctorInfo.email || 'Not available',
                hospital: doctorInfo.hospital || 'Not specified',
                profilePicture: doctorInfo.profilePicture,
                transactionHash: requestInfo.transactionHash
              });
              
            } catch (apiError) {
              console.error(`Error fetching doctor info for ${doctorAddress}:`, apiError);
              
              doctorRequests.push({
                id: doctorAddress,
                doctorName: `Doctor (${doctorAddress.slice(0, 8)}...)`,
                doctorAddress: doctorAddress,
                requestDate: requestDate,
                urgency: 'medium',
                specialization: 'Not available',
                email: 'Not available',
                hospital: 'Not available',
                transactionHash: requestInfo.transactionHash
              });
            }
            
          } catch (contractError) {
            console.error(`Error checking permissions for ${doctorAddress}:`, contractError);
          }
        }
        
        doctorRequests.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
        
        setAccessRequests(doctorRequests);
        console.log('Pending requests:', doctorRequests);
        
      } catch (error) {
        console.error("Error fetching access requests:", error);
        let errorMessage = "Failed to load access requests";
        
        if (error.message.includes("network")) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes("timeout")) {
          errorMessage = "Request timeout. Please try again.";
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (contract && account && provider) {
      fetchAccessRequests();
      
      const handleAccessRequested = async (doctor, patient, event) => {
        console.log('New AccessRequested event:', { doctor, patient });
        if (patient.toLowerCase() === account.toLowerCase()) {
          setTimeout(() => {
            fetchAccessRequests();
          }, 2000);
        }
      };
      
      const handleAccessApproved = async (doctor, patient, granted, event) => {
        console.log('AccessApproved event:', { doctor, patient, granted });
        if (patient.toLowerCase() === account.toLowerCase()) {
          fetchAccessRequests();
        }
      };
      
      try {
        contract.on("AccessRequested", handleAccessRequested);
        contract.on("AccessApproved", handleAccessApproved);
        
        return () => {
          try {
            contract.off("AccessRequested", handleAccessRequested);
            contract.off("AccessApproved", handleAccessApproved);
          } catch (error) {
            console.warn("Error removing event listeners:", error);
          }
        };
      } catch (error) {
        console.warn("Error setting up event listeners:", error);
      }
    }
  }, [contract, account, provider, token]);

  const handleApproveAccess = async (doctorAddress) => {
    if (!contract) {
      alert("Contract not initialized");
      return;
    }

    try {
      setProcessingAction(doctorAddress);
      
      const gasEstimate = await contract.approveAccess.estimateGas(doctorAddress, true);
      const gasLimit = gasEstimate * 120n / 100n;
      
      const tx = await contract.approveAccess(doctorAddress, true, {
        gasLimit: gasLimit
      });
      
      console.log("Approval transaction:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      
      setAccessRequests(prev => prev.filter(req => req.doctorAddress !== doctorAddress));
      alert("Access approved successfully!");
      
    } catch (error) {
      console.error("Error approving access:", error);
      let errorMessage = "Failed to approve access";
      
      if (error.code === 4001) {
        errorMessage = "Transaction cancelled by user";
      } else if (error.code === -32603) {
        errorMessage = "Transaction failed. Please try again.";
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for gas";
      } else if (error.message.includes("gas")) {
        errorMessage = "Gas estimation failed. Please try again.";
      } else if (error.reason) {
        errorMessage = error.reason;
      }
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRejectAccess = async (doctorAddress) => {
    if (!contract) {
      alert("Contract not initialized");
      return;
    }

    try {
      setProcessingAction(doctorAddress);
      
      const gasEstimate = await contract.approveAccess.estimateGas(doctorAddress, false);
      const gasLimit = gasEstimate * 120n / 100n;
      
      const tx = await contract.approveAccess(doctorAddress, false, {
        gasLimit: gasLimit
      });
      
      console.log("Rejection transaction:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      
      setAccessRequests(prev => prev.filter(req => req.doctorAddress !== doctorAddress));
      alert("Access rejected successfully!");
      
    } catch (error) {
      console.error("Error rejecting access:", error);
      let errorMessage = "Failed to reject access";
      
      if (error.code === 4001) {
        errorMessage = "Transaction cancelled by user";
      } else if (error.code === -32603) {
        errorMessage = "Transaction failed. Please try again.";
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for gas";
      } else if (error.message.includes("gas")) {
        errorMessage = "Gas estimation failed. Please try again.";
      } else if (error.reason) {
        errorMessage = error.reason;
      }
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setProcessingAction(null);
    }
  };

  if (loading) {
    return (
      <div>
        <h3>Pending Access Requests</h3>
        <div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h3>Pending Access Requests</h3>
        <div>
          <h3>Error Loading Requests</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h3>Pending Access Requests</h3>
        <span>{accessRequests.length} pending</span>
      </div>
      
      {accessRequests.length > 0 ? (
        <div>
          {accessRequests.map((request) => (
            <div key={request.id}>
              <div>
                <div>
                  <div>
                    {request.profilePicture ? (
                      <img src={request.profilePicture} alt={request.doctorName} />
                    ) : (
                      <div>👤</div>
                    )}
                  </div>
                  
                  <div>
                    <div>
                      <h4>{request.doctorName}</h4>
                      <span>{request.urgency} priority</span>
                    </div>
                    
                    <p>📋 {request.specialization}</p>
                    <p>🏥 {request.hospital}</p>
                    
                    <div>
                      <p>🕐 Requested: {new Date(request.requestDate).toLocaleDateString()} at {new Date(request.requestDate).toLocaleTimeString()}</p>
                    </div>
                    
                    <p>Address: {request.doctorAddress.slice(0, 20)}...</p>
                  </div>
                </div>
                
                <div>
                  {processingAction === request.doctorAddress ? (
                    <div>
                      <div>Processing...</div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div>
                      <button onClick={() => handleApproveAccess(request.doctorAddress)}>
                        ✓ Approve
                      </button>
                      <button onClick={() => handleRejectAccess(request.doctorAddress)}>
                        ✗ Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <h3>No pending access requests</h3>
          <p>When doctors request access to your medical records, they will appear here.</p>
        </div>
      )}
    </div>
  );
};