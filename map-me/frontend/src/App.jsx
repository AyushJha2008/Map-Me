import React from 'react'
import './App.css'
import {Route, Routes} from 'react-router-dom'
import Landing from './landing/Landing'
import Login from './Login/Login'
import Dashboard from './Dashboard/Dashboard'
import CreateMap from "./Map/CreateMap";
import UpdateMap from "./Map/UpdateMap";
import DeleteMap from "./Map/DeleteMap";
import MapView from "./Map/MapView";
import FloorView from "./Map/FloorView";
import RoomView from "./Map/RoomView";


const App = () => {
  return (
    <div>
      <Routes>

        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-map" element={<CreateMap />} />
        <Route path="/update-map" element={<UpdateMap />} />
        <Route path="/delete-map" element={<DeleteMap />} />
        <Route path="/map/:id" element={<MapView />} />
        <Route path="/map/:id/floor/:floorId" element={<FloorView />} />
        <Route path="/map/:id/room/:roomId" element={<RoomView />} />
      </Routes>
    </div>
  )
}

export default App