import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Button } from "./button.jsx";

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
    <div className="relative overflow-hidden bg-white pt-16 pb-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-400 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            {content.title}
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            {content.subtitle}
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {content.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-semibold border border-primary-100">
                <span className="text-primary-500">✓</span>
                {feature}
              </div>
            ))}
          </div>

          <Link to={content.route}>
            <Button className="px-10 py-4 text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
              {content.cta}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export const FeaturesGrid = ({ userType }) => {
  const patientFeatures = [
    { title: "AI Health Assistant", description: "Multilingual symptom checker with intelligent disease prediction", icon: "🤖" },
    { title: "Secure Health Vault", description: "Your medical records encrypted and stored on blockchain", icon: "🔒" },
    { title: "Early Detection", description: "AI-powered analysis of X-rays, MRIs, and lab reports", icon: "🔍" },
    { title: "Health Passport", description: "Universal health identity as a secure digital passport", icon: "🆔" }
  ];

  const doctorFeatures = [
    { title: "Patient Management", description: "Secure access to patient records with permission-based system", icon: "👥" },
    { title: "AI Diagnostics", description: "Advanced AI models to assist in medical diagnosis", icon: "🧠" },
    { title: "Blockchain Security", description: "Tamper-proof medical records with complete audit trail", icon: "⛓️" },
    { title: "Smart Analytics", description: "Real-time insights and health trend analysis", icon: "📈" }
  ];

  const features = userType === 'patient' ? patientFeatures : doctorFeatures;

  return (
    <div className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {userType === 'patient' ? 'Empowering Your Health Journey' : 'Advanced Medical Tools'}
          </h2>
          <p className="text-gray-600">
            {userType === 'patient' 
              ? 'Experience the future of healthcare with AI-powered insights and blockchain security'
              : 'Leverage cutting-edge technology to provide better patient care and outcomes'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-200">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
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
    <div className="py-20 bg-primary-600 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold mb-2">{stat.number}</div>
              <div className="text-primary-100 font-medium uppercase tracking-wider text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CTASection = ({ userType }) => {
  return (
    <div className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {userType === 'patient' ? 'Take Control of Your Health Today' : 'Join the Medical Revolution'}
            </h2>
            <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
              {userType === 'patient' 
                ? 'Start your journey towards better health with AI-powered insights and secure data management'
                : 'Enhance your practice with advanced AI tools and secure patient data management'
              }
            </p>
            <Button variant="secondary" className="px-10 py-4 text-lg bg-white text-primary-600 hover:bg-primary-50 border-none">
              {userType === 'patient' ? 'Get Started Free' : 'Request Demo'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-2xl font-bold text-white">
              <span className="text-3xl">🩺</span> MedLink AI
            </div>
            <p className="text-gray-400 leading-relaxed">
              Revolutionizing healthcare with AI and blockchain technology. Providing secure, accessible, and intelligent medical solutions for everyone.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Platform</h3>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-primary-400 transition-colors">AI Diagnosis</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Health Records</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Symptom Checker</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Support</h3>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-primary-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Legal</h3>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">HIPAA Compliance</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">&copy; 2026 MedLink AI. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Twitter</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
