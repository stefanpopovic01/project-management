import { React, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'

import { login } from '../../api/services/authServices';
import { AuthContext } from '../../contex/AuthContext';

function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    
    const { loginContext } = useContext(AuthContext);

    const navigate = useNavigate();

    const handeLogin = async (e) => {
        e.preventDefault();

        try {
          const res = await login({ username, password });

          setSuccess(true);
          setError("");
          loginContext(res.data.user, res.data.access, res.data.refresh);
          navigate("/dashboard");

        } catch (err) {
          setError(err.response?.data?.message || "Wrong credentials.");
          setSuccess(false);
        }
    };

  return (
    <div className="login-container">
      <svg className="hero-lines-bg" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <line x1="0" y1="100%" x2="30%" y2="0" stroke="#1868db" strokeWidth="0.7" opacity="0.12"/>
        <line x1="10%" y1="100%" x2="40%" y2="0" stroke="#1868db" strokeWidth="0.7" opacity="0.1"/>
        <line x1="20%" y1="100%" x2="50%" y2="0" stroke="#1868db" strokeWidth="0.7" opacity="0.1"/>
        <line x1="30%" y1="100%" x2="62%" y2="0" stroke="#1868db" strokeWidth="0.7" opacity="0.09"/>
        <line x1="41%" y1="100%" x2="72%" y2="0" stroke="#1868db" strokeWidth="0.7" opacity="0.09"/>
        <line x1="52%" y1="100%" x2="83%" y2="0" stroke="#1868db" strokeWidth="0.7" opacity="0.1"/>
        <line x1="62%" y1="100%" x2="93%" y2="0" stroke="#1868db" strokeWidth="0.7" opacity="0.1"/>
        <line x1="72%" y1="100%" x2="100%" y2="3%" stroke="#1868db" strokeWidth="0.7" opacity="0.09"/>
        <line x1="82%" y1="100%" x2="100%" y2="35%" stroke="#1868db" strokeWidth="0.7" opacity="0.09"/>
        <line x1="93%" y1="100%" x2="100%" y2="76%" stroke="#1868db" strokeWidth="0.7" opacity="0.08"/>
        <line x1="100%" y1="100%" x2="69%" y2="0" stroke="#1868db" strokeWidth="0.7" opacity="0.07"/>
        <line x1="90%" y1="100%" x2="59%" y2="0" stroke="#1868db" strokeWidth="0.7" opacity="0.07"/>
        <line x1="79%" y1="100%" x2="48%" y2="0" stroke="#1868db" strokeWidth="0.7" opacity="0.06"/>
        <circle cx="31%" cy="0" r="2.5" fill="#1868db" opacity="0.25"/>
        <circle cx="51%" cy="0" r="2" fill="#1868db" opacity="0.2"/>
        <circle cx="72%" cy="0" r="2.5" fill="#1868db" opacity="0.22"/>
        <circle cx="93%" cy="0" r="2" fill="#1868db" opacity="0.18"/>
        <circle cx="0" cy="100%" r="2.5" fill="#1868db" opacity="0.2"/>
        <circle cx="20%" cy="100%" r="2" fill="#1868db" opacity="0.18"/>
        <circle cx="51%" cy="100%" r="2.5" fill="#1868db" opacity="0.2"/>
      </svg>
      <form className="login-form" onSubmit={handeLogin}>
        <h2>Login</h2>

        <label>Username</label>
        <input type="username" placeholder="johndoe123" required value={username} onChange={(e) => setUsername(e.target.value)}/>

        <label>Password</label>
        <input type="password" placeholder="********" required value={password} onChange={(e) => setPassword(e.target.value)}/>

        <button type="submit">Submit</button>

        <p className="register-link">
          Not registered? <span onClick={() => navigate("/register")}>Register</span>
        </p>

        <p className="forgot-link">
          Forgot your password? <span onClick={() => navigate("/forgot-password")}>Reset it here</span>
        </p>

        {success && <p className="success-msg">Welcome back, you’re logged in!</p>}
        {error && <p className="error-msg">{error}</p>}

      </form>

    </div>
  )
}

export default Login;
