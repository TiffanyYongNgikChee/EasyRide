import React from "react";

const BusTimetable = () => {
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
  ];

  return (
    <div className="bus-list">
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

          <button className="bus-button">Choose outbound</button>

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