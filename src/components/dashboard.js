import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login'); // Redirect if not logged in
            return;
        }

        fetch('http://localhost:4000/api/dashboard', {
            method: 'GET',
            headers: { 'Authorization': token },
        })
        .then((res) => res.json())
        .then((data) => setMessage(data.message))
        .catch((err) => console.error('Dashboard error:', err));
    }, [navigate]);

    return (
        <div className="dashboard-container">
            <h2>{message}</h2>
        </div>
    );
};

export default Dashboard;
