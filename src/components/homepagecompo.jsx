import React, { useState } from 'react';
import { Link } from "react-router-dom";

export const HeroSection = ({ userType }) => {
  const heroContent = {
    patient: {
      title: "Your Health, Your Control",
      subtitle: "AI-powered early disease detection with complete privacy and control over your medical data",
      cta: "Start Health Assessment",
      features: ["AI Symptom Checker", "Secure Health Records", "Early Disease Detection"],
      route: "/pat-dashboard"
    },
    doctor: {
      title: "Advanced Medical Intelligence",
      subtitle: "Access AI-powered diagnostics and secure patient records with blockchain-verified permissions",
      cta: "Access Doctor Portal",
      features: ["AI-Assisted Diagnosis", "Secure Patient Access", "Analytics Dashboard"],
      route: "/doc-dashboard"
    }
  };

  const content = heroContent[userType];
  if (!content) return null;

  return (
    <div>
      <div>
        <div>
          <h1>{content.title}</h1>
          <p>{content.subtitle}</p>

          <div>
            {content.features.map((feature, index) => (
              <div key={index}>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <Link to={content.route}>
            <button>{content.cta}</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export const FeaturesGrid = ({ userType }) => {
  const patientFeatures = [
    { title: "AI Health Assistant", description: "Multilingual symptom checker with intelligent disease prediction" },
    { title: "Secure Health Vault", description: "Your medical records encrypted and stored on blockchain" },
    { title: "Early Detection", description: "AI-powered analysis of X-rays, MRIs, and lab reports" },
    { title: "Health Passport", description: "Universal health identity as a secure digital passport" }
  ];

  const doctorFeatures = [
    { title: "Patient Management", description: "Secure access to patient records with permission-based system" },
    { title: "AI Diagnostics", description: "Advanced AI models to assist in medical diagnosis" },
    { title: "Blockchain Security", description: "Tamper-proof medical records with complete audit trail" },
    { title: "Smart Analytics", description: "Real-time insights and health trend analysis" }
  ];

  const features = userType === 'patient' ? patientFeatures : doctorFeatures;

  return (
    <div>
      <div>
        <div>
          <h2>{userType === 'patient' ? 'Empowering Your Health Journey' : 'Advanced Medical Tools'}</h2>
          <p>
            {userType === 'patient' 
              ? 'Experience the future of healthcare with AI-powered insights and blockchain security'
              : 'Leverage cutting-edge technology to provide better patient care and outcomes'
            }
          </p>
        </div>

        <div>
          {features.map((feature, index) => (
            <div key={index}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const StatsSection = ({ userType }) => {
  const patientStats = [
    { number: '99.2%', label: 'Accuracy Rate' },
    { number: '24/7', label: 'AI Availability' },
    { number: '100%', label: 'Data Privacy' },
    { number: '50+', label: 'Languages Supported' }
  ];

  const doctorStats = [
    { number: '10,000+', label: 'Patients Served' },
    { number: '95%', label: 'Diagnostic Accuracy' },
    { number: '50%', label: 'Time Saved' },
    { number: '100%', label: 'Secure Access' }
  ];

  const stats = userType === 'patient' ? patientStats : doctorStats;

  return (
    <div>
      <div>
        <div>
          {stats.map((stat, index) => (
            <div key={index}>
              <div>
                <div>{stat.number}</div>
                <div>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CTASection = ({ userType }) => {
  return (
    <div>
      <div>
        <h2>{userType === 'patient' ? 'Take Control of Your Health Today' : 'Join the Medical Revolution'}</h2>
        <p>
          {userType === 'patient' 
            ? 'Start your journey towards better health with AI-powered insights and secure data management'
            : 'Enhance your practice with advanced AI tools and secure patient data management'
          }
        </p>
        <button>{userType === 'patient' ? 'Get Started Free' : 'Request Demo'}</button>
      </div>
    </div>
  );
};

export const Footer = () => {
  return (
    <footer>
      <div>
        <div>
          <div>
            <div>
              <span>🩺</span>
              <span>MedLink AI</span>
            </div>
            <p>Revolutionizing healthcare with AI and blockchain technology.</p>
          </div>
          
          <div>
            <h3>Platform</h3>
            <ul>
              <li><a href="#">AI Diagnosis</a></li>
              <li><a href="#">Health Records</a></li>
              <li><a href="#">Symptom Checker</a></li>
            </ul>
          </div>
          
          <div>
            <h3>Support</h3>
            <ul>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h3>Legal</h3>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">HIPAA Compliance</a></li>
            </ul>
          </div>
        </div>
        
        <div>
          <p>&copy; 2025 MedLink AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};