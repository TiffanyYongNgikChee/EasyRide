import React, { useEffect, useRef } from 'react';

const StopMap = ({ stops, selectedStop }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markers = useRef([]);

    useEffect(() => {
        if (window.google && stops.length > 0) {
            // Initialize map
            const firstStop = stops[0];
            mapInstance.current = new window.google.maps.Map(mapRef.current, {
                center: { lat: firstStop.stop_lat, lng: firstStop.stop_lon },
                zoom: 14
            });

            // Clear previous markers
            markers.current.forEach(marker => marker.setMap(null));
            markers.current = [];

            // Add new markers
            stops.forEach(stop => {
                const marker = new window.google.maps.Marker({
                    position: { lat: stop.stop_lat, lng: stop.stop_lon },
                    map: mapInstance.current,
                    title: stop.stop_name
                });
                markers.current.push(marker);
            });

            // Center on selected stop if any
            if (selectedStop) {
                mapInstance.current.setCenter({
                    lat: selectedStop.stop_lat,
                    lng: selectedStop.stop_lon
                });
            }
        }
    }, [stops, selectedStop]);

    return <div ref={mapRef} style={{ height: '400px', width: '100%' }} />;
};

export default StopMap;