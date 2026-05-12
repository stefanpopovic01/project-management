import "./Footer.css";
import logo from "../../assets/logo2.png"
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-logo">
            <img src={logo} alt="Flowly" className="footer-logo-img" />
            <span className="footer-logo-text">Flowly</span>
          </div>
          <p className="footer-tagline">
            Where teams move projects from idea to done — together.
          </p>
          <div className="footer-socials">
            <a href="#" className="social-dot" aria-label="Twitter">𝕏</a>
            <a href="https://www.linkedin.com/in/stefan-popovi%C4%87-03676a2a8/" className="social-dot" aria-label="LinkedIn">in</a>
            <a href="https://github.com/stefanpopovic01" className="social-dot" aria-label="GitHub">gh</a>
          </div>
        </div>

        <div className="footer-cols">
          <div className="footer-col">
            <h4 className="footer-col-title">Product</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Sign Up</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-title">Company</h4>
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-title">Legal</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Flowly. All rights reserved.</span>
        <span className="footer-bottom-right">Built for teams that ship.</span>
      </div>
    </footer>
  );
}