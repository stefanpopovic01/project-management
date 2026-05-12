import { React, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'

import { login } from '../../api/services/authServices';
import { AuthContext } from '../../contex/AuthContext';

import backgroundimg1 from '../../assets/login1.png';
import backgroundimg2 from '../../assets/login2.png'

function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    
    const { loginContext } = useContext(AuthContext);

    // const navigate = useNavigate();

    const handeLogin = async (e) => {
        e.preventDefault();

        try {
          const res = await login({ username, password });

          setSuccess(true);
          setError("");
          loginContext(res.data.user, res.data.access, res.data.refresh);
          // navigate("/dashboard");

        } catch (err) {
          setError(err.response?.data?.message || "Wrong credentials.");
          setSuccess(false);
        }
    };

  return (
    <div className="login-container">
    <div className="hero-grid-bg" />
      <form className="login-form" onSubmit={handeLogin}>
        <h2>Login</h2>

        <label>Username</label>
        <input type="username" placeholder="Enter username" required value={username} onChange={(e) => setUsername(e.target.value)}/>

        <label>Password</label>
        <input type="password" placeholder="********" required value={password} onChange={(e) => setPassword(e.target.value)}/>

        <button type="submit">Submit</button>

        <p className="register-link">
          Not registered? <span onClick={() => navigate("/register")}>Register</span>
        </p>

        {success && <p className="success-msg">Welcome back, you’re logged in!</p>}
        {error && <p className="error-msg">{error}</p>}

      </form>

        <img src={backgroundimg1} className='backgroundImg1' alt='background photo'/>
        <img src={backgroundimg2} className='backgroundImg2' alt='background photo'/>

    </div>
  )
}

export default Login;
