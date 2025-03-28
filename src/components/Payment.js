import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Camera.css';
import { Link } from 'react-router-dom';

const Payment= () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [message, setMessage] = useState('');
  const [streamActive, setStreamActive] = useState(false);
  const [user, setUser] = useState(null);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const ticketPrice = 2.50; // Fixed ticket price for all routes

  useEffect(() => {
    // Retrieve the selected route data from localStorage
    const storedRoute = localStorage.getItem('selectedRoute');
    if (storedRoute) {
      setSelectedRoute(JSON.parse(storedRoute));
    }
  }, []);

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
          setMessage(`✅ User Found: ${response.data.userName}, €${response.data.balance}`);
          setUser(response.data);
          setIsPaymentConfirmed(false);
        } else {
          setMessage("❌ User Not Found. Please register.");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setMessage("⚠️ Error verifying face.");
      }
    }, "image/jpeg", 0.95);
  };

  const handleConfirmPayment = async () => {
    if (!user || !selectedRoute) return;

    const paymentData = {
        userId: user.userId,
        ticketPrice: 2.50, // Fixed price
        routeDetails: {
          route_id: selectedRoute.route_id,
          route_long_name: selectedRoute.route_long_name || selectedRoute.name,
          route_short_name: selectedRoute.route_short_name || selectedRoute.shortName,
          path: selectedRoute.path // Include if available
        }
      };
  
    try {
      const paymentResponse = await axios.post("http://localhost:4000/pay-with-face", paymentData);

      if (paymentResponse.data.success) {
        setMessage(`✅ Payment Successful! Remaining Balance: €${paymentResponse.data.remainingBalance}`);
        setIsPaymentConfirmed(true);
      } else {
        setMessage(`❌ Payment Failed: ${paymentResponse.data.message}`);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400 && error.response.data.message === "Insufficient balance") {
          setMessage("⚠️ You don't have enough funds to complete the payment.");
        } else {
          setMessage(`⚠️ Error: ${error.response.data.message || "Something went wrong"}`);
        }
      } else if (error.request) {
        setMessage("⚠️ No response from the server.");
      } else {
        setMessage(`⚠️ Error: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (streamActive) verifyFace();
    }, 5000);
    return () => clearInterval(interval);
  }, [streamActive]);

  return (
    <div className='cameraPage'>
      <div className="checkout-container">
        <div className="summary-section">
          <h2>Bus Ticket Summary</h2>
          <Link to="/search" className="back-to-timetable">← Back to Search</Link>
          {selectedRoute && (
            <table className="bus-details">
              <tbody>
                <tr><td><strong>Route Number:</strong></td><td>{selectedRoute.route_short_name}</td></tr>
                <tr><td><strong>Route Name:</strong></td><td>{selectedRoute.route_id}</td></tr>
                <tr><td><strong>Stops:</strong></td><td>
                  {selectedRoute.path?.map((point, index) => (
                    <span key={index}>
                      {point.name}{index < selectedRoute.path.length - 1 ? ' → ' : ''}
                    </span>
                  ))}
                </td></tr>
                <tr><td><strong>Price:</strong></td><td>€{ticketPrice.toFixed(2)}</td></tr>
              </tbody>
            </table>
          )}
        </div>
        
        <div className="camera-section">
          <h2>Face Recognition</h2>
          <div className="camera-wrapper">
            <video ref={videoRef} autoPlay className="camera-feed"></video>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
          </div>
          <p className="message">{message}</p>
        </div>
        
        {user && (
          <div className="payment-section">
            <h2>Confirm Payment</h2>
            <table className="user-info">
              <tbody>
                <tr><td><strong>👤 User:</strong></td><td>{user.userName}</td></tr>
                <tr><td><strong>💳 Balance:</strong></td><td>€{user.balance}</td></tr>
                <tr><td><strong>💶 Ticket Price:</strong></td><td>€{ticketPrice.toFixed(2)}</td></tr>
                <tr><td><strong>💰 New Balance:</strong></td><td>€{(user.balance - ticketPrice).toFixed(2)}</td></tr>
              </tbody>
            </table>
            <button 
              className="confirm-btn" 
              onClick={handleConfirmPayment}
              disabled={isPaymentConfirmed}
            >
              {isPaymentConfirmed ? 'Payment Confirmed' : 'Confirm Payment'}
            </button>
          </div>
        )}
        
        <div className="button-group">
          {!streamActive ? (
            <button className="start-btn" onClick={startCamera}>Start Camera</button>
          ) : (
            <>
              <button className="verify-btn" onClick={verifyFace}>Verify Face</button>
              <button className="stop-btn" onClick={stopCamera}>Stop Camera</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;