import "./VerticalNavbar.css";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../../contex/AuthContext";

import SidebarNotifications from "../SidebarNotifications/SidebarNotifications";
import CreateProjectModal from "../CreateProjectModal/CreateProjectModal";
import { getUserProjects } from "../../api/services/projectServices";

const VerticalNavbar = () => {

const [notificationMenu, setNotificationMenu] = useState(false);
const [createProject, setCreateProject] = useState(false);
const [projects, setProjects] = useState({ count: 0, projects: [], totalCount: 0 });
const [sidebarOpen, setSidebarOpen] = useState(false); 

const onClose = () => {
  setCreateProject(!createProject);
}

const { user } = useContext(AuthContext);
const id = user.id;

const navigate = useNavigate();
const debouncedSearchTerm = "";
const limit = 3;

useEffect(() => {
  const fetchRecentProjects = async () => {
    try {
      const res = await getUserProjects(id, debouncedSearchTerm, limit);
      setProjects(res.data);
    } catch (err) {
      console.log(err.response?.data?.message || "Something went wrong..");
    }
  };

  fetchRecentProjects();
}, []);


  return (
    <>
      <button
        className="dh-sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle navigation"
      >
        <i className={`fa-solid ${sidebarOpen ? "fa-xmark" : "fa-bars"}`}></i>
      </button>

      <div
        className={`dh-sidebar-overlay ${sidebarOpen ? "dh-sidebar-overlay--visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <nav className={`dh-sidebar ${sidebarOpen ? "dh-sidebar--open" : ""}`}>
        <div className="dh-sidebar-inner">

          <div className="dh-sidebar-group">
          <a href="#" className="dh-sidebar-link" onClick={() => { navigate("/dashboard"); setSidebarOpen(false); }}>
              <div className="dh-sidebar-left">
                  <i className="fa-solid fa-circle-user"></i>
                <span>For You</span>
              </div>
              <i className="fa-solid fa-chevron-right dh-sidebar-arrow"></i>
            </a>

          <a href="#" className="dh-sidebar-link" onClick={() => { navigate("/dashboard-projects"); setSidebarOpen(false); }}>
              <div className="dh-sidebar-left">
                <i className="fa-solid fa-diagram-project"></i>
                <span>Projects</span>
              </div>
              <i className="fa-solid fa-chevron-right dh-sidebar-arrow"></i>
            </a>

            <a href="#" className="dh-sidebar-link verMob" onClick={() => { setNotificationMenu(!notificationMenu); setSidebarOpen(false); }}>
              <div className="dh-sidebar-left">
                <i className="fa-solid fa-bell"></i>
                <span>Notifications</span>
              </div>
              <i className="fa-solid fa-chevron-right dh-sidebar-arrow"></i>
            </a>

              {notificationMenu && (<SidebarNotifications onClose={setNotificationMenu}/> )}

            <a href="#" className="dh-sidebar-link" onClick={() => { navigate(`/dashboard-profile/${id}`); setSidebarOpen(false); }}>
              <div className="dh-sidebar-left">
                <i className="fa-solid fa-gear"></i>
                <span>Settings</span>
              </div>
              <i className="fa-solid fa-chevron-right dh-sidebar-arrow"></i>
            </a>
          </div>

          <div className="dh-sidebar-divider"></div>

          <div className="dh-sidebar-create" onClick={() => { setCreateProject(!createProject); setSidebarOpen(false); }}>
            <a href="#" className="dh-sidebar-create-btn">
              <i className="fa-solid fa-plus"></i>
              <span>Create Project</span>
            </a>
          </div>

           {createProject && (<CreateProjectModal onClose={onClose}/>)}

          <div className="dh-sidebar-recent">
            <p className="dh-sidebar-section-title">Recent Projects</p>

          {projects.projects?.map((project, index) => (
            <div className="dh-sidebar-project" key={index} onClick={() => { navigate(`/dashboard-projects/${project._id}`); setSidebarOpen(false) }}>
              <div className="dh-sidebar-project-icon">
                <i className="fa-solid fa-layer-group"></i>
              </div>

              <div className="dh-sidebar-project-info">
                <span className="dh-sidebar-project-name">
                  {project.title || ""}
                </span>

                <span className="dh-sidebar-project-meta">
                  {project.totalTasks || 0} tasks
                </span>
              </div>
            </div>
          ))}
            
          </div>

        </div>
      </nav>
    </>
  );
};

export default VerticalNavbar;