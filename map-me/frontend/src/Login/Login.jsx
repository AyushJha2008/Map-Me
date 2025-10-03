import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isLogin
      ? "http://localhost:8000/api/v1/auth/login"
      : "http://localhost:8000/api/v1/auth/register";

    const body = isLogin ? { email: form.email, password: form.password } : form;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message); // This will show the specific error from the backend
        return;
      }

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("accessToken", data.accessToken);
        navigate("/dashboard");
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("something went wrong while fetching user");
      console.log(err);
    }
  };

  return (
    <div className='loginCont'>
      <div className='loginHead'>
        <h2>{isLogin ? "Organizer Login" : "Organizer Signup"}</h2>
      </div>

      <form className='loginForm' onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            placeholder='FullName'
            name='fullName'
            value={form.fullName}
            onChange={handleChange}
            required
          />
        )}
        <input
          type="email"
          placeholder='email'
          name='email'
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          placeholder='password'
          name='password'
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type='submit'>{isLogin ? "Login" : "Sign up"}</button>
      </form>

      <p className='loginSwitch'>
        {isLogin ? "Don't have an account?" : "Already have an account?"}
        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Sign up" : "Login"}
        </button>
      </p>
    </div>
  );
};

export default Login;