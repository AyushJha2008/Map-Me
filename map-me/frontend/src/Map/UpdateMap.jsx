import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./UpdateMap.css";

const UpdateMap = () => {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get("http://localhost:8000/api/v1/maps", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        if (response.data.success) {
          setMaps(response.data.data);
        }
      } catch (error) {
        alert("Error fetching maps.");
        console.error(error);
      }
      setLoading(false);
    };
    fetchMaps();
  }, []);

  if (loading) {
    return <div>Loading maps...</div>;
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
              onClick={() => navigate(`/map/${map._id}`)}
            >
              <h3>{map.title}</h3>
              <p>Floors: {map.floors.length}</p>
            </div>
          ))
        ) : (
          <p>No maps found. Create a new map first.</p>
        )}
      </div>
    </div>
  );
};

export default UpdateMap;