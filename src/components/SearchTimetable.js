import React, { useState } from 'react';
import RouteCard from './RouteCard';
import '../css/SearchTable.css';

const SearchComponent = () => {
  const [query, setQuery] = useState('');
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
    <div className="search-container">
      <h1>Bus Route Finder</h1>
      
      <div className="search-box">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for a route (e.g., Galway)"
          disabled={isLoading}
        />
        <button 
          onClick={handleSearch}
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="results-container">
        {isLoading && <p>Loading routes...</p>}
        
        {routes.length > 0 && (
          <div className="route-list">
            <h2>Found {routes.length} routes:</h2>
            {routes.map(route => (
              <RouteCard 
                key={route.route_id} 
                route={route} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchComponent;