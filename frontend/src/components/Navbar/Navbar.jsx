import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

import logo from "../../assets/logo2.png"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        <div className="navbar-logo">
          <a href="/">
            <img src={logo} alt="Flowly Logo" className="logo-img" />
            <span className="logo-text">Flowly</span>
          </a>
        </div>

        <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
          <span className={`hamburger ${isOpen ? 'open' : ''}`}></span>
        </button>

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <ul className="nav-links">
            <li><Link to="/" className="nav-item" onClick={() => setIsOpen(false)}>Home</Link></li>
            <li><a href="/about" className="nav-item">About Us</a></li>
            <li><a href="/contact" className="nav-item">Contact</a></li>
          </ul>

          <div className="nav-actions">
            <Link to="/login" className="btn-login" onClick={() => setIsOpen(false)}>Login</Link>
            <Link to="/register" className="btn-signup" onClick={() => setIsOpen(false)}>Sign Up</Link>          
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;