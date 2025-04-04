import React, { useState, useEffect } from "react";
import '../css/Wallet.css';

const Wallet = () => {
  const [amount, setAmount] = useState(0);
  // Convert balance to number when initializing
  const [balance, setBalance] = useState(() => {
    const savedBalance = localStorage.getItem("balance");
    return savedBalance ? Number(savedBalance) : 0;
  });
  const [activeMethod, setActiveMethod] = useState("quick");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const userId = localStorage.getItem("userId");  // ✅ Get userId from localStorage

  // Parsed amounts with visual indicators
  const amountOptions = [
    { value: 5, label: "Quick €5" },
    { value: 10, label: "Standard €10" }, 
    { value: 20, label: "Boost €20" },
    { value: 50, label: "Max €50" }
  ];

  const handleTopUp = async (selectedAmount) => {

    setAmount(selectedAmount);
    setIsProcessing(true);

    if (!userId) {
      setMessage("Error: User not logged in!");
      return;
    }
    if (amount <= 0) {
      setMessage("Please enter a valid top-up amount.");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/top-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount: Number(amount) })  // ✅ Ensure amount is a number
      });

      const data = await response.json();

      if (response.ok) {
        const newBalance = data.newBalance;
        setBalance(newBalance);
        localStorage.setItem("balance", newBalance); // ✅ Update balance in localStorage
        setMessage(`Top-up successful! New balance: $${newBalance}`);
      } else {
        setMessage(data.message || "Top-up failed. Please try again.");
      }
    } catch (error) {
      console.error("Error topping up:", error);
      setMessage("Server error. Please try again later.");
    }
    setTimeout(() => {
      const newBalance = balance + selectedAmount;
      setBalance(newBalance);
      setIsProcessing(false);
      new Audio('/sounds/Successfully.mp3').play();
    }, 1000);
  };

  return (
    <div className="wallet-website">
      
    {/* Header Section */}
    <header className="wallet-header">
      <h1>Travel Wallet</h1>
      <p>Top up your balance for seamless bus travel</p>
    </header>

    {/* Main Content */}
    <main className="wallet-main">
      {/* Balance Card */}
      <div className="balance-card">
        <div className="balance-info">
          <span className="wallet-emoji">💳</span>
          <div>
            <p className="balance-label">Available Balance</p>
            <p className="balance-amount">€{balance.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Amount Selection */}
      <div className="amount-selection">
        <h3>Select Top-Up Amount</h3>
        <div className="amount-options">
          {amountOptions.map((option) => (
            <div
              key={option.value}
              className={`amount-card ${amount === option.value ? "selected" : ""}`}
              onClick={() => handleTopUp(option.value)}
            >
              <span className="amount-value">€{option.value}</span>
              <span className="amount-label">{option.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Area */}
      <div className="action-area">
        <button
          className={`confirm-btn ${isProcessing ? "processing" : ""}`}
          disabled={amount === 0 || isProcessing}
        >
          {isProcessing ? (
            <>
              <span className="spinner"></span>
              Processing...
            </>
          ) : (
            `Add €${amount} to Wallet`
          )}
        </button>
        
        {message && <div className="message">{message}</div>}
      </div>
    </main>

    {/* Footer Note */}
    <footer className="wallet-footer">
      <span className="lock-icon">🔒</span>
      <span>Demo mode - No real payments required</span>
    </footer>
  </div>
  );
};

export default Wallet;
