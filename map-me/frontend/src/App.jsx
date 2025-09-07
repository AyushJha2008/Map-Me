import React from 'react'
import './App.css'
import mapmeIcon from './assets/mapme-icon.png'
import heroIcon from './assets/heroIcon.png'

const App = () => {
  return (
    <div>
      <header className='landingNavbar'>
        <div className="head-left">
          <img src={mapmeIcon} alt="" />
          <span>Map Me</span>
        </div>

        <div className="head-right">
          <a href="#">About</a>
          <a href="#">Contact</a>
          <a href="">Login</a>
        </div>
      </header>

      <main>
        <div className="main-left">
          <h3>Navigate any Indoor Space with Ease</h3>
          <p>Organize or Explore buildings effortlessly with Interactive Maps</p>

          <button>I'm an Organizer</button>
          <button>I'm a Visitor</button>
        </div>

        <div className="main-right">
          <img src={heroIcon} alt="" />
        </div>
      </main>
    </div>
  )
}

export default App