import React, { useEffect, useRef } from 'react';

const BusMap = ({ stops, selectedStop, startStop, endStop }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markers = useRef([]);
  const directionsService = useRef(null);
  const directionsRenderer = useRef(null);

  useEffect(() => {
    if (!window.google || !window.google.maps) return;

    // Initialize map
    const defaultCenter = { lat: 53.3498, lng: -6.2603 }; // Default to Dublin
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 12
    });

    directionsService.current = new window.google.maps.DirectionsService();
    directionsRenderer.current = new window.google.maps.DirectionsRenderer();
    directionsRenderer.current.setMap(mapInstance.current);

    return () => {
      if (directionsRenderer.current) {
        directionsRenderer.current.setMap(null);
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !window.google.maps) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];

    // Add markers for all stops
    stops.forEach(stop => {
      const marker = new window.google.maps.Marker({
        position: { lat: stop.stop_lat, lng: stop.stop_lon },
        map: mapInstance.current,
        title: stop.stop_name,
        icon: getMarkerIcon(stop)
      });
      markers.current.push(marker);
    });

    // Center map based on selections
    if (startStop && endStop) {
      calculateAndDisplayRoute();
    } else if (selectedStop) {
      mapInstance.current.setCenter({
        lat: selectedStop.stop_lat,
        lng: selectedStop.stop_lon
      });
      mapInstance.current.setZoom(15);
    } else if (stops.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      stops.forEach(stop => {
        bounds.extend(new window.google.maps.LatLng(stop.stop_lat, stop.stop_lon));
      });
      mapInstance.current.fitBounds(bounds);
    }
  }, [stops, selectedStop, startStop, endStop]);

  const calculateAndDisplayRoute = () => {
    if (!startStop || !endStop) return;

    directionsService.current.route(
      {
        origin: { lat: startStop.stop_lat, lng: startStop.stop_lon },
        destination: { lat: endStop.stop_lat, lng: endStop.stop_lon },
        travelMode: window.google.maps.TravelMode.TRANSIT
      },
      (response, status) => {
        if (status === 'OK') {
          directionsRenderer.current.setDirections(response);
        } else {
          console.error('Directions request failed:', status);
        }
      }
    );
  };

  const getMarkerIcon = (stop) => {
    if (startStop && stop.stop_id === startStop.stop_id) {
      return {
        url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
      };
    }
    if (endStop && stop.stop_id === endStop.stop_id) {
      return {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
      };
    }
    if (selectedStop && stop.stop_id === selectedStop.stop_id) {
      return {
        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
      };
    }
    return {
      url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
    };
  };

  return <div ref={mapRef} style={{ height: '400px', width: '100%' }} />;
};

export default BusMap;