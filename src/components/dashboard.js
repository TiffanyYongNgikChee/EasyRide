import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboard.css';
import { FaHome, FaWallet, FaTicketAlt, FaUser, FaHistory, FaBusAlt, FaSignOutAlt } from 'react-icons/fa';
import { GiMoneyStack } from 'react-icons/gi';
import { BsArrowUpRightCircleFill, BsCheckCircleFill } from 'react-icons/bs'

const Dashboard = () => {
    const [message, setMessage] = useState('');
    const [user, setUser] = useState({});
    const [transactions, setTransactions] = useState([]);
    const [trips, setTrips] = useState([]);
    const navigate = useNavigate();
    const [transactionsPage, setTransactionsPage] = useState(1);
    const [tripsPage, setTripsPage] = useState(1);
    const itemsPerPage = 5;
    
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

    // Calculate paginated data
    const paginatedTransactions = transactions.slice(
        (transactionsPage - 1) * itemsPerPage,
        transactionsPage * itemsPerPage
    );

    const paginatedTrips = trips.slice(
        (tripsPage - 1) * itemsPerPage,
        tripsPage * itemsPerPage
    );

    // Pagination handlers
    const nextTransactionsPage = () => {
        if (transactionsPage * itemsPerPage < transactions.length) {
            setTransactionsPage(transactionsPage + 1);
        }
    };

    const prevTransactionsPage = () => {
        if (transactionsPage > 1) {
            setTransactionsPage(transactionsPage - 1);
        }
    };

    const nextTripsPage = () => {
        if (tripsPage * itemsPerPage < trips.length) {
            setTripsPage(tripsPage + 1);
        }
    };

    const prevTripsPage = () => {
        if (tripsPage > 1) {
            setTripsPage(tripsPage - 1);
        }
    };

    return (
        <div className="dashboard-container">
            {/* Cute Sidebar */}
            <div className="dashboard-sidebar">
                <div className="sidebar-header">
                    <FaBusAlt className="sidebar-logo" />
                    <h2>EasyRide</h2>
                </div>
                
                <div className="sidebar-item active" onClick={() => navigate('/dashboard')}>
                    <FaHome className="sidebar-icon" />
                    <span>Dashboard</span>
                </div>
                
                <div className="sidebar-item" onClick={() => {
                        localStorage.setItem('balance', user.balance);
                        navigate('/wallet');
                    }}>
                    <FaWallet className="sidebar-icon" />
                    <span>Wallet</span>
                </div>
                
                <div className="sidebar-item" onClick={() => navigate('/search')}>
                    <FaTicketAlt className="sidebar-icon" />
                    <span>Buy Ticket</span>
                </div>
                
                <div className="sidebar-item" onClick={() => navigate('/profile')}>
                    <FaUser className="sidebar-icon" />
                    <span>Suggest Route</span>
                </div>
                <div 
                    className="sidebar-item logout-button"
                    onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('balance');
                    navigate('/login');
                    }}
                >
                    <FaSignOutAlt className="sidebar-icon" />
                    <span>Logout</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-main">
                <div className="welcome-banner">
                    <h1>Welcome back, {user.name || 'Traveler'}! <span className="wave">👋</span></h1>
                    <p>{message}</p>
                </div>

                {/* User Stats Cards */}
                <div className="stats-cards">
                    <div className="stat-card blue">
                        <GiMoneyStack className="stat-icon" />
                        <div>
                            <h3>Current Balance</h3>
                            <p>€{user.balance?.toFixed(2) || '0.00'}</p>
                        </div>
                    </div>
                    
                    <div className="stat-card green">
                        <FaTicketAlt className="stat-icon" />
                        <div>
                            <h3>Total Trips</h3>
                            <p>{trips.length}</p>
                        </div>
                    </div>
                    
                    <div className="stat-card purple">
                        <FaHistory className="stat-icon" />
                        <div>
                            <h3>Transactions</h3>
                            <p>{transactions.length}</p>
                        </div>
                    </div>
                </div>

                {/* Cute Tables */}
                <div className="table-section">
                    <h2 className="table-header">
                        <FaHistory className="header-icon" />
                        Recent Transactions
                        <div className="pagination-controls">
                            <button 
                                onClick={prevTransactionsPage}
                                disabled={transactionsPage === 1}
                                className="pagination-button"
                            >
                                Previous
                            </button>
                            <span className='page-number'>Page {transactionsPage}</span>
                            <button 
                                onClick={nextTransactionsPage}
                                disabled={transactionsPage * itemsPerPage >= transactions.length}
                                className="pagination-button"
                            >
                                Next
                            </button>
                        </div>
                    </h2>
                    
                    <div className="cute-table-container">
                        <table className="cute-table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                            {paginatedTransactions.length > 0 ? (
                                paginatedTransactions.map((txn) => (
                                        <tr key={txn._id}>
                                            <td>
                                                {txn.type === 'payment' ? 
                                                    <BsArrowUpRightCircleFill className="transaction-icon payment" /> : 
                                                    <BsCheckCircleFill className="transaction-icon credit" />}
                                                {txn.type}
                                            </td>
                                            <td>${txn.amount.toFixed(2)}</td>
                                            <td>
                                                <span className={`status-bubble ${txn.status}`}>
                                                    {txn.status}
                                                </span>
                                            </td>
                                            <td>{new Date(txn.time_stamp).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="no-data">
                                            No transactions yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="table-section">
                    <h2 className="table-header">
                        <FaBusAlt className="header-icon" />
                        Your Trips
                        <div className="pagination-controls">
                            <button 
                                onClick={prevTripsPage}
                                disabled={tripsPage === 1}
                                className="pagination-button"
                            >
                                Previous
                            </button>
                            <span className='page-number'>Page {tripsPage}</span>
                            <button 
                                onClick={nextTripsPage}
                                disabled={tripsPage * itemsPerPage >= trips.length}
                                className="pagination-button"
                            >
                                Next
                            </button>
                        </div>
                    </h2>
                    
                    <div className="cute-table-container">
                        <table className="cute-table">
                            <thead>
                                <tr>
                                    <th>Route</th>
                                    <th>Stops</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                            {paginatedTrips.length > 0 ? (
                                paginatedTrips.map((trip) => (
                                        <tr key={trip._id}>
                                            <td>
                                                <div className="route-name">
                                                    <strong>{trip.route_short_name}</strong>
                                                    <span>{trip.route_long_name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="stops-preview">
                                                    {trip.stops?.split('→')[0].trim()} → ... → {trip.stops?.split('→').pop().trim()}
                                                </div>
                                            </td>
                                            <td>${trip.price.toFixed(2)}</td>
                                            <td>
                                                <span className={`status-bubble ${trip.status}`}>
                                                    {trip.status}
                                                </span>
                                            </td>
                                            <td>{new Date(trip.purchase_time).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="no-data">
                                            No trips booked yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;