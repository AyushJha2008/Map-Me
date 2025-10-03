import React, { useState } from "react";
import "./CreateMap.css";
import { useNavigate } from "react-router-dom";

const CreateMap = () => {
  const navigate = useNavigate();
  const [map, setMap] = useState({
    title: "",
    floors: [],
  });

  const handleTitleChange = (e) => {
    setMap({ ...map, title: e.target.value });
  };

  const addFloor = () => {
    setMap((prev) => ({
      ...prev,
      floors: [
        ...prev.floors,
        { floorNumber: prev.floors.length + 1, sections: [] },
      ],
    }));
  };

  const addSection = (floorIndex) => {
    setMap((prev) => {
      const updatedFloors = [...prev.floors];
      updatedFloors[floorIndex].sections.push({
        sectionNumber: updatedFloors[floorIndex].sections.length + 1,
        rooms: [],
      });
      return { ...prev, floors: updatedFloors };
    });
  };

  const addRoom = (floorIndex, sectionIndex) => {
    setMap((prev) => {
      const updatedFloors = [...prev.floors];
      updatedFloors[floorIndex].sections[sectionIndex].rooms.push({
        name: `Room ${updatedFloors[floorIndex].sections[sectionIndex].rooms.length + 1}`,
        notes: "",
        photo: "",
      });
      return { ...prev, floors: updatedFloors };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem("accessToken");
        
        if (!token) {
            alert("You are not logged in. Please log in first.");
            navigate("/login"); 
            return;
        }

        const response = await fetch("http://localhost:8000/api/v1/maps", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, 
            },
            body: JSON.stringify(map),
        });

        if (response.status === 401) {
            alert("Your session has expired. Please log in again.");
            localStorage.removeItem("accessToken"); // Clear invalid token
            navigate("/login");
            return;
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to create map.");
        }

        const data = await response.json();
        if (data.success) {
            alert("Map created successfully!");
            navigate(`/update-map`);
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
        console.error("Error:", error);
    }
  };

  return (
    <div className="create-map">
      <h2>Create New Map</h2>
      <input
        type="text"
        placeholder="Enter Map Title"
        value={map.title}
        onChange={handleTitleChange}
      />
      <button onClick={addFloor} className="add-btn">
        + Add Floor
      </button>
      <div className="floors-list">
        {map.floors.map((floor, fIndex) => (
          <div key={fIndex} className="floor-block">
            <h3>Floor {floor.floorNumber}</h3>
            <button onClick={() => addSection(fIndex)} className="add-btn">
              + Add Section
            </button>
            <div className="sections-list">
              {floor.sections.map((section, sIndex) => (
                <div key={sIndex} className="section-block">
                  <h4>Section {section.sectionNumber}</h4>
                  <button
                    onClick={() => addRoom(fIndex, sIndex)}
                    className="add-btn"
                  >
                    + Add Room
                  </button>
                  <div className="rooms-list">
                    {section.rooms.map((room, rIndex) => (
                      <div key={rIndex} className="room-box">
                        {room.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={handleSubmit} className="submit-btn">
        Save Map
      </button>
    </div>
  );
};

export default CreateMap;