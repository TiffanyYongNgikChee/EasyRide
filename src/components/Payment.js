import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Camera.css';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaCamera, FaUser, FaWallet, FaBusAlt, FaRoute, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';

const Payment= () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [streamActive, setStreamActive] = useState(false);
  const [user, setUser] = useState(null);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
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
      setMessage('');
      setMessageType('');
    } catch (err) {
      console.error("Camera access error:", err);
      setMessage("Camera access failed. Please check permissions.");
      setMessageType('error');
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
    
    setIsVerifying(true);
    setMessage('Verifying face...');
    setMessageType('info');
    
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
          setMessage(`Verified: ${response.data.userName}`);
          setMessageType('success');
          setUser(response.data);
          setIsPaymentConfirmed(false);
        } else {
          setMessage("User not found. Please register.");
          setMessageType('error');
        }
      } catch (error) {
        console.error("Verification error:", error);
        setMessage("Error verifying face. Please try again.");
        setMessageType('error');
      } finally {
        setIsVerifying(false);
      }
    }, "image/jpeg", 0.95);
  };

  const handleConfirmPayment = async () => {
    if (!user || !selectedRoute) return;
    
    setIsProcessingPayment(true);
    setMessage('Processing payment...');
    setMessageType('info');
    
    const paymentData = {
      userId: user.userId,
      ticketPrice: ticketPrice,
      routeDetails: {
        route_id: selectedRoute.route_id,
        route_long_name: selectedRoute.route_long_name || selectedRoute.name,
        route_short_name: selectedRoute.route_short_name || selectedRoute.shortName,
        path: selectedRoute.path
      }
    };
  
    try {
      const paymentResponse = await axios.post("http://localhost:4000/pay-with-face", paymentData);

      if (paymentResponse.data.success) {
        setMessage(`Payment successful! Remaining balance: €${paymentResponse.data.remainingBalance}`);
        setMessageType('success');
        setIsPaymentConfirmed(true);
        setUser({ ...user, balance: paymentResponse.data.remainingBalance });
      } else {
        setMessage(`Payment failed: ${paymentResponse.data.message}`);
        setMessageType('error');
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400 && error.response.data.message === "Insufficient balance") {
          setMessage("Insufficient funds to complete payment");
        } else {
          setMessage(`Error: ${error.response.data.message || "Payment failed"}`);
        }
      } else if (error.request) {
        setMessage("No response from server. Please try again.");
      } else {
        setMessage(`Error: ${error.message}`);
      }
      setMessageType('error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (streamActive) verifyFace();
    }, 5000);
    return () => clearInterval(interval);
  }, [streamActive]);

  return (
    <div className="payment-page">
      <div className="payment-container">
        {/* Header */}
        <div className="payment-header">
          <Link to="/search" className="back-button">
            <FaArrowLeft /> Back to Search
          </Link>
          <h1 className="payment-title">EasyRide Payment</h1>
        </div>

        <div className="payment-content">
          {/* Left Column - Journey Details */}
          <div className="journey-details">
            <h2 className="section-title">
              <FaBusAlt className="section-icon" /> Journey Summary
            </h2>
            
            {selectedRoute && (
              <div className="journey-card">
                <div className="journey-info">
                  <div className="info-item">
                    <FaBusAlt className="info-icon" />
                    <div>
                      <span className="info-label">Route Number</span>
                      <span className="info-value">{selectedRoute.route_short_name}</span>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <FaRoute className="info-icon" />
                    <div>
                      <span className="info-label">Route Name</span>
                      <span className="info-value">{selectedRoute.route_id}</span>
                    </div>
                  </div>
                  
                  <div className="info-item stops-item">
                    <div className="info-icon">
                      <div className="stop-marker"></div>
                      <div className="stop-line"></div>
                    </div>
                    <div className="stops-list">
                      <span className="info-label">Stops</span>
                      {selectedRoute.path?.map((point, index) => (
                        <div key={index} className="stop-item">
                          <span className="stop-name">{point.name}</span>
                          {index < selectedRoute.path.length - 1 && (
                            <div className="stop-arrow">→</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="price-display">
                    <FaMoneyBillWave className="price-icon" />
                    <div>
                      <span className="price-label">Ticket Price</span>
                      <span className="price-value">€{ticketPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Camera and Payment */}
          <div className="payment-process">
            {/* Camera Section */}
            <div className="camera-section">
              <h2 className="section-title">
                <FaCamera className="section-icon" /> Face Verification
              </h2>
              
              <div className={`camera-container ${streamActive ? 'active' : ''}`}>
                <video ref={videoRef} autoPlay muted className="camera-feed"></video>
                {!streamActive && (
                  <div className="camera-placeholder">
                    <FaCamera className="placeholder-icon" />
                    <p>Camera is off</p>
                  </div>
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
              </div>
              
              <div className="camera-controls">
                {!streamActive ? (
                  <button 
                    onClick={startCamera} 
                    className="camera-button primary"
                    disabled={isVerifying || isProcessingPayment}
                  >
                    <FaCamera /> Start Camera
                  </button>
                ) : (
                  <div className="button-group">
                    <button 
                      onClick={verifyFace} 
                      className="camera-button primary"
                      disabled={isVerifying || isProcessingPayment}
                    >
                      {isVerifying ? 'Verifying...' : 'Verify Face'}
                    </button>
                    <button 
                      onClick={stopCamera} 
                      className="camera-button secondary"
                      disabled={isVerifying || isProcessingPayment}
                    >
                      Stop Camera
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            {message && (
              <div className={`message ${messageType}`}>
                {messageType === 'success' && <FaCheckCircle className="message-icon" />}
                {message}
              </div>
            )}

            {/* Payment Section */}
            {user && (
              <div className="user-payment-section">
                <h2 className="section-title">
                  <FaWallet className="section-icon" /> Payment Details
                </h2>
                
                <div className="user-card">
                  <div className="user-info">
                    <div className="info-item">
                      <FaUser className="info-icon" />
                      <div>
                        <span className="info-label">User</span>
                        <span className="info-value">{user.userName}</span>
                      </div>
                    </div>
                    
                    <div className="info-item">
                      <FaWallet className="info-icon" />
                      <div>
                        <span className="info-label">Current Balance</span>
                        <span className="info-value">€{user.balance}</span>
                      </div>
                    </div>
                    
                    <div className="info-item">
                      <FaMoneyBillWave className="info-icon" />
                      <div>
                        <span className="info-label">Ticket Price</span>
                        <span className="info-value">€{ticketPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="info-item">
                      <FaWallet className="info-icon" />
                      <div>
                        <span className="info-label">New Balance</span>
                        <span className="info-value highlight">
                          €{(user.balance - ticketPrice).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleConfirmPayment} 
                    className="payment-button"
                    disabled={isPaymentConfirmed || isProcessingPayment || isVerifying}
                  >
                    {isProcessingPayment ? (
                      <>
                        <span className="spinner"></span> Processing...
                      </>
                    ) : isPaymentConfirmed ? (
                      <>
                        <FaCheckCircle /> Payment Confirmed
                      </>
                    ) : (
                      'Confirm Payment'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;