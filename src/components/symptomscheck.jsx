import React, { useState } from "react";
import {
  Send,
  AlertTriangle,
  Heart,
  Clock,
  Loader2,
} from "lucide-react";

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

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case "emergency":
        return "emergency";
      case "high":
        return "high";
      case "moderate":
        return "moderate";
      case "low":
        return "low";
      default:
        return "default";
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case "emergency":
      case "high":
        return <AlertTriangle size={18} />;
      case "moderate":
        return <Heart size={18} />;
      case "low":
        return <Clock size={18} />;
      default:
        return null;
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
    <div>
      <header>
        <h2>AI Symptom Checker</h2>
        <p>
          Describe your symptoms and get instant AI-powered health insights
        </p>
      </header>

      <section>
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Describe your symptoms in detail..."
          rows={4}
        />

        <button onClick={handleTextSubmit} disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={16} /> Analyzing...
            </>
          ) : (
            <>
              <Send size={16} /> Analyze Symptoms
            </>
          )}
        </button>
      </section>

      {analysis && (
        <section>
          <div>
            {getUrgencyIcon(analysis.urgency)}
            <strong>
              Urgency Level: {analysis.urgency || "Not specified"}
            </strong>
          </div>

          <h3>Symptom Analysis</h3>

          {analysis.detailed_description && (
            <div>
              <h4>Overview</h4>
              <p>{analysis.detailed_description}</p>
            </div>
          )}

          <div>
            <h4>Possible Conditions</h4>
            <ul>
              {renderListItems(analysis.conditions).map(
                (condition, index) => (
                  <li key={index}>{condition}</li>
                )
              )}
            </ul>
          </div>

          <div>
            <h4>Possible Causes</h4>
            <ul>
              {renderListItems(analysis.possible_causes).map(
                (cause, index) => (
                  <li key={index}>{cause}</li>
                )
              )}
            </ul>
          </div>

          <div>
            <h4>Recommended Tests</h4>
            <ul>
              {renderListItems(analysis.tests).map((test, index) => (
                <li key={index}>{test}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4>When to Seek Help</h4>
            <p>
              {analysis.when_to_seek_help ||
                "Consult with a healthcare professional for proper evaluation"}
            </p>
          </div>

          {analysis.home_care_tips && (
            <div>
              <h4>Home Care Tips</h4>
              <p>{analysis.home_care_tips}</p>
            </div>
          )}

          {analysis.first_aid && analysis.first_aid !== "null" && (
            <div>
              <h4>Immediate First Aid</h4>
              <p>{analysis.first_aid}</p>
            </div>
          )}
        </section>
      )}

      <footer>
        <p>
          <strong>Medical Disclaimer:</strong> This tool provides general
          health information only and is not a substitute for professional
          medical advice.
        </p>
      </footer>
    </div>
  );
};

export default SymptomChecker;
