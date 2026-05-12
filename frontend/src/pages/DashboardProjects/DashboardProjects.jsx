import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardProjects.css";

import CreateProjectModal from "../../components/CreateProjectModal/CreateProjectModal";
import { getUserProjects, getAssignedProjects } from "../../api/services/projectServices";
import { AuthContext } from "../../contex/AuthContext";
import { useContext } from "react";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

const Icon = {
  plus: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
      <line x1="10" y1="4" x2="10" y2="16" /><line x1="4" y1="10" x2="16" y2="10" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2" y="4" width="16" height="14" rx="2" />
      <line x1="2" y1="8" x2="18" y2="8" />
      <line x1="6" y1="2" x2="6" y2="6" /><line x1="14" y1="2" x2="14" y2="6" />
    </svg>
  ),
  chevLeft: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="13 5 7 10 13 15" />
    </svg>
  ),
  chevRight: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="7 5 13 10 7 15" />
    </svg>
  ),
  export: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M10 13V4M6 8l4-4 4 4" /><path d="M3 14v2a1 1 0 001 1h12a1 1 0 001-1v-2" />
    </svg>
  ),
};

function formatDeadline(iso) {
  const d    = new Date(iso);
  const now  = new Date();
  const diff = Math.ceil((d - now) / 86400000);
  const label = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return { label, overdue: diff < 0 };
}

function pct(done, total) {
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

function AvatarStack({ members, max = 4 }) {
  const visible = members.slice(0, max);
  const extra   = members.length - max;
  return (
    <div className="dproj-avatars">
      {visible.map((m, i) => (
        <div key={i} className="dproj-avatar" title={`${m.user.firstName} ${m.user.lastName}`}>
          {m.user.avatarUrl ? (
            <img src={m.user.avatarUrl} alt={m.user.firstName} />
          ) : (
            <p>
              {((m.user.firstName?.[0] || "") + (m.user.lastName?.[0] || "")).toUpperCase()}
            </p>
          )}
        </div>
      ))}
      {extra > 0 && <div className="dproj-avatar extra">+{extra}</div>}
    </div>
  );
}

function ProjectCard({ project, onClick, ownership }) {
  const progress = pct(project.completedTasks, project.totalTasks);

  const { label: deadlineLabel, overdue } = formatDeadline(project.deadline);
  const isDone = progress === 100;

  return (
    <div className={`dproj-card ${ownership}`} onClick={() => onClick(project)} >
      <div className="dproj-card-top">
        <span className="dproj-card-title">{project.title}</span>
        <span className={`dproj-ownership-pill ${ownership}`}>
          {ownership === "owned" ? "Owner" : "Assigned"}
        </span>
      </div>

      <p className="dproj-card-desc">{project.description}</p>

      <div className="dproj-progress-wrap">
        <div className="dproj-progress-top">
          <span>Progress</span>
          <span>{project.completedTasks} / {project.totalTasks} tasks</span>
        </div>
        <div className="dproj-progress-track">
          <div className={`dproj-progress-fill${isDone ? " done" : ""}`} style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="dproj-card-meta">
        <div className="dproj-card-meta-left">
          <span className={`dproj-status ${project.status}`}>
            <span className="dproj-status-dot" />
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
          <span className={`dproj-deadline${overdue ? " overdue" : ""}`}>
            {Icon.calendar} {overdue ? "Overdue · " : ""}{deadlineLabel}
          </span>
        </div>
        <AvatarStack members={project.members.filter(m => m.status === "accepted")} />
      </div>

      <div className="dproj-owner-row">
        <div className="dproj-owner-avatar">
          {project.creator.avatarUrl ? (
            <img 
              src={project.creator.avatarUrl} 
              alt={`${project.creator.firstName} ${project.creator.lastName}`} 
            />
          ) : (
            <p>
              {(project.creator.firstName?.[0] || "") + (project.creator.lastName?.[0] || "").toUpperCase()}
            </p>
          )}
        </div>
        <span>by <span className="dproj-owner-name">{project.creator.firstName}{" "}{project.creator.lastName}</span></span>
      </div>
    </div>
  );
}

export default function DashboardProjects() {
  const navigate = useNavigate();

  const handleProjectClick = (project) => {
    navigate(`/dashboard-projects/${project}`);
    
  };

  const { user: currentUser, updateUser } = useContext(AuthContext);
  const id = currentUser.id;

  const [projects, setProjects] = useState({ count: 0, projects: [], totalCount: 0 });
  const [assigned, setAssigned] = useState({ count: 0, projects: [], totalCount: 0 });
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [limit, setLimit] = useState(3);
  const [aLimit, setALimit] = useState(3);

  const [createProject, setCreateProject] = useState(false);

  const closeCreateProject = () => {
    setCreateProject(!createProject);
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
  
        const [projectsRes, assignedRes] = await Promise.all([
          getUserProjects(id, debouncedSearchTerm, limit),
          getAssignedProjects(id, debouncedSearchTerm, aLimit)
        ]);
  
        setProjects(projectsRes.data);
        setAssigned(assignedRes.data);
  
      } catch (err) {
        console.error("Error loading project data:", err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (id) {
      fetchDashboardData();
    }
  }, [id, debouncedSearchTerm, limit, aLimit]);

  if (loading && projects.projects.length === 0) {
    return (
      <div className="dashboard-spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }
  
  return (
    <div className="dproj-page">
      <div className="dproj-inner">

        <div className="dproj-page-header">
          <div>
            <h1 className="dproj-page-title">Projects</h1>
            <p className="dproj-page-sub">
              {projects.totalCount} owned · {assigned.totalCount} assigned
            </p>
          </div>
          <div className="dproj-header-actions">
            <button className="dproj-btn primary" onClick={() => setCreateProject(!createProject)} >{Icon.plus} New Project</button>
          </div>
        </div>

        <div className="dproj-toolbar">
          <div className="dproj-search-wrap">
            <svg className="dproj-search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
              <circle cx="8.5" cy="8.5" r="5.5" /><line x1="13" y1="13" x2="17" y2="17" />
            </svg>
            <input
              className="dproj-search"
              type="text"
              placeholder="Search projects…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="dproj-section-head">
          <span className="dproj-section-title">My Projects</span>
          <span className="dproj-section-badge">{projects.totalCount}</span>
          <span className="dproj-section-divider" />
        </div>

        <div className="dproj-grid">
          {projects.count > 0
            ? projects.projects.map((p) => (
                <ProjectCard key={p._id} project={p} onClick={() => handleProjectClick(p._id)} ownership={"owned"}/>
              ))
            : <div className="dproj-empty"><span className="dproj-empty-icon">📁</span>No projects match your search.</div>
          }
        </div>

        <div className="dashboard-projects-actions">
          {projects.totalCount > limit && (
            <button 
              className="dashboard-projects-show-more" 
              onClick={() => setLimit(prev => prev + 3)}
            >
              Show More
            </button>
          )}

          {limit > 3 && (
            <button 
              className="dashboard-projects-show-more less" 
              onClick={() => setLimit(prev => prev - 3)} 
            >
              Show Less
            </button>
          )}
        </div>

        <div className="dproj-section-head" style={{ marginTop: "2.5rem" }}>
          <span className="dproj-section-title">Assigned to Me</span>
          <span className="dproj-section-badge" style={{ background: "rgba(167,139,250,0.12)", color: "#7c3aed" }}>
            {assigned.totalCount}
          </span>
          <span className="dproj-section-divider" />
        </div>

        <div className="dproj-grid">
          {assigned.count > 0
            ? assigned.projects.map((p) => (
                <ProjectCard key={p._id} project={p} onClick={() => handleProjectClick(p._id)} ownership={"assigned"} />
              ))
            : <div className="dproj-empty"><span className="dproj-empty-icon">🤝</span>No assigned projects match your search.</div>
          }
        </div>

        <div className="dashboard-projects-actions">
          {assigned.totalCount > aLimit && (
            <button 
              className="dashboard-projects-show-more" 
              onClick={() => setALimit(prev => prev + 3)}
            >
              Show More
            </button>
          )}

          {aLimit > 3 && (
            <button 
              className="dashboard-projects-show-more less" 
              onClick={() => setALimit(prev => prev - 3)} 
            >
              Show Less
            </button>
          )}
        </div>

        {createProject && ( <CreateProjectModal onProjectCreated={fetchDashboardData} onClose={closeCreateProject} />)}

      </div>
    </div>
  );
}
