import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../../api/services/authServices";
import "./ResetPassword.css";

export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await resetPassword({ uid, token, password })

      setSuccess(true);
      setError("");

      setTimeout(() => {
          navigate("/login");
        }, 2000);

    } catch (err) {
      setError("Something went wrong.");
    }
  };

  return (
    <div className="reset-container">
      <svg className="hero-lines-bg" xmlns="http://www.w3.org/2000/svg">
        <circle cx="31%" cy="0" r="2.5" fill="#1868db" opacity="0.25"/>
        <circle cx="72%" cy="0" r="2.5" fill="#1868db" opacity="0.22"/>
        <circle cx="0" cy="100%" r="2.5" fill="#1868db" opacity="0.2"/>
      </svg>

      <form className="reset-form" onSubmit={handleSubmit}>
        <h2>New Password</h2>

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Reset Password</button>

        {success && (
          <p className="success-msg">Password updated! Redirecting...</p>
        )}

        {error && <p className="error-msg">{error}</p>}
      </form>
    </div>
  );
}