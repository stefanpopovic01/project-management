import './Register.css'
import { React, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api/services/authServices';

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
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
      const res = await register({ email, password, first_name: firstName, last_name: lastName, username });
      setSuccess(true);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong..");
      setSuccess(false);
    }
  };

  if (success) {
    setTimeout(() => navigate("/login"), 1500);
  }

  return (
    <div className="register-container">
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

      <form className="register-form" onSubmit={handleRegister}>
        <div className="register-header">
          <h2>Create account</h2>
          <p>Fill in your details to get started</p>
        </div>

        <div className="field-row">
          <div className="field-group">
            <label>First name</label>
            <input type="text" placeholder="John" required value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
          </div>
          <div className="field-group">
            <label>Last name</label>
            <input type="text" placeholder="Doe" required value={lastName} onChange={(e) => setLastName(e.target.value)}/>
          </div>
        </div>

        <div className="field-group">
          <label>Email</label>
          <input type="email" placeholder="john@example.com" required value={email} onChange={(e) => setEmail(e.target.value)}/>
        </div>

        <div className="field-group">
          <label>Username</label>
          <input type="text" placeholder="johndoe123" required value={username} onChange={(e) => setUsername(e.target.value)}/>
        </div>

        <div className="field-row">
          <div className="field-group">
            <label>Password</label>
            <input type="password" placeholder="********" required value={password} onChange={(e) => setPassword(e.target.value)}/>
          </div>
          <div className="field-group">
            <label>Repeat password</label>
            <input
              type="password"
              placeholder="********"
              required
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
              className={password1 && password !== password1 ? "input-error" : password1 && password === password1 ? "input-success" : ""}
            />
          </div>
        </div>

        <button type="submit" disabled={!password || password !== password1}>Create account</button>

        <p className="login-link">
          Already have an account? <span onClick={() => navigate("/login")}>Login</span>
        </p>

        {success && <p className="success-msg">You've successfully registered! Redirecting...</p>}
        {error && <p className="error-msg">{error}</p>}
      </form>
    </div>
  )
}

export default Register;
