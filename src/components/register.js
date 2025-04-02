import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaCamera, FaUserCircle, FaEnvelope, FaLock, FaPhone, FaBus } from 'react-icons/fa';

const Registration = () => {
  const [name, setName] = useState(''); // Store user name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState(null); // Store the captured image
  const [loading, setLoading] = useState(false); // Indicates when the registration is processing
  const [message, setMessage] = useState(''); // Display success/error messages
  const [messageType, setMessageType] = useState(''); // 'success', 'error', or 'info'
  const videoRef = useRef(null); // Reference to the <video> element 
  const canvasRef = useRef(null); // Reference to the <canvas> element (used for capturing images).
  const [streamActive, setStreamActive] = useState(false); // Tracks whether the camera is on
  
  const startCamera = async () => {
    try {
      // Requests camera access from the user.
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setMessage("Camera access failed. Please check permissions.");
    }
  };
  // Stops all video tracks.
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setStreamActive(false);
    }
  };
  // Takes a snapshot of the webcam feed.
  const captureImage = () => {
    if (!streamActive) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob/file
    canvas.toBlob((blob) => {
      setImage(blob);
      setMessage("Image captured! Ready to register.");
    }, 'image/jpeg', 0.95);
  };

  // Submit Form (Send Data to Backend)
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("Processing registration...");
    setMessageType('info');
    
    // Ensures both name and image are provided.
    if (!name || !email || !password || !image) {
      setMessage("All fields are required (phone is optional).");
      setLoading(false);
      return;
    }
    // Prepares a FormData object and appends
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('phone', phone);
    formData.append('image', image, 'face.jpg');
    
    // Sends a POST request to /api/register
    try {
      const response = await axios.post('http://localhost:4000/api/user-register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setMessage(`Registration successful! User ID: ${response.data.userId}`);
      setMessageType('success');
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setImage(null);
      stopCamera();

    } catch (error) {
      console.error("Registration error:", error);
      setMessage(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="registration-page">
      <div className="registration-container">
        <div className="registration-header">
          <Link to="/" className="back-button">
            <FaArrowLeft /> Back to Menu
          </Link>
          <div className="logo-container">
            <FaBus className="logo-icon" />
            <h1 className="logo-text">EasyRide</h1>
          </div>
        </div>

        <div className="registration-card">
          <h2 className="registration-title">Create Your Account</h2>
          <p className="registration-subtitle">Register with face recognition for secure access</p>

          {message && <div className={`message ${messageType}`}>{message}</div>}

          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-group">
              <div className="input-icon">
                <FaUserCircle />
              </div>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Full Name" 
                required 
              />
            </div>

            <div className="form-group">
              <div className="input-icon">
                <FaEnvelope />
              </div>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Email Address" 
                required 
              />
            </div>

            <div className="form-group">
              <div className="input-icon">
                <FaLock />
              </div>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Password" 
                required 
              />
            </div>

            <div className="form-group">
              <div className="input-icon">
                <FaPhone />
              </div>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="Phone Number (Optional)" 
              />
            </div>

            <div className="face-recognition-section">
              <h3 className="section-title">Face Recognition</h3>
              <p className="section-description">Capture your image for secure login</p>
              
              <div className="camera-container">
                <video ref={videoRef} autoPlay muted className={`camera-feed ${streamActive ? 'active' : ''}`}></video>
                {!streamActive && (
                  <div className="camera-placeholder">
                    <FaCamera className="placeholder-icon" />
                    <p>Camera is off</p>
                  </div>
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
              </div>

              {image && (
                <div className="preview-container">
                  <img src={URL.createObjectURL(image)} alt="Captured" className="image-preview" />
                  <p className="preview-label">Your captured image</p>
                </div>
              )}

              <div className="camera-controls">
                {!streamActive ? (
                  <button type="button" onClick={startCamera} className="camera-button">
                    <FaCamera /> Start Camera
                  </button>
                ) : (
                  <div className="button-group">
                    <button type="button" onClick={captureImage} className="camera-button">
                      <FaCamera /> Capture Image
                    </button>
                    <button type="button" onClick={stopCamera} className="camera-button secondary">
                      Stop Camera
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button type="submit" disabled={loading || !image} className="submit-button">
              {loading ? (
                <>
                  <span className="spinner"></span> Processing...
                </>
              ) : (
                'Complete Registration'
              )}
            </button>
          </form>

          <div className="login-redirect">
            Already have an account? <Link to="/login" className="login-link">Sign in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;