import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './visitorMapEntry.css'; // Create this CSS file
import axios from 'axios';

const VisitorMapEntry = () => {
    const [qrCodeValue, setQrCodeValue] = useState('');
    const navigate = useNavigate();

    const handleScan = async () => {
        if (!qrCodeValue) {
            alert("Please enter a QR code value (Map ID or Room ID).");
            return;
        }

        // Declare variables outside try/catch for scope
        let mapId = qrCodeValue;
        let finalQrCode = null;

        try {
            // 1. Attempt to fetch the map by treating the QR code as a Map ID (e.g., /maps/visitor/:mapId)
            await axios.get(`http://localhost:8000/api/v1/maps/visitor/${qrCodeValue}`);
            
            // If the map is successfully fetched here, mapId is correct, and finalQrCode remains null.

        } catch (mapFetchError) {
            // 2. If map fetch failed (e.g., 404 or invalid ID), assume it's a Room QR code
            try {
                // Use the new QR code search endpoint
                const qrResponse = await axios.get(`http://localhost:8000/api/v1/maps/qr-search/${qrCodeValue}`);
                
                // If successful, use the map ID and QR code returned by the backend
                mapId = qrResponse.data.mapId;
                finalQrCode = qrResponse.data.qrCode; 

            } catch (qrSearchError) {
                // If both attempts fail, alert the user and stop
                alert("The entered code is neither a valid Map ID nor a recognized Room QR Code.");
                console.error("QR Search Error:", qrSearchError);
                return;
            }
        }
        
        // 3. Final Navigation: Use the determined mapId and optional finalQrCode
        // We pass the mapId and the optional room QR code (or an empty string if null)
        navigate(`/map/visitor/view/${mapId}/${finalQrCode || ''}`);
    };
    

    return (
        <div className="visitor-entry-container">
            <h2>Welcome Visitor</h2>
            <p>Scan a QR code to navigate the building.</p>

            <div className="input-group">
                <input
                    type="text"
                    placeholder="Enter QR Code Value (Simulated Scan)"
                    value={qrCodeValue}
                    onChange={(e) => setQrCodeValue(e.target.value)}
                />
                <button onClick={handleScan} className="scan-btn">
                    Scan QR / View Map
                </button>
            </div>
            
            <p className="note">
                (Note: You can paste a Map ID or a Room's QR Code value here to test.)
            </p>
        </div>
    );
};

export default VisitorMapEntry;