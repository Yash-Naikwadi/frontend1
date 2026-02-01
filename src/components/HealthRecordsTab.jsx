import {
  Plus,
  Upload,
  FileText,
  Eye,
  Download,
  X,
  Loader2,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useMediChain } from "../context/BlockChainContext";
import {
  uploadEncryptedFile,
  fetchAndDecryptFile,
  createDownloadableUrl,
  downloadFile,
  viewDecryptedImage,
} from "../utils/ipfsUtils";

const HealthRecordsTab = () => {
  const {
    account,
    medicalReports,
    loading,
    uploadReport,
    fetchMedicalReports,
    userHealthID,
  } = useMediChain();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [reportType, setReportType] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("12345678");
  const [uploading, setUploading] = useState(false);
  const [viewingReport, setViewingReport] = useState(null);
  const [decryptedContent, setDecryptedContent] = useState("");
  const [decrypting, setDecrypting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (account && medicalReports.length === 0) {
      fetchMedicalReports();
    }
  }, [account]);

  useEffect(() => {
    if (account && !encryptionKey) {
      setEncryptionKey(
        `medichain_${account.slice(0, 8)}_${account.slice(-8)}`
      );
    }
  }, [account]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !reportType || !encryptionKey) {
      alert("Please fill in all required fields");
      return;
    }

    if (!userHealthID) {
      alert("You need a HealthID to upload medical records");
      return;
    }

    try {
      setUploading(true);

      const metadata = {
        patientId: userHealthID,
        reportType,
        description: reportDescription,
        timestamp: Date.now(),
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
      };

      const ipfsHash = await uploadEncryptedFile(
        selectedFile,
        encryptionKey,
        metadata
      );

      await uploadReport(ipfsHash);

      setSelectedFile(null);
      setReportType("");
      setReportDescription("");
      setShowUploadModal(false);
      if (fileInputRef.current) fileInputRef.current.value = "";

      alert("Medical record uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload medical record. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadReport = async (ipfsHash, fileName) => {
    try {
      const result = await fetchAndDecryptFile(ipfsHash, "12345678");
      const url = createDownloadableUrl(result.data, result.mimeType);
      downloadFile(url, `${fileName}.${getExtensionFromMime(result.mimeType)}`);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download the report");
    }
  };

  const getExtensionFromMime = (mime) => {
    if (!mime) return "bin";
    if (mime.includes("png")) return "png";
    if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
    if (mime.includes("pdf")) return "pdf";
    if (mime.includes("txt")) return "txt";
    return "bin";
  };

  if (!account) {
    return (
      <div>
        <h2>Health Records</h2>
        <p>Please connect your wallet to view your health records.</p>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h2>Health Records</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          disabled={!userHealthID}
        >
          <Plus size={16} /> Add Record
        </button>
      </div>

      {!userHealthID && (
        <p>
          You need a HealthID to upload medical records. Please contact an
          administrator.
        </p>
      )}

      <div>
        {medicalReports.length === 0 ? (
          <p>No medical records found. Upload your first record.</p>
        ) : (
          medicalReports.map((ipfsHash, index) => (
            <div key={index}>
              <h4>Medical Record #{index + 1}</h4>
              <p>IPFS Hash: {ipfsHash.slice(0, 12)}...</p>

              <button
                onClick={() =>
                  viewDecryptedImage(ipfsHash, "12345678", "image/jpeg")
                }
              >
                <Eye size={16} /> View
              </button>

              <button
                onClick={() =>
                  handleDownloadReport(
                    ipfsHash,
                    `medical_record_${index + 1}`
                  )
                }
              >
                <Download size={16} /> Download
              </button>
            </div>
          ))
        )}
      </div>

      {showUploadModal && (
        <div>
          <h3>Upload Medical Record</h3>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
          />

          {selectedFile && (
            <p>
              Selected: {selectedFile.name} (
              {(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
          )}

          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="">Select type...</option>
            <option>Lab Results</option>
            <option>X-Ray</option>
            <option>Blood Test</option>
            <option>ECG Report</option>
            <option>Prescription</option>
            <option>Medical Scan</option>
            <option>Other</option>
          </select>

          <textarea
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            rows="3"
            placeholder="Description"
          />

          <input
            type="password"
            value={encryptionKey}
            onChange={(e) => setEncryptionKey(e.target.value)}
            placeholder="Encryption key"
          />

          <button onClick={() => setShowUploadModal(false)}>
            Cancel
          </button>

          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? (
              <>
                <Loader2 size={16} /> Uploading...
              </>
            ) : (
              <>
                <Upload size={16} /> Upload
              </>
            )}
          </button>
        </div>
      )}

      {loading && (
        <div>
          <Loader2 size={18} /> Processing...
        </div>
      )}
    </div>
  );
};

export default HealthRecordsTab;
