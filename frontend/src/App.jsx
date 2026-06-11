import './App.css'

import NotFound from './routes/NotFound'
import Login from './pages/Login/Login'
import Contact from './pages/Contact/Contact'
import Register from './pages/Register/Register'
import Navbar from './components/Navbar/Navbar'
import AboutUs from './pages/About/About'
import Footer from './components/Footer/Footer'
import LandingPage from './pages/Landing/LandingPage'
import Dashboard from './pages/Dashboard/Dashboard'
import DashboardHeader from './components/DashboardHeader/DashboardHeader'
import VerticalNavbar from './components/VerticalNavbar/VerticalNavbar'
import DashboardProfile from './pages/DashboardProfile/DashboardProfile'
import DashboardProjects from './pages/DashboardProjects/DashboardProjects'
import DashboardSingleProject from './components/DashboardSingleProject/DashboardSingleProject'
import ResetPassword from './pages/ResetPassword/ResetPassword'
import ForgotPassword from './pages/ForgotPassword/ForgotPassword'

import { Routes, Route, useLocation } from "react-router-dom";
import { ProtectedRoute } from './routes/ProtectedRoute'
import { useContext, useEffect } from 'react'
import { AuthContext } from './contex/AuthContext'
import { setSessionExpiredHandler } from './api/axios'

function App() {

  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith("/dashboard");
  const isNotFound = !["/", "/login", "/register", "/contact", "/about"].some(
    (path) => location.pathname === path || location.pathname.startsWith("/dashboard")
  );
  const { setIsSessionExpired } = useContext(AuthContext);

  useEffect(() => {
      setSessionExpiredHandler(setIsSessionExpired);
    }, [setIsSessionExpired]);

  return (
    <>
      {!isDashboardRoute && !isNotFound && <Navbar />}
      {isDashboardRoute && (
        <>
          <DashboardHeader />
          <VerticalNavbar />
        </>
      )}

      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<NotFound />} />

          <Route path="/dashboard" element={ <ProtectedRoute><Dashboard /></ProtectedRoute> } />
          <Route path="/dashboard-profile/:id" element={ <ProtectedRoute><DashboardProfile /></ProtectedRoute> } />
          <Route path="/dashboard-projects" element={ <ProtectedRoute><DashboardProjects /></ProtectedRoute> } />
          <Route path="/dashboard-projects/:id" element={ <ProtectedRoute><DashboardSingleProject /></ProtectedRoute> } />
        </Routes>
      </main>

      {!isDashboardRoute && !isNotFound && <Footer />}

    </>
  
  )
}

export default App
