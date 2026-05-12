import './Register.css'
import { React, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api/services/authServices';

import backgroundimg1 from '../../assets/login1.png';
import backgroundimg2 from '../../assets/login2.png'

function Register() {

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password1, setPassword1] = useState("");

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

   if (password !== password1) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const res = await register({ email, password, firstName, lastName });

      setSuccess(true);
      setError("");

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong..");
      setSuccess(false);
    }
  };

  if (success) {
    setTimeout(() => {
      navigate("/login");
    }, 1500); 
  }

  return (
    <div className="register-container" onSubmit={handleRegister}>
    <div className="hero-grid-bg" />
      <form className="register-form">
        <h2>Register</h2>

        <label>First name</label>
        <input type="text" placeholder="Enter name" required value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
    
        <label>Last name</label>
        <input type="text" placeholder="Enter last name" required value={lastName} onChange={(e) => setLastName(e.target.value)}/>

        <label>Email</label>
        <input type="email" placeholder="Enter email" required value={email} onChange={(e) => setEmail(e.target.value)}/>

        <label>Password</label>
        <input type="password" placeholder="********" required value={password} onChange={(e) => setPassword(e.target.value)}/>
      
        <label>Repeat password</label>
        <input type="password" placeholder="********" required value={password1} onChange={(e) => setPassword1(e.target.value)}/>

        <button type="submit" disabled={!password || password !== password1}>Submit</button>

        <p className="login-link">
          Already have an account? <span onClick={() => navigate("/login")}>Login</span>
        </p>

        {success && <p className="success-msg">You've successfully registered.</p>}
        {error && <p className="error-msg">{error}</p>}

      </form>

        <img src={backgroundimg1} className='backgroundImg1' alt='background photo'/>
        <img src={backgroundimg2} className='backgroundImg2' alt='background photo'/>

    </div>
  )
}

export default Register;
