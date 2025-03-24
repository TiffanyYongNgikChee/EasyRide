import React, { useState } from "react";

const Wallet = () => {
  const [amount, setAmount] = useState(0);
  const [balance, setBalance] = useState(localStorage.getItem("balance") || 0);
  const [message, setMessage] = useState("");
  const userId = localStorage.getItem("userId");  // ✅ Get userId from localStorage

  const handleTopUp = async () => {
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
  };

  return (
    <div>
      <h2>Top-Up Balance</h2>
      <p>Current Balance: ${balance}</p>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
      />
      <button onClick={handleTopUp}>Top Up</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Wallet;
