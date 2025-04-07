import Register from './components/register';
import UserMenu from './components/user_menu';
import Dashboard from './components/dashboard';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import React, {useState} from 'react';
import { Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./css/Register.css";
import "./css/timetable.css";
import Login from './components/login';
import Wallet from './components/Wallet';
import SearchComponent from './components/SearchTimetable';
import Payment from './components/Payment';
function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <Router>
      <Routes>
        {/* User Menu Route */}
        <Route path="/" element={<UserMenu />} />

        {/* Registration Page Route */}
        <Route path="/register" element={
          <div className="registration-page">
            <Register />
          </div>
        } />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route 
            path="/dashboard" 
            element={token ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/Search" element={<SearchComponent />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </Router>
  );
}

export default App;
