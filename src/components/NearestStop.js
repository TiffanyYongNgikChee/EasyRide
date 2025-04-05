import React, { useState } from 'react';
import { FaSearch, FaLocationArrow } from 'react-icons/fa';

const StopSearch = ({ onSelectStop }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:4000/api/gtfs/stops/search?query=${query}`);
            const data = await response.json();
            setResults(data);
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLocationSearch = () => {
        if (navigator.geolocation) {
            setIsLoading(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const response = await fetch(
                            `http://localhost:4000/api/gtfs/stops/nearby?lat=${latitude}&lon=${longitude}`
                        );
                        const data = await response.json();
                        setResults(data);
                    } catch (err) {
                        console.error('Location search error:', err);
                    } finally {
                        setIsLoading(false);
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setIsLoading(false);
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    return (
        <div className="stop-search-container">
            <div className="search-bar">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by stop name or code..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} disabled={isLoading}>
                    <FaSearch /> Search
                </button>
                <button onClick={handleLocationSearch} disabled={isLoading}>
                    <FaLocationArrow /> Near Me
                </button>
            </div>

            {isLoading && <div className="loading">Loading...</div>}

            <div className="search-results">
                {results.map((stop) => (
                    <div 
                        key={stop.stop_id} 
                        className="stop-result"
                        onClick={() => onSelectStop(stop)}
                    >
                        <h4>{stop.stop_name}</h4>
                        <p>Code: {stop.stop_code}</p>
                        <small>Lat: {stop.stop_lat}, Lng: {stop.stop_lon}</small>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StopSearch;