import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../api/services/authServices";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await forgotPassword(email);

      setSuccess(true);
      setError("");
    } catch (err) {
      setError("Something went wrong. Try again.");
      setSuccess(false);
    }
  };

  return (
    <div className="forgot-container">
      <svg className="hero-lines-bg" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <line x1="0" y1="100%" x2="30%" y2="0" stroke="#1868db" strokeWidth="0.7" opacity="0.12"/>
        <line x1="10%" y1="100%" x2="40%" y2="0" stroke="#1868db" strokeWidth="0.7" opacity="0.1"/>
        <circle cx="31%" cy="0" r="2.5" fill="#1868db" opacity="0.25"/>
        <circle cx="51%" cy="0" r="2" fill="#1868db" opacity="0.2"/>
        <circle cx="72%" cy="0" r="2.5" fill="#1868db" opacity="0.22"/>
      </svg>

      <form className="forgot-form" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>

        <label>Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit">Send Reset Link</button>

        <p className="login-link">
          Back to <span onClick={() => navigate("/login")}>Login</span>
        </p>

        {success && (
          <p className="success-msg">
            If this email exists, a reset link has been sent.
          </p>
        )}

        {error && <p className="error-msg">{error}</p>}
      </form>
    </div>
  );
}