import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditMap.css'; 

const EditMap = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMap = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("Authentication failed. Please log in again.");
          navigate("/login");
          return;
        }

        const response = await axios.get(`http://localhost:8000/api/v1/maps/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        if (response.data.success) {
          setMap(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError("Error fetching map details. Please check the map ID.");
        console.error("Fetch map error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMap();
  }, [id, navigate]);

  // frontend/src/Map/EditMap.jsx

const handleRoomUpdate = async (floorIndex, sectionIndex, roomIndex, newRoomData) => {
  try {
    const token = localStorage.getItem("accessToken");
    const formData = new FormData();
    formData.append('name', newRoomData.name);
    formData.append('notes', newRoomData.notes);
    
    // If a new photo is uploaded, append it to the form data
    if (newRoomData.photo) {
      formData.append('photo', newRoomData.photo);
    }

    // The URL is corrected to include the 'sections' parameter
    const response = await axios.put(
      `http://localhost:8000/api/v1/maps/${map._id}/floors/${floorIndex + 1}/sections/${sectionIndex}/rooms/${roomIndex}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );

    if (response.data.success) {
      alert("Room updated successfully!");
      // Update the state to reflect the new data
      setMap((prevMap) => {
        const updatedFloors = [...prevMap.floors];
        updatedFloors[floorIndex].sections[sectionIndex].rooms[roomIndex] = response.data.data;
        return { ...prevMap, floors: updatedFloors };
      });
    } else {
      alert(response.data.message);
    }
  } catch (err) {
    alert("Error updating room.");
    console.error("Update room error:", err);
  }
};
  
  const regenerateQrCode = (floorIndex, sectionIndex, roomIndex) => {
    alert("Functionality to regenerate QR code is not yet implemented on the backend.");
  };

  if (loading) return <div className="loading">Loading map...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!map) return <div className="not-found">Map not found.</div>;

  return (
    <div className="edit-map-container">
      <h2>Edit Map: {map.title}</h2>
      {map.floors.map((floor, fIndex) => (
        <div key={fIndex} className="floor-block">
          <h3>Floor {floor.floorNumber}</h3>
          {floor.sections.map((section, sIndex) => (
            <div key={sIndex} className="section-block">
              <h4>Section {section.sectionNumber}</h4>
              {section.rooms.map((room, rIndex) => (
                <RoomEditor
                  key={rIndex}
                  room={room}
                  onUpdate={(newRoomData) => handleRoomUpdate(fIndex, sIndex, rIndex, newRoomData)}
                  onRegenerateQr={() => regenerateQrCode(fIndex, sIndex, rIndex)}
                />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const RoomEditor = ({ room, onUpdate, onRegenerateQr }) => {
  const [name, setName] = useState(room.name);
  const [notes, setNotes] = useState(room.notes);
  const [photo, setPhoto] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ name, notes, photo });
  };

  return (
    <form onSubmit={handleSubmit} className="room-editor-form">
      <div className="form-group">
        <label>Room Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Notes:</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Room Photo:</label>
        {room.photo && (
          <div className="current-photo">
            <img src={`http://localhost:8000/${room.photo}`} alt={room.name} />
          </div>
        )}
        <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />
      </div>
      <div className="room-actions">
        <button type="submit" className="update-btn">Update</button>
        <button type="button" className="regenerate-btn" onClick={onRegenerateQr}>Regenerate QR</button>
      </div>
    </form>
  );
};

export default EditMap;