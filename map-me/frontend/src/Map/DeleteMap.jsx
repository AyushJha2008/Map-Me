import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './deleteMap.css';

const DeleteMap = () => {
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
        } else {
          alert(response.data.message);
        }
      } catch (error) {
        alert("Error fetching maps. Please try again.");
        console.error("Fetch maps error:", error);
      }
      setLoading(false);
    };

    fetchMaps();
  }, [navigate]);

  const handleDelete = async (mapId) => {
    if (window.confirm("Are you sure you want to delete this map?")) {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.delete(`http://localhost:8000/api/v1/maps/${mapId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        if (response.data.success) {
          alert(response.data.message);
          // Remove the deleted map from the state
          setMaps(maps.filter(map => map._id !== mapId));
        } else {
          alert(response.data.message);
        }
      } catch (error) {
        alert("Error deleting map. Please try again.");
        console.error("Delete map error:", error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading maps...</div>;
  }

  return (
    <div className="delete-map-container">
      <h2>Select a Map to Delete</h2>
      <div className="maps-list">
        {maps.length > 0 ? (
          maps.map((map) => (
            <div key={map._id} className="map-card">
              <div className="map-details">
                <h3>{map.title}</h3>
                <p>Floors: {map.floors.length}</p>
              </div>
              <button className="delete-btn" onClick={() => handleDelete(map._id)}>Delete</button>
            </div>
          ))
        ) : (
          <p>No maps found to delete.</p>
        )}
      </div>
    </div>
  );
};

export default DeleteMap;