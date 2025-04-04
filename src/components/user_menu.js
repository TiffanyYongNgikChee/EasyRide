import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import React from "react";
import { useNavigate } from "react-router-dom";
import '../css/Header.css';
import { FaBus, FaUserCircle, FaSearch } from 'react-icons/fa';

const UserMenu = () => {
  const navigate = useNavigate();

    return (
      <div className="header-container">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="header-video">
        <source src="/videos/Header.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Navbar integrated into the video */}
      <Navbar expand="lg" className="video-navbar">
        <Container>
          <Navbar.Brand href="/" className="d-flex align-items-center">
            <FaBus className="me-2 navbar-brand-icon" />
            <span className="easyride-brand">EasyRide</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="navbar-toggle" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="/register" className="nav-link-custom">
                <FaUserCircle className="me-1" />
                Register
              </Nav.Link>
              <Nav.Link href="/login" className="nav-link-custom">
                <FaUserCircle className="me-1" />
                Login
              </Nav.Link>
              <Nav.Link href="/search" className="nav-link-custom">
                <FaSearch className="me-1" />
                Timetable
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Overlay Content */}
      <div className="header-overlay">
        <h1 className="header-title">Buy Tickets with Face Recognition</h1>
        <p className="header-description">
          Experience the future of bus travel—secure, fast, and hassle-free.
        </p>
        <div className="header-buttons">
          <button onClick={() => navigate("/register")} className="header-btn">
            Register Now
          </button>
          <button onClick={() => navigate("/search")} className="header-btn secondary">
            View Bus Timetable
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default UserMenu;