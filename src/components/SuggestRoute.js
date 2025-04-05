import React, { useState, useEffect } from 'react';
import StopMap from './BusMap';
import StopSearch from './NearestStop';
import '../css/SuggestRoute.css';

const SearchPage = () => {
    const [selectedStop, setSelectedStop] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [startStop, setStartStop] = useState(null);
    const [endStop, setEndStop] = useState(null);
    const [showStopsList, setShowStopsList] = useState(false);
    const [mapError, setMapError] = useState(null);

    const handleStopSelect = (stop, isStart = false) => {
        setSelectedStop(stop);
        if (isStart) {
            setStartStop(stop);
        } else {
            setEndStop(stop);
        }
        setShowStopsList(false);
    };

    useEffect(() => {
        const checkGoogleMaps = () => {
            if (window.google && window.google.maps) {
                setMapLoaded(true);
                return true;
            }
            return false;
        };

        // Check if already loaded
        if (checkGoogleMaps()) return;

        // Check for existing script
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
            const interval = setInterval(() => {
                if (checkGoogleMaps()) {
                    clearInterval(interval);
                }
            }, 100);
            return () => clearInterval(interval);
        }

        // Load the script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAjjR0-3zkTPmljMueREFtfZjl-Kr-bs6A&libraries=places`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
            if (!checkGoogleMaps()) {
                setMapError('Google Maps API failed to load properly');
            }
        };
        
        script.onerror = () => {
            setMapError('Failed to load Google Maps script');
        };

        document.head.appendChild(script);

        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    return (
        <div className="search-page" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '20px', color: '#333' }}>Find Bus Stops</h1>
            
            {/* Stop selection controls */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <button 
                        onClick={() => setShowStopsList(!showStopsList)}
                        style={{
                            padding: '10px 15px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            width: '100%'
                        }}
                    >
                        {showStopsList ? 'Hide Stops List' : 'Show Stops List'}
                    </button>
                </div>
                
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <h3>Start: {startStop?.stop_name || 'Not selected'}</h3>
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3>End: {endStop?.stop_name || 'Not selected'}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content area */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {/* Left column - Search and results */}
                <div style={{ flex: 1, minWidth: '300px' }}>
                    {showStopsList && (
                        <StopSearch 
                            onSelectStop={(stop) => handleStopSelect(stop, true)}
                            onSearchResults={setSearchResults}
                        />
                    )}
                    
                    {selectedStop && (
                        <div style={{ 
                            marginTop: '20px',
                            padding: '15px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            <h2>{selectedStop.stop_name}</h2>
                            <p><strong>Stop Code:</strong> {selectedStop.stop_code}</p>
                            <p><strong>Coordinates:</strong> {selectedStop.stop_lat}, {selectedStop.stop_lon}</p>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button 
                                    onClick={() => handleStopSelect(selectedStop, true)}
                                    style={{
                                        padding: '8px 12px',
                                        backgroundColor: '#2196F3',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Set as Start
                                </button>
                                <button 
                                    onClick={() => handleStopSelect(selectedStop, false)}
                                    style={{
                                        padding: '8px 12px',
                                        backgroundColor: '#FF5722',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Set as End
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Right column - Map */}
                <div style={{ flex: 1, minWidth: '300px' }}>
                    {mapError ? (
                        <div style={{ 
                            height: '400px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            backgroundColor: '#ffebee',
                            borderRadius: '8px',
                            color: '#d32f2f'
                        }}>
                            Error: {mapError}
                        </div>
                    ) : mapLoaded ? (
                        <StopMap 
                            stops={searchResults}
                            selectedStop={selectedStop}
                            startStop={startStop}
                            endStop={endStop}
                        />
                    ) : (
                        <div style={{ 
                            height: '400px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '8px'
                        }}>
                            Loading map...
                        </div>
                    )}
                </div>
            </div>

            {/* Route information (if both stops selected) */}
            {startStop && endStop && (
                <div style={{ 
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: '#e8f5e9',
                    borderRadius: '8px'
                }}>
                    <h2>Selected Route</h2>
                    <p><strong>From:</strong> {startStop.stop_name} ({startStop.stop_code})</p>
                    <p><strong>To:</strong> {endStop.stop_name} ({endStop.stop_code})</p>
                    {/* Add route calculation functionality here */}
                </div>
            )}
        </div>
    );
};

export default SearchPage;