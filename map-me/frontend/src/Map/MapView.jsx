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
                    {floor.sections.map((section, sIndex) => (
                        <div key={sIndex} className="section-display-block">
                            <h4>Section {section.sectionNumber}</h4>
                            <div className="rooms-container">
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
            ))}

            {selectedRoom && (
                <RoomView room={selectedRoom} onClose={() => setSelectedRoom(null)} />
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