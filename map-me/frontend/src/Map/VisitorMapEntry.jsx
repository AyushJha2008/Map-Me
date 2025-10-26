import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './visitorMapEntry.css'; // Create this CSS file

const VisitorMapEntry = () => {
    const [qrCodeValue, setQrCodeValue] = useState('');
    const navigate = useNavigate();

    const handleScan = () => {
        if (!qrCodeValue) {
            alert("Please enter a QR code value (Map ID or Room ID).");
            return;
        }
        
        // For simplicity, we assume the QR code contains the Map ID for the map view.
        // In a real application, you would parse the QR code to determine if it's a map ID or room ID.
        // For now, we will assume it's a map ID for the base map view.
        // The MapView component will handle the "current location" logic based on a URL parameter.

        // For this demo: navigate to MapView, passing the QR value as a parameter for "current location"
        navigate(`/map/visitor/view/${qrCodeValue}`);
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