import React, { useState } from "react";
import "./CreateMap.css";

const CreateMap = () => {
  const [map, setMap] = useState({
    title: "",
    floors: [],
  });

  // Handle Title change
  const handleTitleChange = (e) => {
    setMap({ ...map, title: e.target.value });
  };

  // Add new Floor
  const addFloor = () => {
    setMap((prev) => ({
      ...prev,
      floors: [
        ...prev.floors,
        { floorNumber: prev.floors.length + 1, sections: [] },
      ],
    }));
  };

  // Add new Section inside a Floor
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

  // Add new Room inside a Section
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

  // Save / Submit Map (send to backend later)
  const handleSubmit = () => {
    console.log("Map Data: ", map);
    alert("Map Created! Check console for JSON");
    // Later: send this map object to backend API
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

      <button onClick={addFloor} className="add-btn">+ Add Floor</button>

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

      <button onClick={handleSubmit} className="submit-btn">Save Map</button>
    </div>
  );
};

export default CreateMap;
