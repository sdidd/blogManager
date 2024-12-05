import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API from "../../api";

// Fix for missing marker icons in Leaflet
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import markerRetina from "leaflet/dist/images/marker-icon-2x.png";

// Configure the default Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerRetina,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  let mapInstance = null;

  useEffect(() => {
    // Fetch locations from API
    const fetchLocations = async () => {
      try {
        const response = await API.get("/home/locations");
        setLocations(response.data);
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    };

    fetchLocations();

    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    // Ensure the map is only initialized once
    if (!mapInstance) {
      mapInstance = L.map("map").setView([20, 77], 5); // Default view over India

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance);
    }

    // Add location markers
    locations.forEach((location) => {
      const marker = L.marker(location.coordinates).addTo(mapInstance);
      marker.bindPopup(`<b>${location.name}</b><br>${location.address}`);
    });

    // Add user location marker if available
    if (userLocation) {
      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: L.icon({
          iconUrl: "https://leafletjs.com/examples/custom-icons/leaf-green.png",
          iconSize: [38, 95],
          iconAnchor: [22, 94],
        }),
      }).addTo(mapInstance);
      userMarker.bindPopup("<b>Your Location</b>").openPopup();
      mapInstance.setView([userLocation.lat, userLocation.lng], 12);
    }

    return () => {
      // Cleanup map instance on unmount
      if (mapInstance) {
        mapInstance.off();
        mapInstance.remove();
        mapInstance = null;
      }
    };
  }, [locations, userLocation]);

  return (
    <section id="locations" className="bg-light py-5">
      <div className="container text-center">
        <h2 className="fw-bold mb-4">Our Locations</h2>
        <div id="map" style={{ height: "500px", width: "100%" }}></div>
      </div>
    </section>
  );
};

export default Locations;
