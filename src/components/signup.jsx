import React, { useState } from "react";
import axios from "axios";
import Button from "../components/button.jsx";
import Navbar from "./Navbar.jsx";
import { useNavigate, Link } from "react-router-dom";

const SignUpForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    usertype: "",
    gender: "",
    email: "",
    password: "",
    walletAddress:""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate(); 

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!window.ethereum) {
      alert("Please install Metamask!");
      return setLoading(false);
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const wallet = accounts[0];

      const res = await axios.post("http://localhost:5000/api/auth/signup", {
        ...form,
        walletAddress: wallet,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (onSuccess){
        onSuccess(res.data.user);
      } 

      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && form.name && form.usertype && form.gender) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar/>
      
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/3 bg-primary-600 p-10 text-white flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl mb-6">✓</div>
              <h1 className="text-3xl font-bold mb-4">Join Our Platform</h1>
              <p className="text-primary-100">Create your account and connect your wallet to access the future of healthcare.</p>
            </div>

            <div className="space-y-6 mt-12">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-bold">1</div>
                <div className={step === 1 ? "font-bold" : "text-primary-200"}>Personal Info</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-bold">2</div>
                <div className={step === 2 ? "font-bold" : "text-primary-200"}>Account & Wallet</div>
              </div>
            </div>

            <div className="mt-12 pt-12 border-t border-primary-500">
              <p className="text-sm text-primary-200">Already have an account?</p>
              <Link to="/login" className="text-white font-bold hover:underline mt-2 inline-block">Sign In Here</Link>
            </div>
          </div>

          <div className="md:w-2/3 p-10">
            {error && (
              <div className="mb-6 p-4 bg-danger-50 border border-danger-100 text-danger-600 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                  <p className="text-gray-500">Tell us about yourself to get started</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">User Type</label>
                      <select
                        name="usertype"
                        required
                        value={form.usertype}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      >
                        <option value="">Select Type</option>
                        <option value="Patient">Patient</option>
                        <option value="Doctor">Doctor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                      <select
                        name="gender"
                        required
                        value={form.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    onClick={nextStep}
                    className="w-full py-4 mt-8"
                    disabled={!form.name || !form.usertype || !form.gender}
                  >
                    Continue to Next Step
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">Account & Wallet</h3>
                  <p className="text-gray-500">Complete your registration details</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      value={form.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[38px] text-gray-400 hover:text-primary-600"
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>

                  <div className="p-4 bg-primary-50 rounded-xl border border-primary-100 flex items-start gap-4">
                    <div className="text-2xl">🔒</div>
                    <div>
                      <h4 className="font-bold text-primary-900 text-sm">Wallet Connection</h4>
                      <p className="text-xs text-primary-700 mt-1">Your MetaMask wallet will be connected during registration to secure your medical data on the blockchain.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      className="flex-1 py-4"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-[2] py-4"
                      disabled={loading}
                    >
                      {loading ? "Registering..." : "Sign Up with Wallet"}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
