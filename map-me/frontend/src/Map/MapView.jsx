import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './mapView.css';

const MapView = () => {
    // mapId is the actual map ID, qrValue is the optional room QR code for highlighting
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
                // Use the public endpoint
                const response = await axios.get(`http://localhost:8000/api/v1/maps/visitor/${mapToFetchId}`);

                if (response.data.success) {
                    setMap(response.data.data);
                } else {
                    // If backend sends success:false but 200 status
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

    const startRoom = map.floors?.flatMap(f => f.sections?.flatMap(s => s.rooms))
        .find(r => r.qrCode === highlightQrCode) || null;

    // Use optional chaining (map?.floors, section?.rooms) to prevent crashes
    return (
        <div className="visitor-map-container">
            <h2>Welcome to: {map.title}</h2>
            
            {/* Display current location message if a QR code was provided */}
            {highlightQrCode && (
                <div className="current-location-banner">
                    Current Location: **{
                        startRoom?.name || 'Unknown Room'
                    }**
                </div>
            )}

            {map.floors?.map((floor, fIndex) => (
                <div key={fIndex} className="floor-display-block">
                    <h3>Floor {floor.floorNumber}</h3>

                    <div className='floor-section-scroll-wrapper'>
                    {floor.sections?.map((section, sIndex) => (
                        <div key={sIndex} className="section-display-block-scrollable">
                            <h4>Section {section.sectionNumber}</h4>
                            <div className="rooms-container-scrollable">
                                {section.rooms?.map((room, rIndex) => (
                                    <div
                                        key={rIndex}
                                        className={`room-box-clickable 
                                            ${room.qrCode === highlightQrCode ? 'room-highlight' : ''}
                                            ${room.classification ? room.classification.toLowerCase() : 'normal'}`}
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
                <RoomView 
                room={selectedRoom} 
                onClose={() => setSelectedRoom(null)}
                startRoom={startRoom} map={map} />
            )}
        </div>
    );
};


// RoomView Component (As a modal or separate detail view)
const RoomView = ({ room, onClose, startRoom, map }) => {
    const handleGoHere = () => {
        if (!startRoom) {
            alert("Error: Cannot set route. Your current location (start point) is unknown.");
            return;
        }
        
        const getFloorNumber = (roomObj) => {
            for(const floor of map.floors) {
                for(const section of floor.sections) {
                    if(section.rooms.some(r => r._id === roomObj._id)) {
                        return floor;
                    }
                }
            }
            return 'Unknown';
        };

        const startFloor = getFloorNumber(startRoom);
        const endFloor = getFloorNumber(room);
        const floorDifference = Math.abs(endFloor - startFloor);
        
        let routeMessage = `Routing from ${startRoom.name} (Floor ${startFloor}) to ${room.name} (Floor ${endFloor}):\n\n`;

        // Simplified POI Check: Check if *any* room is classified as Stairs or Lift on *any* floor.
        const hasStairs = map.floors?.some(f => f.sections?.some(s => s.rooms?.some(r => r.classification === 'Stairs')));
        const hasLift = map.floors?.some(f => f.sections?.some(s => s.rooms?.some(r => r.classification === 'Lift')));

        if (floorDifference === 0) {
             routeMessage += "You are on the same floor. Follow the path directly.";
        } else {
             if (hasStairs) {
                 routeMessage += `\nRoute via Stairs: Find the nearest 'Stairs' room on Floor ${startFloor} to change floors.`;
             }
             if (hasLift) {
                 routeMessage += `\nRoute via Lift: Find the nearest 'Lift' room on Floor ${startFloor} to change floors.`;
             }
             if (!hasStairs && !hasLift) {
                 routeMessage += "\nRouting requires Stair or Lift rooms to be defined on the map.";
             }
            }
        
        alert(routeMessage);
    };

    const isCurrentRoom = startRoom?.qrCode === room.qrCode;
    const canRoute = startRoom && !isCurrentRoom;
    const classification = room.classification || 'Normal';

    return (
        <div className="room-modal-backdrop">
            <div className="room-modal-content">
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h3>{room.name}</h3>
                
                {canRoute && (
                    <button className="go-here-btn" onClick={handleGoHere}>
                        Go here 🧭
                    </button>
                )}
                
                {room.photo && (
                    <img
                        src={`http://localhost:8000/${room.photo}`}
                        alt={room.name}
                        className="room-modal-photo"
                    />
                )}
                <p className="room-modal-notes">
                    **Classification:** {classification} <br />
                    {room.notes || "No extra notes available."}</p>
                <div className="room-modal-footer">
                    <p>QR Code: {room.qrCode}</p>
                </div>
            </div>
        </div>
    );
};

export default MapView;