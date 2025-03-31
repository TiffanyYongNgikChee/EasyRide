import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import React from "react";
import { useNavigate } from "react-router-dom";
import '../css/Header.css';

const UserMenu = () => {
  const navigate = useNavigate();

    return (
    <div>
        <Navbar bg="dark" data-bs-theme="dark">
          <Container>
            <Nav className="me-auto">
              <Nav.Link href="/register">Register</Nav.Link>
              <Nav.Link href="/login">Login</Nav.Link>
              <Nav.Link href="/search">Timetable</Nav.Link>
            </Nav>
          </Container>
      </Navbar>
      <div className="header-container">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="header-video">
        <source src="/videos/Header.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

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
    </div>
      
  );
  };
  
  export default UserMenu;