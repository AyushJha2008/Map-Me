import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './mapView.css'; // Create this CSS file

const MapView = () => {
    const { mapId, qrValue } = useParams();
    const [map, setMap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);

    const mapToFetchId = mapId;
    const highlightQrCode = qrValue;

    const startRoom = map.floors.flatMap(f => f.sections.flatMap(s => s.rooms))
        .find(r => r.qrCode === highlightQrCode) || null;

    useEffect(() => {
        const fetchMap = async () => {
            if (!mapToFetchId) {
                setError("Invalid Map or QR Code provided.");
                setLoading(false);
                return;
            }
            try {
                // Use the new public endpoint
                const response = await axios.get(`http://localhost:8000/api/v1/maps/visitor/${mapToFetchId}`);

                if (response.data.success) {
                    setMap(response.data.data);
                } else {
                    setError(response.data.message);
                }
            } catch (err) {
                setError("Map not found or connection error.");
                console.error("Visitor fetch map error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMap();
    }, [mapToFetchId]);

    const RoomView = ({ room, onClose, startRoom }) => { // 💡 Receive startRoom prop

    const handleGoHere = () => {
        if (!startRoom) {
            alert("Error: Cannot set route. Your current location (start point) is unknown.");
            return;
        }
        
        // --- SIMULATED ROUTING LOGIC ---
        // Basic calculation of floor numbers for the alert message
        const getFloorNumber = (roomName) => {
            const match = roomName.match(/[E]?(\d+)/); // Extracts numbers, e.g., '101'
            if (match) {
                // If room is E101, floor is 1 (101 / 100 = 1.01 -> floor 1)
                return Math.floor(parseInt(match[1]) / 100); 
            }
            return 'Unknown';
        };

        const startFloor = getFloorNumber(startRoom.name);
        const endFloor = getFloorNumber(room.name);
        const floorDifference = Math.abs(endFloor - startFloor);
        
        let routeMessage = `Routing from ${startRoom.name} (Floor ${startFloor}) to ${room.name} (Floor ${endFloor}):\n\n`;

        if (floorDifference === 0) {
             routeMessage += "You are on the same floor. Follow the path directly.";
        } else {
             routeMessage += `Route via Stairs: Travel ${floorDifference} floors using the nearest staircase.
             Route via Lift: Travel ${floorDifference} floors using the nearest lift.`;
        }
        
        alert(routeMessage);
    };

    const isCurrentRoom = startRoom?._id === room._id;
    const canRoute = startRoom && !isCurrentRoom;
    return (
        <div className="room-modal-backdrop">
            <div className="room-modal-content">
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h3>{room.name}</h3>
                
                {/* 💡 NEW: Go here button */}
                {canRoute && (
                    <button className="go-here-btn" onClick={handleGoHere}>
                        Go here 🧭
                    </button>
                )}
                
                {/* ... existing photo, notes, qrCode display ... */}
                
                <p className="room-modal-notes">{room.notes || "No extra notes available."}</p>
                <div className="room-modal-footer">
                    <p>QR Code: {room.qrCode}</p>
                </div>
            </div>
        </div>
    );
};

    if (loading) return <div className="loading">Loading Map...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!map) return <div className="not-found">Map not available.</div>;

    return (
        <div className="visitor-map-container">
            <h2>Welcome to: {map.title}</h2>
            
            {/* Display current location message if a QR code was provided */}
            {highlightQrCode && (
                <div className="current-location-banner">
                    Current Location: **{
                        // Find the room that matches the highlightQrCode
                        map.floors.flatMap(f => f.sections.flatMap(s => s.rooms))
                            .find(r => r.qrCode === highlightQrCode)?.name || 'Unknown Room'
                    }**
                </div>
            )}

            {map.floors.map((floor, fIndex) => (
                <div key={fIndex} className="floor-display-block">
                    <h3>Floor {floor.floorNumber}</h3>

                    {/* 💡 NEW WRAPPER: This container enables horizontal scrolling for all sections */}
                    <div className="floor-sections-scroll-wrapper">
                    {floor.sections.map((section, sIndex) => (
                        <div key={sIndex} className="section-display-block-scrollable">
                            <h4>Section {section.sectionNumber}</h4>
                            <div className="rooms-container-scrollable">
                                {section.rooms.map((room, rIndex) => (
                                    <div
                                        key={rIndex}
                                        className={`room-box-clickable ${room.qrCode === highlightQrCode ? 'room-highlight' : ''}`}
                                        onClick={() => setSelectedRoom(room)}
                                    >
                                        {room.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
            ))}

            {selectedRoom && (
                <RoomView room={selectedRoom} onClose={() => setSelectedRoom(null)}
                startRoom={startRoom} />
            )}
        </div>
    );
};


// RoomView Component (As a modal or separate detail view)
const RoomView = ({ room, onClose }) => {
    return (
        <div className="room-modal-backdrop">
            <div className="room-modal-content">
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h3>{room.name}</h3>
                {room.photo && (
                    <img
                        src={`http://localhost:8000/${room.photo}`}
                        alt={room.name}
                        className="room-modal-photo"
                    />
                )}
                <p className="room-modal-notes">{room.notes || "No extra notes available."}</p>
                <div className="room-modal-footer">
                    <p>Use QR Code: {room.qrCode}</p>
                </div>
            </div>
        </div>
    );
};

export default MapView;