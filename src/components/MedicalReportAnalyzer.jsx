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
  Loader2,
  FileUp
} from "lucide-react";
import { Button } from "./button.jsx";

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
      ? { icon: CheckCircle, color: "text-success-500", bg: "bg-success-50" }
      : { icon: AlertCircle, color: "text-danger-500", bg: "bg-danger-50" };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <header className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl mb-4">
          <FileText size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Medical Report Analyzer</h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          Upload medical reports (PDF or images) for AI-powered analysis and insights.
        </p>
      </header>

      <section
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        className={`relative border-2 border-dashed rounded-3xl p-12 transition-all duration-200 text-center ${
          dragOver 
            ? "border-primary-500 bg-primary-50" 
            : "border-gray-200 bg-white hover:border-primary-300 hover:bg-gray-50"
        }`}
      >
        {file ? (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-4">
                <FileText size={40} />
              </div>
              <p className="text-lg font-bold text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={analyzeReport} disabled={isAnalyzing} className="px-8">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Analyzing...
                  </>
                ) : (
                  <>
                    <Activity size={18} /> Analyze Report
                  </>
                )}
              </Button>

              <Button variant="outline" onClick={clearFile} disabled={isAnalyzing}>
                <X size={18} /> Clear
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mb-4">
                <FileUp size={40} />
              </div>
              <p className="text-xl font-bold text-gray-900">Drop your report here</p>
              <p className="text-gray-500">or click to browse from your computer</p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                Choose File
              </Button>
              <p className="text-xs text-gray-400 mt-4">
                Supported: {supportedFormats.join(", ").toUpperCase()} • Max {maxFileSize}MB
              </p>
            </div>
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
        <div className="p-4 bg-danger-50 border border-danger-100 text-danger-600 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
          <AlertCircle size={20} />
          <span className="font-medium">Error: {error}</span>
        </div>
      )}

      {results && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-6">
              <h3 className="text-2xl font-bold text-gray-900">Analysis Summary</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                <Clock size={14} />
                {new Date(results.analysis_timestamp).toLocaleString()}
              </div>
            </div>
            
            <p className="text-gray-700 leading-relaxed text-lg">{results.summary}</p>

            {results.conditions?.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="text-warning-500" size={20} /> Potential Conditions
                </h4>
                <div className="flex flex-wrap gap-3">
                  {results.conditions.map((condition, index) => (
                    <div key={index} className="px-4 py-2 bg-warning-50 text-warning-700 rounded-xl border border-warning-100 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 bg-warning-500 rounded-full"></span>
                      {condition.replace(/_/g, " ")}
                      {results.keyword_confidence?.[condition] && (
                        <span className="text-xs opacity-70">
                          ({(results.keyword_confidence[condition] * 100).toFixed(0)}%)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {results.lab_details && Object.keys(results.lab_details).length > 0 && (
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 space-y-6">
              <h4 className="text-2xl font-bold text-gray-900">Lab Values Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(results.lab_details).map(([labName, labValue]) => {
                  const status = getLabValueStatus(labValue);
                  const StatusIcon = status.icon;
                  return (
                    <div key={labName} className={`p-4 rounded-2xl border flex items-center justify-between ${status.bg} ${labValue.normal ? 'border-success-100' : 'border-danger-100'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-white rounded-lg ${status.color}`}>
                          <StatusIcon size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{labName.replace(/_/g, " ")}</p>
                          <p className="text-sm text-gray-500">Value: <span className="font-bold text-gray-700">{labValue.value}</span></p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${status.color} bg-white`}>
                        {labValue.status.replace(/_/g, " ")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="p-3 bg-white/10 rounded-xl">
                <AlertCircle className="text-primary-300" size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold mb-2">Medical Disclaimer</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  This AI-powered analysis is for informational purposes only and does not replace professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {isAnalyzing && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary-100 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-primary-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-xl font-bold text-gray-900">Processing your medical report...</p>
          <p className="text-gray-500">Our AI is analyzing your data for insights</p>
        </div>
      )}
    </div>
  );
};

export default MedicalReportAnalyzer;
