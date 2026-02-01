import React, { useState } from "react";
import {
  Send,
  AlertTriangle,
  Heart,
  Clock,
  Loader2,
  Info,
  CheckCircle2,
  Activity
} from "lucide-react";
import { Button } from "./button.jsx";

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTextSubmit = async () => {
    if (!symptoms.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8001/api/process-text",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symptoms }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.analysis) {
        setAnalysis(data.analysis);
      } else {
        throw new Error("No analysis data received");
      }
    } catch (error) {
      console.error(error);
      alert("Error processing symptoms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyStyles = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case "emergency":
        return "bg-danger-50 text-danger-600 border-danger-200";
      case "high":
        return "bg-warning-50 text-warning-600 border-warning-200";
      case "moderate":
        return "bg-primary-50 text-primary-600 border-primary-200";
      case "low":
        return "bg-secondary-50 text-secondary-600 border-secondary-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case "emergency":
      case "high":
        return <AlertTriangle size={20} />;
      case "moderate":
        return <Activity size={20} />;
      case "low":
        return <Clock size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const renderListItems = (
    items,
    defaultMessage = "No information available"
  ) => {
    if (!items) return [defaultMessage];
    if (Array.isArray(items)) return items;
    if (typeof items === "string") return [items];
    return [defaultMessage];
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl mb-4">
          <Activity size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">AI Symptom Checker</h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          Describe your symptoms and get instant AI-powered health insights and recommendations.
        </p>
      </header>

      <section className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">How are you feeling?</label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all min-h-[150px] text-gray-700"
            placeholder="e.g., I have a persistent headache and feel slightly dizzy since this morning..."
          />
        </div>

        <Button 
          onClick={handleTextSubmit} 
          disabled={loading || !symptoms.trim()}
          className="w-full py-4 text-lg"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} /> Analyzing Symptoms...
            </>
          ) : (
            <>
              <Send size={20} /> Analyze Symptoms
            </>
          )}
        </Button>
      </section>

      {analysis && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className={`p-6 rounded-2xl border flex items-center gap-4 ${getUrgencyStyles(analysis.urgency)}`}>
            <div className="p-3 bg-white/50 rounded-xl">
              {getUrgencyIcon(analysis.urgency)}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70">Urgency Level</p>
              <p className="text-xl font-bold">{analysis.urgency || "Not specified"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Info className="text-primary-500" size={20} /> Overview
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {analysis.detailed_description || "No detailed description available."}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="text-warning-500" size={20} /> Possible Conditions
              </h3>
              <ul className="space-y-2">
                {renderListItems(analysis.conditions).map((condition, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-warning-400 rounded-full flex-shrink-0"></span>
                    {condition}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="text-secondary-500" size={20} /> Recommended Tests
              </h3>
              <ul className="space-y-2">
                {renderListItems(analysis.tests).map((test, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-secondary-400 rounded-full flex-shrink-0"></span>
                    {test}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Heart className="text-danger-500" size={20} /> When to Seek Help
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {analysis.when_to_seek_help || "Consult with a healthcare professional for proper evaluation."}
              </p>
            </div>
          </div>

          {(analysis.home_care_tips || analysis.first_aid) && (
            <div className="bg-primary-50 p-8 rounded-2xl border border-primary-100 space-y-4">
              <h3 className="text-xl font-bold text-primary-900">Care Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {analysis.home_care_tips && (
                  <div>
                    <h4 className="font-bold text-primary-800 mb-2">Home Care Tips</h4>
                    <p className="text-primary-700 text-sm leading-relaxed">{analysis.home_care_tips}</p>
                  </div>
                )}
                {analysis.first_aid && analysis.first_aid !== "null" && (
                  <div>
                    <h4 className="font-bold text-primary-800 mb-2">Immediate First Aid</h4>
                    <p className="text-primary-700 text-sm leading-relaxed">{analysis.first_aid}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      <footer className="bg-gray-100 p-6 rounded-xl border border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          <strong className="text-gray-900">Medical Disclaimer:</strong> This tool provides general
          health information only and is not a substitute for professional
          medical advice, diagnosis, or treatment. Always seek the advice of your physician.
        </p>
      </footer>
    </div>
  );
};

export default SymptomChecker;
