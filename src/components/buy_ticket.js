import React, { useState } from "react";
import axios from "axios";

const Ticket = () => {
  const [tickets, setTickets] = useState([]);
  const userId = "USER001"; // Replace with actual user ID

  const buyTicket = async (price) => {
    try {
      const response = await axios.post("http://localhost:5001/buy-ticket", { user_id: userId, price });
      alert("Ticket Purchased!");
      fetchTickets();
    } catch (error) {
      console.error("Error buying ticket:", error);
    }
  };

  const fetchTickets = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/my-tickets/${userId}`);
      setTickets(response.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Buy Ticket</h1>

      <button onClick={() => buyTicket(10)} className="bg-blue-500 text-white p-2 rounded">
        Buy Ticket ($10)
      </button>

      <h2 className="mt-4 text-xl">Your Tickets</h2>
      <ul>
        {tickets.map(ticket => (
          <li key={ticket.ticket_id} className="p-2 border-b">
            🎟️ {ticket.ticket_id} - {ticket.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Ticket;
