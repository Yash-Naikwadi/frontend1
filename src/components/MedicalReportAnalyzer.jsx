import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  X,
} from "lucide-react";

const MedicalReportAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const supportedFormats = ["pdf", "png", "jpg", "jpeg", "tiff", "bmp"];
  const maxFileSize = 16;
  const apiUrl = "http://localhost:8002";

  const handleFileSelect = (selectedFile) => {
    setError(null);
    setResults(null);

    const fileExtension = selectedFile.name.split(".").pop().toLowerCase();
    if (!supportedFormats.includes(fileExtension)) {
      setError(
        `File type not supported. Please upload: ${supportedFormats.join(
          ", "
        ).toUpperCase()}`
      );
      return;
    }

    if (selectedFile.size > maxFileSize * 1024 * 1024) {
      setError(`File size too large. Maximum size is ${maxFileSize}MB`);
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const analyzeReport = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${apiUrl}/analyze`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed");

      setResults(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setResults(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getLabValueStatus = (labValue) =>
    labValue.normal
      ? { icon: CheckCircle }
      : { icon: AlertCircle };

  return (
    <div>
      <header>
        <h2>Medical Report Analyzer</h2>
        <p>
          Upload medical reports (PDF or images) for AI-powered analysis.
        </p>
      </header>

      <section
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
      >
        {file ? (
          <div>
            <FileText size={20} />
            <p>{file.name}</p>
            <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>

            <button onClick={analyzeReport} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Activity size={16} /> Analyzing...
                </>
              ) : (
                <>
                  <Upload size={16} /> Analyze Report
                </>
              )}
            </button>

            <button onClick={clearFile}>
              <X size={16} /> Clear
            </button>
          </div>
        ) : (
          <div>
            <p>Drop your medical report here or click to browse</p>
            <p>
              Supported formats:{" "}
              {supportedFormats.join(", ").toUpperCase()}
            </p>
            <p>Maximum file size: {maxFileSize}MB</p>

            <button onClick={() => fileInputRef.current?.click()}>
              Choose File
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) =>
            e.target.files && handleFileSelect(e.target.files[0])
          }
          accept={supportedFormats.map((f) => `.${f}`).join(",")}
          hidden
        />
      </section>

      {error && (
        <div>
          <AlertCircle size={18} />
          <strong>Error:</strong> {error}
        </div>
      )}

      {results && (
        <section>
          <h3>Analysis Summary</h3>
          <p>{results.summary}</p>

          <p>
            <Clock size={14} />{" "}
            {new Date(results.analysis_timestamp).toLocaleString()}
          </p>

          {results.conditions?.length > 0 && (
            <>
              <h4>Potential Conditions</h4>
              <ul>
                {results.conditions.map((condition, index) => (
                  <li key={index}>
                    {condition.replace(/_/g, " ")}{" "}
                    {results.keyword_confidence?.[condition] && (
                      <>
                        (
                        {(
                          results.keyword_confidence[condition] * 100
                        ).toFixed(0)}
                        %)
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}

          {results.lab_details &&
            Object.keys(results.lab_details).length > 0 && (
              <>
                <h4>Lab Values</h4>
                <ul>
                  {Object.entries(results.lab_details).map(
                    ([labName, labValue]) => {
                      const StatusIcon = getLabValueStatus(labValue).icon;
                      return (
                        <li key={labName}>
                          <StatusIcon size={14} />
                          <strong>
                            {labName.replace(/_/g, " ")}:
                          </strong>{" "}
                          {labValue.value} (
                          {labValue.status.replace(/_/g, " ")})
                        </li>
                      );
                    }
                  )}
                </ul>
              </>
            )}

          <div>
            <AlertCircle size={14} />
            <strong> Medical Disclaimer:</strong> This analysis is for
            informational purposes only and does not replace professional
            medical advice.
          </div>
        </section>
      )}

      {isAnalyzing && (
        <div>
          <Loader2 size={18} />
          Processing your medical report...
        </div>
      )}
    </div>
  );
};

export default MedicalReportAnalyzer;
