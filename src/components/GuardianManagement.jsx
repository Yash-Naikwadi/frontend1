import { Plus, X, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useMediChain } from "../context/BlockChainContext";
import { ethers } from "ethers";
import guardianAbi from "../abis/GuardianAbi.json";
import medVaultAbi from "../abis/MedVaultAbi.json";

const GuardianManagement = () => {
  const { account, provider } = useMediChain();

  const [guardians, setGuardians] = useState([]);
  const [newGuardian, setNewGuardian] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [patientAddress, setPatientAddress] = useState("");
  const [isGuardianForPatient, setIsGuardianForPatient] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);
  const [emergencyActive, setEmergencyActive] = useState(false);

  const [guardianContract, setGuardianContract] = useState(null);
  const [medVaultContract, setMedVaultContract] = useState(null);
  const [contractInitialized, setContractInitialized] = useState(false);

  useEffect(() => {
    const initContracts = async () => {
      if (!provider || !account) {
        setContractInitialized(false);
        return;
      }

      try {
        const signer = await provider.getSigner();

        const guardian = new ethers.Contract(
          "0x317809481694FA03014b511657bFFFFf7157dBf3",
          guardianAbi,
          signer
        );

        const medVault = new ethers.Contract(
          "0x652c5Ae2b16B0717F5B0D2f95C9eA2ad2D96b973",
          medVaultAbi,
          signer
        );

        await guardian.getGuardians(account);

        setGuardianContract(guardian);
        setMedVaultContract(medVault);
        setContractInitialized(true);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Contract connection failed");
        setContractInitialized(false);
      }
    };

    initContracts();
  }, [provider, account]);

  const addGuardian = () => {
    if (!ethers.isAddress(newGuardian)) {
      setError("Invalid Ethereum address");
      return;
    }
    if (guardians.includes(newGuardian)) {
      setError("Guardian already added");
      return;
    }
    if (newGuardian.toLowerCase() === account.toLowerCase()) {
      setError("Cannot add yourself as guardian");
      return;
    }
    if (guardians.length >= 10) {
      setError("Maximum 10 guardians allowed");
      return;
    }

    setGuardians([...guardians, newGuardian]);
    setNewGuardian("");
    setError("");
  };

  const assignGuardians = async () => {
    if (!guardianContract || guardians.length < 2) {
      setError("Minimum 2 guardians required");
      return;
    }

    try {
      setLoading(true);
      const tx = await guardianContract.assignGuardians(guardians, {
        gasLimit: 500000,
      });
      await tx.wait();
      alert("Guardians assigned successfully!");
    } catch (err) {
      console.error(err);
      setError("Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div>
        <h2>Guardian Management</h2>
        <p>Please connect your wallet to manage guardians.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Guardian Management</h2>

      {/* GUARDIANS */}
      <section>
        <h3>Your Guardians</h3>
        <p>Manage who can unlock your records in emergencies</p>

        <input
          type="text"
          value={newGuardian}
          onChange={(e) => setNewGuardian(e.target.value)}
          placeholder="Guardian wallet address"
          disabled={loading}
        />

        <button onClick={addGuardian} disabled={loading}>
          <Plus size={16} /> Add
        </button>

        {error && <p>{error}</p>}

        <h4>Current Guardians ({guardians.length}/10)</h4>

        {guardians.length > 0 ? (
          <ul>
            {guardians.map((guardian, index) => (
              <li key={index}>
                {guardian}
                <button
                  onClick={() =>
                    setGuardians(guardians.filter((g) => g !== guardian))
                  }
                  disabled={loading}
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No guardians assigned yet</p>
        )}

        <button onClick={assignGuardians} disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={16} /> Processing...
            </>
          ) : (
            "Save Guardians"
          )}
        </button>
      </section>

      {/* EMERGENCY ACCESS */}
      <section>
        <h3>Emergency Unlock</h3>

        <input
          type="text"
          value={patientAddress}
          onChange={(e) => setPatientAddress(e.target.value)}
          placeholder="Patient wallet address"
          disabled={loading}
        />

        <button onClick={() => {}} disabled={loading}>
          Check Status
        </button>

        {patientAddress && !isGuardianForPatient && (
          <p>You are not a guardian for this patient</p>
        )}
      </section>

      {emergencyActive && (
        <section>
          <h4>Emergency Access Active</h4>
          <p>Your records are accessible to guardians</p>

          <button disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} /> Processing...
              </>
            ) : (
              "Revoke Emergency Access"
            )}
          </button>
        </section>
      )}

      {loading && (
        <div>
          <Loader2 size={18} /> Processing...
        </div>
      )}
    </div>
  );
};

export default GuardianManagement;
