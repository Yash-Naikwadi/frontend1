import React, { useState } from "react";
import axios from "axios";
import Button from "../components/button.jsx";
import Navbar from "./Navbar.jsx";
import { useNavigate } from "react-router-dom";

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
    <div>
      <Navbar/>
      
      <div>
        <div>
          <div>
            <div>✓</div>
            <h1>Join Our Platform</h1>
            <p>Create your account and connect your wallet</p>
          </div>

          <div>
            <div>
              <div>
                <span>1</span>
              </div>
              <div></div>
              <div>
                <span>2</span>
              </div>
            </div>
          </div>

          {error && (
            <div>
              <p>{error}</p>
            </div>
          )}

          {step === 1 && (
            <div>
              <div>
                <h3>Personal Information</h3>
                <p>Tell us about yourself</p>
              </div>

              <div>
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <div>
                  <label>User Type</label>
                  <select
                    name="usertype"
                    required
                    value={form.usertype}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option>Patient</option>
                    <option>Doctor</option>
                  </select>
                </div>

                <div>
                  <label>Gender</label>
                  <select
                    name="gender"
                    required
                    value={form.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={nextStep}
                disabled={!form.name || !form.usertype || !form.gender}
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <div>
                <h3>Account & Wallet</h3>
                <p>Complete your registration</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div>
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label>Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <div>
                  <div>
                    <div>🔒</div>
                    <div>
                      <h4>Wallet Connection</h4>
                      <p>Your MetaMask wallet will be connected during registration</p>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={prevStep}
                  >
                    Back
                  </button>
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Registering..." : "Sign Up with Wallet"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div>
          <div>
            <div>
              <div>👥</div>
              <div>
                <h4>For Patients</h4>
                <p>Secure health records</p>
              </div>
            </div>
          </div>
          
          <div>
            <div>
              <div>✓</div>
              <div>
                <h4>For Doctors</h4>
                <p>Professional tools</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;