import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// Create a new CSS file for this component to match the app's style
import "./UpdateMap.css";

const UpdateMap = () => {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          alert("You are not logged in. Please log in first.");
          navigate("/login");
          return;
        }

        const response = await axios.get("http://localhost:8000/api/v1/maps", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        if (response.data.success) {
          setMaps(response.data.data);
        }
      } catch (error) {
        alert("Error fetching maps. Please try again.");
        console.error("Fetch maps error:", error);
      }
      setLoading(false);
    };

    fetchMaps();
  }, [navigate]);

  const handleMapClick = (mapId) => {
    // Navigate to a new component for editing a single map
    navigate(`/edit-map/${mapId}`);
  };

  if (loading) {
    return <div>Loading your maps...</div>;
  }

  return (
    <div className="update-map-container">
      <h2>Select a Map to Update</h2>
      <div className="maps-list">
        {maps.length > 0 ? (
          maps.map((map) => (
            <div
              key={map._id}
              className="map-card"
              onClick={() => handleMapClick(map._id)}
            >
              <h3>{map.title}</h3>
              <p>Floors: {map.floors.length}</p>
            </div>
          ))
        ) : (
          <p>No maps found. Create a new map from the dashboard.</p>
        )}
      </div>
    </div>
  );
};

export default UpdateMap;