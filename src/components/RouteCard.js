import React from 'react';
import '../css/SearchTable.css';
import { useEffect,useRef } from 'react';

const RouteCard = ({ route }) => {
  const mapRef = useRef(null);

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

  return (
    <div className="route-card">
      <h3>{route.shortName} - {route.name}</h3>
      <div 
        ref={mapRef} 
        style={{ height: '200px', width: '100%', marginTop: '10px' }} 
      />
      <div className="route-path">
        {route.path?.map((point, index) => (
          <div key={index} className="path-point">
            <strong>{String.fromCharCode(65 + index)}:</strong> {point.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteCard;