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
    <div className="wallet-container">
      {/* Balance Card */}
      <div className="balance-card-light">
        <div className="balance-header">
          <span className="wallet-icon">💳</span>
          <h3>Travel Wallet</h3>
        </div>
        <h1 className="balance-amount">€{balance.toFixed(2)}</h1>
        <div className="balance-wave-light"></div>
      </div>

      {/* Amount Selection - Parsed List */}
      <div className="amount-grid">
        {amountOptions.map((option) => (
          <div 
            key={option.value}
            className={`amount-option ${amount === option.value ? "active" : ""}`}
            onClick={() => handleTopUp(option.value)}
          >
            <div className="amount-bubble">
              <span className="amount-value">€{option.value}</span>
            </div>
            <span className="amount-label">{option.label}</span>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <button 
        className={`topup-btn-light ${isProcessing ? "processing" : ""}`}
        disabled={amount === 0 || isProcessing}
      >
        {isProcessing ? (
          <>
            <div className="spinner-light"></div>
            Adding €{amount}...
          </>
        ) : (
          `Confirm Top-Up €${amount > 0 ? amount : ""}`
        )}
      </button>

      {/* Privacy Notice */}
      <div className="privacy-notice">
        <span className="lock-icon">🔒</span>
        No payment details required - Demo mode only
      </div>
    </div>
  );
};

export default Wallet;
