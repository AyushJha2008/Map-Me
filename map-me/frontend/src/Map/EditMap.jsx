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
  const [localMapChanges, setLocalMapChanges] = useState({}); // Stores {roomKey: {name, notes, photo}}

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
  
  // Utility function to generate a unique key for a room
  const getRoomKey = (fIndex, sIndex, rIndex) => `${fIndex}-${sIndex}-${rIndex}`;

  const handleInputChange = (fIndex, sIndex, rIndex, field, value) => {
    const key = getRoomKey(fIndex, sIndex, rIndex);
    
    // Update the local changes state
    setLocalMapChanges(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      }
    }));
  };

  const handleSaveAllChanges = async () => {
    if (!map) return;
    
    const token = localStorage.getItem("accessToken");
    let hasError = false;
    let successfulUpdates = 0;

    // Iterate through all floors/sections/rooms to check for local changes
    for (let fIndex = 0; fIndex < map.floors.length; fIndex++) {
      const floor = map.floors[fIndex];
      for (let sIndex = 0; sIndex < floor.sections.length; sIndex++) {
        const section = floor.sections[sIndex];
        for (let rIndex = 0; rIndex < section.rooms.length; rIndex++) {
          const room = section.rooms[rIndex];
          const key = getRoomKey(fIndex, sIndex, rIndex);
          const changes = localMapChanges[key];
          
          // Only send API call if changes exist for this room OR if the button explicitly handles everything
          if (changes || changes?.photo || changes?.regenerateQr) {
            
            const formData = new FormData();
            
            // Text inputs
            formData.append('name', changes?.name !== undefined ? changes.name : room.name);
            formData.append('notes', changes?.notes !== undefined ? changes.notes : room.notes);
            
            // Photo File (handle individually to preserve file object)
            if (changes?.photo instanceof File) {
              formData.append('photo', changes.photo);
            }

            // QR Code Regeneration
            if (changes?.regenerateQr === true) {
              formData.append('regenerateQr', 'true');
            }

            try {
              const response = await axios.put(
                `http://localhost:8000/api/v1/maps/${map._id}/floors/${fIndex + 1}/sections/${sIndex}/rooms/${rIndex}`,
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
                successfulUpdates++;
                // Update the original map state with the response data
                setMap(prevMap => {
                  const newMap = JSON.parse(JSON.stringify(prevMap));
                  newMap.floors[fIndex].sections[sIndex].rooms[rIndex] = response.data.data;
                  return newMap;
                });
                
                // Clear the local change for this room
                setLocalMapChanges(prev => {
                    const newChanges = {...prev};
                    delete newChanges[key];
                    return newChanges;
                });
                
              } else {
                alert(`Error updating ${room.name}: ${response.data.message}`);
                hasError = true;
              }

            } catch (err) {
              alert(`Network Error saving ${room.name}. See console.`);
              console.error("Batch Save Error:", err);
              hasError = true;
            }
          }
        }
      }
    }

    if (!hasError) {
      alert(`Successfully saved changes for ${successfulUpdates} rooms!`);
    } else {
      alert(`Completed with ${successfulUpdates} successes and some errors.`);
    }
  };

  const regenerateQrCode = (fIndex, sIndex, rIndex) => {
     // Mark for regeneration on save
     handleInputChange(fIndex, sIndex, rIndex, 'regenerateQr', true);
     alert(`QR code for Room ${rIndex + 1} marked for regeneration upon saving.`);
  };


  if (loading) return <div className="loading">Loading map...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!map) return <div className="not-found">Map not found.</div>;

  return (
    <div className="edit-map-container">
      <h2>Edit Map: {map.title}</h2>
      
      {/* 💡 Main Save Button */}
      <div className="main-save-button-container">
        <button 
            onClick={handleSaveAllChanges} 
            className="submit-btn"
        >
            Save All Changes
        </button>
      </div>
      
      {map.floors.map((floor, fIndex) => (
        <div key={fIndex} className="floor-block">
          <h3>Floor {floor.floorNumber}</h3>
          {floor.sections.map((section, sIndex) => (
            <div key={sIndex} className="section-block">
              <h4>Section {section.sectionNumber}</h4>
              {section.rooms.map((room, rIndex) => {
                const key = getRoomKey(fIndex, sIndex, rIndex);
                const currentChanges = localMapChanges[key] || {};
                
                return (
                  <RoomEditor
                    key={key}
                    room={room}
                    // Pass current local changes and the global handler
                    localChanges={currentChanges} 
                    onInputChange={(field, value) => handleInputChange(fIndex, sIndex, rIndex, field, value)}
                    onRegenerateQr={() => regenerateQrCode(fIndex, sIndex, rIndex)}
                  />
                )
              })}
            </div>
          ))}
        </div>
      ))}
      
      {/* 💡 Final Save Button after map content */}
      <div className="main-save-button-container">
        <button 
            onClick={handleSaveAllChanges} 
            className="submit-btn"
        >
            Save All Changes
        </button>
      </div>
    </div>
  );
};

// --- RoomEditor is now a fully controlled component ---
const RoomEditor = ({ room, localChanges, onInputChange, onRegenerateQr }) => {
  // Use map's original value OR local pending changes for display
  const name = localChanges.name !== undefined ? localChanges.name : room.name;
  const notes = localChanges.notes !== undefined ? localChanges.notes : room.notes;
  const isQrRegenPending = localChanges.regenerateQr === true;

  // Since it is controlled, handleSubmit is no longer needed
  // File input needs special handling because it deals with the File object
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    onInputChange('photo', file);
  };
  
  // Get the display URL for the photo: local file preview or original URL
  const photoUrl = localChanges.photo instanceof File 
                   ? URL.createObjectURL(localChanges.photo) 
                   : (room.photo ? `http://localhost:8000/${room.photo}` : null);


  return (
    <div className="room-editor-form">
      <div className="form-group">
        <label>Room Name:</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => onInputChange('name', e.target.value)} 
        />
      </div>
      
      <div className="form-group">
        <label>Notes:</label>
        <textarea 
          value={notes} 
          onChange={(e) => onInputChange('notes', e.target.value)} 
        />
      </div>
      
      <div className="form-group">
        <label>Room Photo:</label>
        {photoUrl && (
          <div className="current-photo">
            <img src={photoUrl} alt={name} />
          </div>
        )}
        {/* Reset file input value after saving, but we track the File object in state */}
        <input type="file" onChange={handleFileChange} />
      </div>

      <div className="form-group">
        <label>QR Code:</label>
        <div className="qr-code-display">
            <p>{room.qrCode}</p>
            {isQrRegenPending && <span className="pending-tag">(Regeneration Pending)</span>}
        </div>
      </div>

      <div className="room-actions">
        {/* This button is now purely cosmetic or for highlighting pending action */}
        <button type="button" className="regenerate-btn" onClick={onRegenerateQr}>
            {isQrRegenPending ? 'Undo Regen' : 'Regenerate QR'}
        </button>
        <p className="pending-message">Changes are saved by the main "Save All Changes" button.</p>
      </div>
    </div>
  );
};

export default EditMap;