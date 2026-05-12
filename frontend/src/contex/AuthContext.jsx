import { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("accessToken") || null;
  });

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
    <AuthContext.Provider value={{ user, token, loginContext, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
