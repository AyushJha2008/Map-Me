import React, { useState } from 'react'
import './login.css'
import { useNavigate } from 'react-router-dom'

const Login = () => {

  const navigate = useNavigate();
  const [signState, setSignState] = useState("Sign In")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });


  const handleSubmit = async (e) => {
    e.preventDefault();
  // For Sign In — used DummyJSON API
    if (signState === "Sign In") {
      try {
        const res = await fetch("https://dummyjson.com/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        });
        
        const data = await res.json();
        if (res.ok) { //on complete login
          console.log("Login success:", data);
          localStorage.setItem("token", data.token);
          alert("Login successful!");
          navigate("/");
        } else {  //invalid credentials
          alert("Invalid login: " + data.message);
          navigate("/")
        }
      } catch (err) {
        console.error("Login error:", err);
      }
    } else {
      alert("Sign up logic is not implemented (DummyJSON doesn't support sign-up).");
    }
    console.log("Submitted:", {
    username: formData.username,
    password: formData.password,
  });

  };

  return (
    <div className='login'>
      <div className="logForm">
        <h2>{signState}</h2>
        <form onSubmit={handleSubmit}>
          {signState === "Sign Up" && (
            <input
              type="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          )}
          <input
            type="text"
            placeholder="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <button type='submit'>{signState}</button>
        </form>
        <div className="form-switch">
          {signState=="Sign In"?<p>New User?? <span onClick={()=>{setSignState("Sign Up")}}>Sign Up Now</span></p>
          :<p>Already have an account?? <span onClick={()=> {setSignState("Sign In")}}>Sign In Now</span></p>
          }                 
        </div>
      </div>
    </div>
  )
}

export default Login