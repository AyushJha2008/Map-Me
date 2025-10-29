import React from 'react'
import './Landing.css'
import mapmeIcon from '../assets/mapme-icon.png'
import heroIcon from '../assets/heroIcon.png'
import { Link, useNavigate } from 'react-router-dom' // 💡 Import useNavigate
import Login from '../Login/Login'

const Landing = () => {
  // 💡 Initialize the hook to get the navigate function
  const navigate = useNavigate(); 

  const handleVisitorClick = () => {
    // This will now correctly navigate to the /visitor route
    navigate(`/visitor`);
  };

  return (
    <div className='landingPage'>
      <header className='landingNavbar'>
        <div className="head-left">
          <img src={mapmeIcon} alt="" />
          <span>Map Me</span>
        </div>

        <div className="head-right">
          <a href="#">About</a>
          <a href="#">Contact</a>
          <a href="/login">Login</a> {/* Changed href to /login */}
        </div>
      </header>

      <main className='landingMain'>
        <div className="main-left">
          <h1>Navigate any Indoor Space with Ease</h1>
          <p>Organize Events without worrying about visitor navigation, map-me let your visitors Explore buildings effortlessly with Interactive Maps</p>

          <Link to='/login'><button id='organizerLogin'>I'm an Organizer</button></Link>
          <button id='visitorLogin' onClick={handleVisitorClick}>I'm a Visitor</button>
        </div>

        <div className="main-right">
          <img src={heroIcon} alt="" />
        </div>
      </main>
    </div>
  )
}

export default Landing