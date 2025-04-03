import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaArrowRight, FaBus,FaArrowLeft } from 'react-icons/fa';
import React from "react";
import '../css/Login.css';
import { Link } from "react-router-dom";

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
        const response = await fetch('http://localhost:4000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);  // ✅ Store userId for later use
            localStorage.setItem('userName', data.userName);
            setToken(data.token);  // Set token state for protected routes
            navigate("/dashboard"); // Redirect to dashboard after login
        } else {
            setError(data.message || "Login failed. Please try again.");
        }
    } catch (err) {
      setError("Network error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Header with logo */}
        <div className="login-header">
            <Link to="/" className="login-back-button">
                <FaArrowLeft /> Back to Menu
            </Link>      
          <FaBus className="logo-icon" />
          <h1 className="logo-text">EasyRide</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="login-form">
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div className="input-group">
            <div className="input-icon">
              <FaUser />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
            />
          </div>

          <div className="input-group">
            <div className="input-icon">
              <FaLock />
            </div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              <>
                Login <FaArrowRight className="button-icon" />
              </>
            )}
          </button>

          <div className="login-footer">
            <p className="register-prompt">
              Don't have an account?{' '}
              <Link to="/register" className="register-link">
                Register now
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;