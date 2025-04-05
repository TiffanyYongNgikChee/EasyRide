import React, { useState } from 'react';
import StopMap from './BusMap';
import StopSearch from './NearestStop';
import '../css/SuggestRoute.css';

const SearchPage = () => {
    const [selectedStop, setSelectedStop] = useState(null);
    const [searchResults, setSearchResults] = useState([]);

    const handleStopSelect = (stop) => {
        setSelectedStop(stop);
        
    };

    return (
        <div className="search-page">
            <h1>Find Bus Stops</h1>
            
            <div className="search-section">
                <StopSearch 
                    onSelectStop={handleStopSelect}
                    onSearchResults={setSearchResults}
                />
            </div>

            <div className="map-section">
                <StopMap 
                    stops={searchResults.length ? searchResults : []}
                    selectedStop={selectedStop}
                />
            </div>

            {selectedStop && (
                <div className="stop-details">
                    <h2>{selectedStop.stop_name}</h2>
                    <p>Stop Code: {selectedStop.stop_code}</p>
                    <p>Location: {selectedStop.stop_lat}, {selectedStop.stop_lon}</p>
                    {/* Add more details or route information here */}
                </div>
            )}
        </div>
    );
};

export default SearchPage;