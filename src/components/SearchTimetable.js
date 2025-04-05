import React, { useState } from 'react';
import RouteCard from './RouteCard';
import '../css/SearchTable.css';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaWallet, FaUser, FaBusAlt, FaSearch, FaBus, FaMapMarkerAlt, FaTicketAlt, FaSignOutAlt } from 'react-icons/fa';

const SearchComponent = () => {
  const [query, setQuery] = useState('');
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRoutes([]); // Clear previous results

    try {
      const response = await fetch(`http://localhost:4000/api/gtfs/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status} status`);
      }

      const data = await response.json();
      
      if (!data.routes || data.routes.length === 0) {
        throw new Error('No routes found matching your search');
      }

      setRoutes(data.routes);
    } catch (err) {
      setError(err.message);
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-page-container">
      {/* Cute Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <FaBusAlt className="sidebar-logo" />
          <h2>EasyRide</h2>
        </div>
        
        <div className="sidebar-item" onClick={() => navigate('/dashboard')}>
          <FaHome className="sidebar-icon" />
          <span>Dashboard</span>
        </div>
        
        <div className="sidebar-item" onClick={() => navigate('/wallet')}>
          <FaWallet className="sidebar-icon" />
          <span>Wallet</span>
        </div>
        
        <div className="sidebar-item active" onClick={() => navigate('/search')}>
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

      {/* Original Search Content */}
      <div className="search-content">
        <div className="search-container">
          <div className="search-header">
            <FaBusAlt className="header-icon" />
            <h1>Bus Route Finder</h1>
            <p>Find and book your bus tickets in seconds</p>
          </div>
          
          <div className="search-box-container">
            <div className="search-box">
              <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search for a route or destination (e.g., Galway)"
                  disabled={isLoading}
                />
              </div>
              <button 
                onClick={handleSearch}
                disabled={isLoading || !query.trim()}
                className={`search-button ${isLoading ? 'loading' : ''}`}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Searching...
                  </>
                ) : (
                  <>
                    <FaSearch className="button-icon" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <FaMapMarkerAlt className="error-icon" />
              {error}
            </div>
          )}

          <div className="results-container">
            {isLoading && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Finding available routes...</p>
              </div>
            )}
            
            {routes.length > 0 && (
              <div className="route-list">
                <h2>
                  <FaBusAlt className="results-icon" />
                  Found {routes.length} {routes.length === 1 ? 'route' : 'routes'}
                </h2>
                <div className="route-grid">
                  {routes.map(route => (
                    <RouteCard 
                      key={route.route_id} 
                      route={route} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchComponent;