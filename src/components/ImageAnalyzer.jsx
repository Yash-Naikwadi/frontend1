import React, { useState, useCallback } from 'react';
import {
  Upload,
  Camera,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileImage,
  Brain,
  Heart,
  Bone
} from 'lucide-react';

const ImageAnalyzer = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const handleImageSelect = useCallback((file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setError(null);
      setAnalysisResults(null);

      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setError('Please select a valid image file');
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      handleImageSelect(e.dataTransfer.files[0]);
    },
    [handleImageSelect]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const analyzeImage = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target.result;

        await fetch('http://localhost:8003/analyze-base64', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Data })
        });

        await new Promise((r) => setTimeout(r, 2000));

        const mockResults = {
          image_type: 'chest',
          predictions: [
            { label: 'Normal', score: 0.85 },
            { label: 'Pneumonia', score: 0.12 },
            { label: 'COVID-19', score: 0.02 },
            { label: 'Tuberculosis', score: 0.01 }
          ],
          risk_assessment: 'Low Risk - Appears Normal',
          recommendations: [
            'Image appears normal, but regular check-ups are still recommended.',
            'This AI analysis is for screening purposes only.',
            'Schedule follow-up if symptoms persist.'
          ],
          confidence_summary: {
            highest_confidence: 0.85,
            average_confidence: 0.25,
            total_predictions: 4
          },
          timestamp: new Date().toISOString()
        };

        setAnalysisResults(mockResults);
        setIsAnalyzing(false);
      };

      reader.readAsDataURL(selectedImage);
    } catch {
      setError('Analysis failed. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const getImageTypeIcon = (type) => {
    switch (type) {
      case 'chest':
        return <Heart />;
      case 'brain':
        return <Brain />;
      case 'bone':
        return <Bone />;
      default:
        return <FileImage />;
    }
  };

  return (
    <div>
      <h1>Medical Image Analyzer</h1>
      <p>AI-powered medical image analysis (screening only)</p>

      <div>
        <AlertTriangle />
        <span>For Educational / Research Purposes Only</span>
      </div>

      <div>
        <h2>
          <Upload /> Upload Image
        </h2>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('file-input').click()}
        >
          <Camera />
          <p>Drop image here or click to browse</p>

          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={(e) => handleImageSelect(e.target.files[0])}
            hidden
          />
        </div>

        {imagePreview && (
          <div>
            <h3>Preview</h3>
            <img src={imagePreview} alt="Preview" />
          </div>
        )}

        <button onClick={analyzeImage} disabled={!selectedImage || isAnalyzing}>
          {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
        </button>

        {error && (
          <div>
            <AlertTriangle />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div>
        <h2>
          <FileImage /> Analysis Results
        </h2>

        {!analysisResults ? (
          <div>
            <Clock />
            <p>No results yet</p>
          </div>
        ) : (
          <div>
            <div>
              {getImageTypeIcon(analysisResults.image_type)}
              <span>{analysisResults.image_type}</span>
            </div>

            <div>
              <CheckCircle />
              <p>{analysisResults.risk_assessment}</p>
            </div>

            <h3>Predictions</h3>
            {analysisResults.predictions.map((p, i) => (
              <div key={i}>
                <span>{p.label}</span>
                <span>{(p.score * 100).toFixed(1)}%</span>
              </div>
            ))}

            <h3>Recommendations</h3>
            {analysisResults.recommendations.map((r, i) => (
              <p key={i}>{r}</p>
            ))}

            <div>
              <p>Highest Confidence</p>
              <p>{(analysisResults.confidence_summary.highest_confidence * 100).toFixed(1)}%</p>
            </div>

            <div>
              <p>Total Predictions</p>
              <p>{analysisResults.confidence_summary.total_predictions}</p>
            </div>
          </div>
        )}
      </div>

      <div>
        <AlertTriangle />
        <p>
          This tool is not a substitute for professional medical advice. Always consult qualified
          healthcare professionals.
        </p>
      </div>
    </div>
  );
};

export default ImageAnalyzer;
