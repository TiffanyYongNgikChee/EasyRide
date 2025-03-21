import { useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import '../css/Login.css';

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.userName);
        setToken(data.token);  // Set token state for protected routes
        navigate("/dashboard"); // Redirect to dashboard after login
    } else {
        setError(data.message);
    }
};

  return (
    <div className="login-page-container">
        <div className="login-box">
            <h2 className="login-box-heading">Login</h2>
            {error && <p className="login-error-message">{error}</p>}
            <form onSubmit={handleLogin}>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                required
            />
            <button type="submit" className="login-button">
                Login
            </button>
            </form>
            <p className="register-link">
                Don't have an account? <a href="/register" className="text-blue-500 hover:underline">Register now</a>
            </p>
        </div>
    </div>
  );
};

export default Login;
