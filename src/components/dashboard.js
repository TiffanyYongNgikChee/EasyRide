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
        <div className="dashboard-wrapper">
            {/* Sidebar */}
            <div className="dashboard-sidebar">
                <div className="dashboard-sidebar-item" onClick={() => navigate('/dashboard')}>
                    Dashboard
                </div>
                <div
                    className="dashboard-sidebar-item"
                    onClick={() => {
                        localStorage.setItem('balance', user.balance);
                        navigate('/wallet');
                    }}>
                    Wallet
                </div>
                <div className="dashboard-sidebar-item" onClick={() => navigate('/search')}>
                    Buy Ticket
                </div>
                <div className="dashboard-sidebar-item" onClick={() => navigate('/profile')}>
                    Profile
                </div>
            </div>

            {/* Main Content Area */}
            <div className="dashboard-content">
                {/* Specific h2 for Dashboard */}
                <h2 className="dashboard-message">{message}</h2>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Balance:</strong> ${user.balance}</p>

                <h3 className="dashboard-table-heading">Transaction History</h3>
                <table className="dashboard-table" border="1">
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

                <h3 className="dashboard-table-heading">Trip History</h3>
                <table className="dashboard-table" border="1">
                    <thead>
                        <tr>
                            <th>Bus Route</th>
                            <th>Route Name</th>
                            <th>Stops</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Purchase Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trips.length > 0 ? (
                            trips.map((trip) => (
                                <tr key={trip._id}>
                                    <td>{trip.route_short_name}</td>
                                    <td>{trip.route_long_name}</td>
                                    <td>{trip.stops || 'N/A'}</td>
                                    <td>${trip.price}</td>
                                    <td>{trip.status}</td>
                                    <td>{new Date(trip.purchase_time).toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6">No trips found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


export default Dashboard;
