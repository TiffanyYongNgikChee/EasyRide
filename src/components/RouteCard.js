import React from 'react';
import '../css/SearchTable.css';

const RouteCard = ({ route }) => {
  return (
    <div className="route-card">
      <div className="route-header">
        <h3 className="route-short-name">{route.shortName}</h3>
        <span className="route-id">ID: {route.route_id}</span>
      </div>
      <p className="route-long-name">{route.name}</p>
    </div>
  );
};

export default RouteCard;