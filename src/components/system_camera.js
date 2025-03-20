import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

const Camera = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [message, setMessage] = useState('');
  const [streamActive, setStreamActive] = useState(false);
  const [user, setUser] = useState(null);
  const [ticketPrice, setTicketPrice] = useState(null); // Example ticket price
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false); // State for tracking payment confirmation
  const [selectedBus, setSelectedBus] = useState(null);

  useEffect(() => {
    // Retrieve the selected bus data from localStorage
    const storedBus = localStorage.getItem("selectedBus");
    if (storedBus) {
      setSelectedBus(JSON.parse(storedBus)); // Parse and store in state
    }

    // Retrieve the ticket price from localStorage
    const price = localStorage.getItem("ticketPrice");
    if (price) {
      setTicketPrice(price);
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
          setMessage(`✅ User Found: ${response.data.userName}, ${response.data.balance}`);
          setUser(response.data); // Save user data for later
          setIsPaymentConfirmed(false); // Reset payment confirmation state
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
    if (!user || !selectedBus) return;
    // Convert ticketPrice to a number
    const ticketPriceNum = parseFloat(selectedBus.price);

    const paymentData = {
      userId: user.userId,
      ticketPrice: ticketPriceNum,
      selectedBus, // Sending bus details too
    };
  
    console.log("Payment data being sent:", paymentData); // Log the payment data
  
    try {
      const paymentResponse = await axios.post("http://localhost:4000/pay-with-face", paymentData);

      if (paymentResponse.data.success) {
        // If payment is successful, show success message
        setMessage(`✅ Payment Successful! Remaining Balance: €${paymentResponse.data.remainingBalance}`);
        setIsPaymentConfirmed(true); // Payment confirmed successfully
      } else {
        // Handle general payment failure (non-200 responses from the backend)
        setMessage(`❌ Payment Failed: ${paymentResponse.data.message}`);
      }
    } catch (error) {
      // Handle errors, specifically 'Insufficient balance' or other backend responses
      if (error.response) {
        // If the error has a response (status code 400 or other), handle accordingly
        if (error.response.status === 400 && error.response.data.message === "Insufficient balance") {
          setMessage("⚠️ You don't have enough funds to complete the payment.");
        } else {
          setMessage(`⚠️ Error: ${error.response.data.message || "Something went wrong"}`);
        }
      } else if (error.request) {
        // If no response was received (network error)
        console.error("No response received:", error.request);
        setMessage("⚠️ No response from the server.");
      } else {
        // If the error occurred while setting up the request
        console.error("Error message:", error.message);
        setMessage(`⚠️ Error: ${error.message}`);
      }
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

      {user && !isPaymentConfirmed && (
        <div className="user-info">
          <p><strong>👤 User:</strong> {user.userName}</p>
          <p><strong>💳 Ticket Price:</strong> €{selectedBus.price}</p>
          <button onClick={handleConfirmPayment}>Confirm Payment</button>
        </div>
      )}
      {selectedBus && (
        <div>
          <h2>Selected Bus Details</h2>
          <p><strong>Bus Number:</strong> {selectedBus.number}</p>
          <p><strong>Route:</strong> {selectedBus.route}</p>
          <p><strong>Departure:</strong> {selectedBus.departureTime} from {selectedBus.departureLocation}</p>
          <p><strong>Arrival:</strong> {selectedBus.arrivalTime} at {selectedBus.arrivalLocation}</p>
          <p><strong>Price:</strong> €{selectedBus.price}</p>
        </div>
      )}

      {!streamActive ? (
        <button onClick={startCamera}>Start Camera</button>
      ) : (
        <>
          <button onClick={verifyFace}>Verify Face & Check Balance</button>
          <button onClick={stopCamera}>Stop Camera</button>
        </>
      )}
    </div>
  );
};

export default Camera;