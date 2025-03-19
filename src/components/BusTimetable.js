import React from "react";
import { useNavigate } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

const BusTimetable = () => {
  const navigate = useNavigate(); // Initialize navigation hook

  // Bus Timetable Data
  const buses = [
    {
      id: 1,
      number: "761",
      route: "towards: Galway",
      departureTime: "23:30",
      departureLocation: "Zone 11, Dublin Airport",
      arrivalTime: "02:30",
      arrivalLocation: "Galway Coach Station",
      arrivalDate: "19/03/2025",
      journeyTime: "3h 0m",
      price: 17.50,
      cheapest: true,
      quickest: false,
    },
    {
      id: 2,
      number: "761",
      route: "towards: Galway",
      departureTime: "23:55",
      departureLocation: "Zone 11, Dublin Airport",
      arrivalTime: "02:45",
      arrivalLocation: "Galway Coach Station",
      arrivalDate: "19/03/2025",
      journeyTime: "2h 50m",
      price: 17.50,
      cheapest: true,
      quickest: true,
    },
    {
      id: 3,
      number: "712",
      route: "towards: Cork",
      departureTime: "22:15",
      departureLocation: "Zone 11, Dublin Airport",
      arrivalTime: "01:45",
      arrivalLocation: "Cork Bus Station",
      arrivalDate: "19/03/2025",
      journeyTime: "3h 30m",
      price: 20.00,
      cheapest: false,
      quickest: false
    },
    {
      id: 4,
      number: "712",
      route: "towards: Cork",
      departureTime: "23:45",
      departureLocation: "Zone 11, Dublin Airport",
      arrivalTime: "03:15",
      arrivalLocation: "Cork Bus Station",
      arrivalDate: "19/03/2025",
      journeyTime: "3h 30m",
      price: 20.00,
      cheapest: false,
      quickest: false
    },
    {
      id: 5,
      number: "740",
      route: "towards: Limerick",
      departureTime: "21:30",
      departureLocation: "Zone 11, Dublin Airport",
      arrivalTime: "00:30",
      arrivalLocation: "Limerick Bus Station",
      arrivalDate: "19/03/2025",
      journeyTime: "3h 0m",
      price: 18.00,
      cheapest: true,
      quickest: false
    },
    {
      id: 6,
      number: "740",
      route: "towards: Limerick",
      departureTime: "23:10",
      departureLocation: "Zone 11, Dublin Airport",
      arrivalTime: "02:00",
      arrivalLocation: "Limerick Bus Station",
      arrivalDate: "19/03/2025",
      journeyTime: "2h 50m",
      price: 18.00,
      cheapest: true,
      quickest: true
    },
    {
      id: 7,
      number: "820",
      route: "towards: Waterford",
      departureTime: "20:45",
      departureLocation: "Zone 11, Dublin Airport",
      arrivalTime: "23:30",
      arrivalLocation: "Waterford Bus Station",
      arrivalDate: "19/03/2025",
      journeyTime: "2h 45m",
      price: 16.00,
      cheapest: true,
      quickest: true
    },
    {
      id: 8,
      number: "820",
      route: "towards: Waterford",
      departureTime: "22:30",
      departureLocation: "Zone 11, Dublin Airport",
      arrivalTime: "01:15",
      arrivalLocation: "Waterford Bus Station",
      arrivalDate: "19/03/2025",
      journeyTime: "2h 45m",
      price: 16.00,
      cheapest: true,
      quickest: true
    }
  ];

  // Function to handle ticket selection - The price field stores the price of the ticket for each bus.
  const handleSelectTicket = (price) => {
    localStorage.setItem("ticketPrice", price); // Store ticket price
    navigate("/camera"); // Redirect to Camera page
  };


  return (
    
    <div className="bus-list">
      <Navbar bg="dark" data-bs-theme="dark">
          <Container>
            <Nav className="me-auto">
              <Nav.Link href="/register">Register</Nav.Link>
              <Nav.Link href="/timetable">Timetable</Nav.Link>
              <Nav.Link href="/camera">Ticket</Nav.Link>
            </Nav>
          </Container>
      </Navbar>
      {buses.map((bus) => (
        <div key={bus.id} className="bus-container">
          <div className="bus-header">
            <span>🚌 {bus.number}</span>
            <span>€{bus.price.toFixed(2)}</span>
          </div>
          <p className="bus-route">{bus.route}</p>

          <div className="bus-details">
            <p className="bus-time">{bus.departureTime} <span className="bus-location">({bus.departureLocation})</span></p>
            <p className="bus-time">{bus.arrivalTime} +1 <span className="bus-location">({bus.arrivalLocation})</span></p>
            <p className="bus-journey-time">Total journey time: {bus.journeyTime}</p>
          </div>

          <div className="bus-icons">📶 🔄 🌿</div>

          <button className="bus-button" onClick={() => handleSelectTicket(bus.price)}>
            Choose
          </button>

          <div className="bus-badges">
            {bus.cheapest && <span className="badge cheapest">CHEAPEST</span>}
            {bus.quickest && <span className="badge quickest">QUICKEST</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BusTimetable;