// import React from 'react'
// import './App.css'
// import {Route, Routes} from 'react-router-dom'
// import Landing from './landing/Landing'
// import Login from './Login/Login'
// import Dashboard from './Dashboard/Dashboard'
// import CreateMap from "./Map/CreateMap";
// import UpdateMap from "./Map/UpdateMap";
// import DeleteMap from "./Map/DeleteMap";
// import MapView from "./Map/MapView";
// import FloorView from "./Map/FloorView";
// import RoomView from "./Map/RoomView";
// import EditMap from "./Map/EditMap"

// const App = () => {
//   return (
//     <div>
//       <Routes>

//         <Route path="/" element={<Landing />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/create-map" element={<CreateMap />} />
//         <Route path="/update-map" element={<UpdateMap />} />
//         <Route path="/delete-map" element={<DeleteMap />} />
//         <Route path='/edit-map/:id' element={<EditMap />} />
//         <Route path="/map/:id" element={<MapView />} />
//         <Route path="/map/:id/floor/:floorId" element={<FloorView />} />
//         <Route path="/map/:id/room/:roomId" element={<RoomView />} />
//       </Routes>
//     </div>
//   )
// }

// export default App

import React from 'react'
import './App.css'
import {Route, Routes, Navigate} from 'react-router-dom'
import Landing from './landing/Landing'
import Login from './Login/Login'
import Dashboard from './Dashboard/Dashboard'
import CreateMap from './Map/CreateMap';
import UpdateMap from './Map/UpdateMap';
import DeleteMap from './Map/DeleteMap';
import EditMap from './Map/EditMap'; 
import MapView from './Map/MapView'; // Assuming you put the component here
import VisitorMapEntry from './Map/VisitorMapEntry'


// === New Protected Route Component ===
const ProtectedRoute = ({ element: Component }) => {
    const isAuthenticated = localStorage.getItem("accessToken");
    
    // If the token exists, render the component.
    // If it doesn't, redirect to the login page.
    return isAuthenticated ? Component : <Navigate to="/login" replace />;
};
// ===================================




const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/login' element={<Login />} />

        {/* new visitor entry route */}
        <Route path='/visitor' element={<VisitorMapEntry />} />

        <Route path='/map/visitor/view/:qrValue' element={<MapView />} />
        
        {/* Protected Routes: Check if user is logged in before rendering */}
        <Route path='/dashboard' element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path='/create-map' element={<ProtectedRoute element={<CreateMap />} />} />
        <Route path='/update-map' element={<ProtectedRoute element={<UpdateMap />} />} />
        <Route path='/delete-map' element={<ProtectedRoute element={<DeleteMap />} />} />
        <Route path='/edit-map/:id' element={<ProtectedRoute element={<EditMap />} />} />
        <Route path="/map/visitor/:id" element={<MapView />} />
        
        {/* Visitor Routes (if applicable, which should be public) */}
        {/* <Route path="/map/:id" element={<MapView />} /> */}
        {/* <Route path="/map/:id/floor/:floorId" element={<FloorView />} /> */}
        {/* <Route path="/map/:id/room/:roomId" element={<RoomView />} /> */}
      </Routes>
    </div>
  )
}

export default App