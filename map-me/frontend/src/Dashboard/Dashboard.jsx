import React from 'react'
import mapeIcon from '../assets/mapme-icon.png'
import loginIcon from '../assets/login-icon.png' 
import deleteIcon from '../assets/delete-icon.png'
import updateIcon from '../assets/update-icon.png'
import createIcon from '../assets/create-icon.png'
import './Dashboard.css'

const Dashboard = () => {
  return (
    <div className='dashboard-cont'>
        <header>
            <div className="dashboard-icon"><img src={mapeIcon}/> <p>Map Me</p></div>
            <div className="dashboard-para">Organizer Dashboard</div>
            <div className="dashboard-login"><img src={loginIcon} alt="" /></div>
        </header>

        <main>
            <div className="toolsDash">
                <img src={createIcon}/>
                <p>Create Map</p>
            </div>
            <div className="toolsDash">
                <img src={updateIcon}/>
                <p>Update Map</p>
            </div>
            <div className="toolsDash">
                <img src={deleteIcon} />
                <p>Delete Map</p>
            </div>
        </main>

    </div>
  )
}

export default Dashboard