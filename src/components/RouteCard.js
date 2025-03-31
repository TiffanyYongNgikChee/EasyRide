import React from 'react';
import '../css/SearchTable.css';
import { useNavigate } from 'react-router-dom'; // Add this import
import { useEffect,useRef } from 'react';

const RouteCard = ({ route }) => {
  const mapRef = useRef(null);
  const navigate = useNavigate(); // Initialize the navigate function

  useEffect(() => {
    if (!route.path || route.path.length === 0 || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 8,
      center: route.path[0], // Center on first location
      disableDefaultUI: true,
    });

    // Draw polyline
    new window.google.maps.Polyline({
      path: route.path.map(p => ({ lat: p.lat, lng: p.lng })),
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map: map,
    });

    // Add markers
    route.path.forEach((point, index) => {
      new window.google.maps.Marker({
        position: { lat: point.lat, lng: point.lng },
        map: map,
        label: String.fromCharCode(65 + index), // A, B, C...
        title: point.name,
      });
    });

    // Fit bounds to show all points
    const bounds = new window.google.maps.LatLngBounds();
    route.path.forEach(point => bounds.extend({ lat: point.lat, lng: point.lng }));
    map.fitBounds(bounds);

  }, [route]);

  const handleBuyTicket = () => {
    // Store route information in localStorage
    localStorage.setItem('selectedRoute', JSON.stringify({
      route_id: route.route_id,
      route_long_name: route.name,
      route_short_name: route.shortName,
      path: route.path,
      price: 2.50 // Adding fixed price for the payment page
    }));
    
    // Navigate to payment page
    navigate('/payment');
  };
    
  return (
    <div className="route-card-container">
      <div className="route-card-header">
        <span className="route-number-badge">{route.shortName}</span>
        <h3 className="route-card-title">{route.name}</h3>
      </div>
      <div 
        ref={mapRef} 
        style={{ height: '200px', width: '100%', marginTop: '10px' }} 
      />
      <div className="route-card-path">
        <div className="route-path-summary">
          <span className="path-start-point">
            <span className="path-marker">A</span>
            {route.path[0]?.name || 'Start'}
          </span>
          <span className="path-arrow">→</span>
          <span className="path-end-point">
            <span className="path-marker">
              {String.fromCharCode(65 + (route.path.length - 1))}
            </span>
            {route.path[route.path.length - 1]?.name || 'End'}
          </span>
        </div>
        
        <div className="route-full-path">
          {route.path?.map((point, index) => (
            <div key={index} className="route-path-point">
              <span className="path-point-marker">{String.fromCharCode(65 + index)}</span>
              <span className="path-point-name">{point.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <button 
        className="route-card-button"
        onClick={handleBuyTicket}
      >
        Book This Route - €2.50
      </button>
    </div>
  );
};

export default RouteCard;