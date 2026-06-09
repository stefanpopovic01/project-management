import { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("accessToken") || null;
  });

  const [isSessionExpired, setIsSessionExpired] = useState(false);

  const loginContext = (userData, tokenData, refreshData) => {
    setUser(userData);
    setToken(tokenData);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", tokenData);
    localStorage.setItem("refreshToken", refreshData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    
    setIsSessionExpired(false); 

    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const updateUser = (newData) => {
    setUser((prevUser) => {
      const updatedUser = { ...prevUser, ...newData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loginContext, logout, updateUser, setIsSessionExpired }}>
      {children}

      {isSessionExpired && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.content}>
            <h3 style={{ margin: "0 0 10px 0", color: "#d9534f" }}>Session Expired</h3>
            <p style={{ margin: "0 0 20px 0", color: "#555" }}>
              Your session has completely timed out. Please log in again.
            </p>
            <button style={modalStyles.button} onClick={() => { logout(); window.location.href = "/login"; }}>
              Log In Again
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

const modalStyles = {
  overlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 },
  content: { backgroundColor: "#fff", padding: "25px", borderRadius: "8px", textAlign: "center", maxWidth: "350px", width: "100%", boxShadow: "0px 4px 15px rgba(0,0,0,0.2)" },
  button: { padding: "10px 20px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }
};