import React, { useState, useRef } from 'react';
import axios from 'axios';

const Registration = () => {
  const [name, setName] = useState(''); // Store user name
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

  const verifyFaceEncoding = async (userId, retries = 5, delay = 3000) => {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`Attempt ${i + 1}: Checking user in MongoDB...`);
  
        const response = await axios.get(`http://localhost:4000/api/user/${userId}`);
  
        if (response.data.success && response.data.user.faceEncoding.length > 0) {
          setMessage("Registration successful! Face encoding confirmed in MongoDB.");
          setMessageType('success');
          return;
        } else {
          console.log("User found, but no face encoding yet...");
        }
      } catch (error) {
        console.error("Verification error:", error);
      }
  
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  
    setMessage("Registration completed, but face encoding verification failed.");
    setMessageType('warning');
  };
  
  // Submit Form (Send Data to Backend)
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("Processing registration...");
    setMessageType('info');
    
    // Ensures both name and image are provided.
    if (!name || !image) {
      setMessage("Please provide your name and capture your image");
      return;
    }
    // Prepares a FormData object and appends
    const formData = new FormData();
    formData.append('name', name);
    formData.append('image', image, 'face.jpg');
    
    // Sends a POST request to /api/register
    try {
      const response = await axios.post('http://localhost:4000/api/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setMessage(`Registration successful! User ID: ${response.data.userId}`);
      setName('');
      setImage(null);
      stopCamera();

      // verify the face encoding was stored correctly
      verifyFaceEncoding(response.data.userId);
    } catch (error) {
      console.error("Registration error:", error);
      setMessage(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="registration-container">
      <h2>Bus System Registration</h2>
      
      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-group">
          <label htmlFor="name">Full Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="camera-section">
          <div className="video-container">
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              className="camera-feed"
            ></video>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
          </div>
          
          {image && (
            <div className="preview-container">
              <img 
                src={URL.createObjectURL(image)} 
                alt="Captured" 
                className="image-preview" 
              />
            </div>
          )}
          
          <div className="camera-controls">
            {!streamActive ? (
              <button 
                type="button" 
                onClick={startCamera} 
                className="camera-button"
              >
                Start Camera
              </button>
            ) : (
              <>
                <button 
                  type="button" 
                  onClick={captureImage} 
                  className="camera-button"
                >
                  Capture Image
                </button>
                <button 
                  type="button" 
                  onClick={stopCamera} 
                  className="camera-button secondary"
                >
                  Stop Camera
                </button>
              </>
            )}
          </div>
        </div>
        
        {message && <div className="message">{message}</div>}
        
        <button 
          type="submit" 
          disabled={loading || !image || !name} 
          className="submit-button"
        >
          {loading ? "Processing..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Registration;