import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

const Camera = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [message, setMessage] = useState('');
  const [streamActive, setStreamActive] = useState(false);
  const [user, setUser] = useState(null);
  const [ticketPrice, setTicketPrice] = useState(17.50); // Example ticket price
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setStreamActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setMessage("Camera access failed. Check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setStreamActive(false);
    }
  };

  const verifyFace = async () => {
    if (!streamActive) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("image", blob, "face.jpg");
      
      try {
        const response = await axios.post("http://localhost:4000/api/verify-face", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        
        if (response.data.match) {
          setUser({
            userId: response.data.userId,
            userName: response.data.userName,
          });
          setMessage(`✅ Face Verified! Welcome, ${response.data.userName}`);
          // Proceed to automatic payment after verification
          handlePayment(response.data.userId);
          
        } else {
          setMessage("❌ User Not Found. Please register.");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setMessage("⚠️ Error verifying face.");
      }
    }, "image/jpeg", 0.95);
  };

  // 💳 Handle Payment after Face Verification
  const handlePayment = async (userId) => {
    try {
      const response = await axios.post("http://localhost:4000/pay-with-face", {
        userId,
        ticketPrice
      });

      if (response.status === 200) {
        setMessage(`✅ Payment Successful! New Balance: $${response.data.remainingBalance}`);
      } else {
        alert(`❌ Payment Failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setMessage("⚠️ Payment processing error.");
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (streamActive) verifyFace();
    }, 5000); // Auto-check every 5 seconds
    return () => clearInterval(interval);
  }, [streamActive]);

  return (
    <div className="ticket-purchase-container">
      <h2>Buy Your Ticket with Face Recognition</h2>
      <video ref={videoRef} autoPlay className="camera-feed"></video>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      <p>{message}</p>

      {user && (
        <div className="user-info">
          <p><strong>👤 User:</strong> {user.userName}</p>
          <p><strong>💳 Ticket Price:</strong> ${ticketPrice}</p>
        </div>
      )}

      {!streamActive ? (
        <button onClick={startCamera}>Start Camera</button>
      ) : (
        <>
          <button onClick={verifyFace}>Verify Face & Pay</button>
          <button onClick={stopCamera}>Stop Camera</button>
        </>
      )}
    </div>
  );
};

export default Camera;
