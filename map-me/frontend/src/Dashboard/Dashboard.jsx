import React from 'react'
import mapeIcon from '../assets/mapme-icon.png'
import loginIcon from '../assets/login-icon.png' 
import deleteIcon from '../assets/delete-icon.png'
import updateIcon from '../assets/update-icon.png'
import createIcon from '../assets/create-icon.png'
import './Dashboard.css'
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const navigate = useNavigate();
  return (
    <div className='dashboard-cont'>
        <header>
            <div className="dashboard-icon"><img src={mapeIcon}/> <p>Map Me</p></div>
            <div className="dashboard-para">Organizer Dashboard</div>
            <div className="dashboard-login"><img src={loginIcon} alt="" /></div>
        </header>

        <main>
            <div className="toolsDash" onClick={()=> navigate('/create-map')}>
                <img src={createIcon}/>
                <p>Create Map</p>
            </div>
            <div className="toolsDash" onClick={() => navigate("/update-map")}>
                <img src={updateIcon}/>
                <p>Update Map</p>
            </div>
            <div className="toolsDash" onClick={() => navigate("/delete-map")}>
                <img src={deleteIcon} />
                <p>Delete Map</p>
            </div>
        </main>

    </div>
  )
}

export default Dashboard