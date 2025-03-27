import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const center = {
  lat: 53.349805, // Default center (Dublin)
  lng: -6.26031,
};

const BusMap = () => {
  const [stops, setStops] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/gtfs/stops")
      .then((res) => res.json())
      .then((data) => setStops(data))
      .catch((error) => console.error("Error fetching stops:", error));
  }, []);

  return (
    <LoadScript googleMapsApiKey="AIzaSyAjjR0-3zkTPmljMueREFtfZjl-Kr-bs6A">
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
        {stops.map((stop) => (
          <Marker
            key={stop.stop_id}
            position={{ lat: stop.stop_lat, lng: stop.stop_lon }}
            title={stop.stop_name}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default BusMap;
