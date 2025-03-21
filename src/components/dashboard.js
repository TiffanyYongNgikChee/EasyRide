import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboard.css';

const Dashboard = () => {
    const [message, setMessage] = useState('');
    const [user, setUser] = useState({});
    const [transactions, setTransactions] = useState([]);
    const [trips, setTrips] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login'); // Redirect if not logged in
            return;
        }

        fetch('http://localhost:4000/api/dashboard', {
            method: 'GET',
            headers: { 'Authorization': token }, // Fix authorization format
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.message) setMessage(data.message);
            if (data.user) setUser(data.user);
            if (data.transactions) setTransactions(data.transactions);
            if (data.trips) setTrips(data.trips);
        })
        .catch((err) => console.error('Dashboard error:', err));
    }, [navigate]);

    return (
        <div className="dashboard-container">
            <h2>{message}</h2>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Balance:</strong> ${user.balance}</p>

            <h3>Transaction History</h3>
            <table border="1">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.length > 0 ? (
                        transactions.map((txn) => (
                            <tr key={txn._id}>
                                <td>{txn.type}</td>
                                <td>${txn.amount}</td>
                                <td>{txn.status}</td>
                                <td>{new Date(txn.time_stamp).toLocaleString()}</td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="4">No transactions found</td></tr>
                    )}
                </tbody>
            </table>

            <h3>Trip History</h3>
            <table border="1">
                <thead>
                    <tr>
                        <th>Bus Number</th>
                        <th>Route</th>
                        <th>Departure</th>
                        <th>Arrival</th>
                        <th>Price</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {trips.length > 0 ? (
                        trips.map((trip) => (
                            <tr key={trip._id}>
                                <td>{trip.bus_number}</td>
                                <td>{trip.route}</td>
                                <td>{trip.departure}</td>
                                <td>{trip.arrival}</td>
                                <td>${trip.price}</td>
                                <td>{new Date(trip.timestamp).toLocaleString()}</td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="6">No trips found</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};


export default Dashboard;
