import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./button.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import axios from "axios";
import Navbar from "./Navbar.jsx";

const SignInForm = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await axios.post("http://localhost:5000/api/auth/signin", form);
      localStorage.setItem("token", res.data.token);
      login(res.data.user);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      
      <div>
        <div>
          <div>
            <div>👤</div>
            <h1>Welcome Back</h1>
            <p>Sign in to your account to continue</p>
          </div>

          {error && (
            <div>
              <p>{error}</p>
            </div>
          )}

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
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;