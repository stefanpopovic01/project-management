import React, { useMemo, useContext, useState, useEffect } from "react";
import "./ForYou.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contex/AuthContext";
import { getAllUserTasks } from "../../api/services/taskServices";
import { getUserProjects, getAssignedProjects } from "../../api/services/projectServices";
import { getNotifications } from "../../api/services/notificationServices";
import { formatTimeAgo } from "../../utils/formatDate";

const Icon = {
  chevRight: (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="7 5 13 10 7 15" /></svg>),
  folder:    (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>),
  userPlus:  (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="8" cy="7" r="4" /><path d="M2 17c0-3.3 2.7-6 6-6" /><line x1="15" y1="11" x2="15" y2="17" /><line x1="12" y1="14" x2="18" y2="14" /></svg>),
  task:      (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="14" height="14" rx="2" /><polyline points="7 10 9 12 13 8" /></svg>),
  clock:     (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="10" cy="10" r="8" /><polyline points="10 6 10 10 13 12" /></svg>),
  bell:      (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M10 2a6 6 0 00-6 6c0 4-2 5-2 5h16s-2-1-2-5a6 6 0 00-6-6z" /><path d="M11.73 17a2 2 0 01-3.46 0" /></svg>),
  lightning: (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><polyline points="13 2 7 11 10 11 7 18 13 9 10 9 13 2" /></svg>),
};

function getGreeting(name) {
  const hour = new Date().getHours();
  if (hour < 12) return { time: "morning",   emoji: "☀️",  message: `Ready to get things done today?` };
  if (hour < 17) return { time: "afternoon", emoji: "👋",  message: `You have tasks waiting for you.` };
  return              { time: "evening",   emoji: "🌙",  message: `Wrapping up for the day?` };
}

function formatDateDisplay() {
  const now = new Date();
  return {
    day:  now.toLocaleDateString("en-GB", { day: "numeric" }),
    rest: now.toLocaleDateString("en-GB", { weekday: "long", month: "long", year: "numeric" }),
  };
}

function getDueChip(isoDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due   = new Date(isoDate);
  due.setHours(0, 0, 0, 0);
  const diff  = Math.round((due - today) / 86400000);

  if (diff < 0)  return { label: "Overdue",        cls: "overdue" };
  if (diff === 0) return { label: "Due today",      cls: "today" };
  if (diff <= 3)  return { label: `${diff}d left`,  cls: "soon" };
  return               { label: due.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), cls: "upcoming" };
}

function pct(done, total) {
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

function ProjectRow({ project, onClick, userId }) {
  const progress = pct(project.completedTasks, project.totalTasks);
  const isDone   = progress === 100;

  const isOwnProfile = userId == project.creator._id;

  return (
    <div className="fy-proj-row" onClick={() => onClick(project)}>
      <div className={`fy-proj-accent ${isOwnProfile ? "owned" : "assigned"}`} />

      <div className="fy-proj-info">
        <div className="fy-proj-name">{project.title}</div>
        <div className="fy-proj-meta">
          <span className={`fy-proj-status ${project.status}`}>
            <span className="fy-proj-status-dot" />
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
          <span className="fy-proj-tasks-count">
            {project.completedTasks}/{project.totalTasks} tasks
          </span>
        </div>
      </div>

      <div className="fy-proj-right">
        <span className="fy-proj-pct">{progress}%</span>
        <div className="fy-proj-bar-track">
          <div
            className={`fy-proj-bar-fill${isDone ? " done" : ""}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <svg style={{ width: "1rem", height: "1rem", color: "#d1d5db", flexShrink: 0 }} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="7 5 13 10 7 15" />
      </svg>
    </div>
  );
}

function TaskRow({ task, onClick }) {
  const chip = getDueChip(task.dueDate);

  return (
    <div className="fy-task-row" onClick={() => onClick(task)}>
      <span className={`fy-task-priority-dot ${task.priority}`} />
      <div className="fy-task-info">
        <div className="fy-task-name">{task.title}</div>
        <div className="fy-task-project">{task.project.title}</div>
      </div>
      <span className={`fy-task-due-chip ${chip.cls}`}>{chip.label}</span>
    </div>
  );
}

export default function ForYou({ currentUser }) {

  const { user } = useContext(AuthContext);
  const id = user.id;

  const navigate  = useNavigate();

  const greeting  = getGreeting(user.firstName);
  const dateLabel = formatDateDisplay();

  const handleProjectClick = (project) => {
    navigate(`/dashboard-projects/${project._id}`, { state: { project } });
  };

  const [loading, setLoading] = useState(true)
  const [userTasks, setUserTasks] = useState({
    tasks: [],
    stats: {
      total: 0,
      completed: 0,
      overdue: 0,
      pending: 0
    }
  });

  const [projects, setProjects] = useState({ count: 0, projects: [] });
  const [assigned, setAssigned] = useState({ count: 0, projects: [] });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [taskRes, projectRes, assignedRes, notificationRes] = await Promise.all([
        getAllUserTasks(id),
        getUserProjects(id),
        getAssignedProjects(id),
        getNotifications()
      ]);

      setUserTasks(taskRes.data)
      setProjects(projectRes.data)
      setAssigned(assignedRes.data)
      setNotifications(notificationRes.data)

    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchDashboardData();
  
}, []);

  if (loading && projects.projects.length === 0) {
    return (
      <div className="dashboard-spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="fy-page">
      <div className="fy-inner">

        <div className="fy-hero">
          <div className="fy-hero-inner">
            <div>
              <div className="fy-greeting-label">
                Good {greeting.time} {greeting.emoji}
              </div>
              <h1 className="fy-greeting-name">{user.firstName}</h1>
              <p className="fy-greeting-sub">
                {userTasks.stats.overdue > 0
                  ? <><strong>{userTasks.stats.overdue} task{userTasks.stats.overdue !== 1 ? "s" : ""} overdue</strong> - let's get caught up.</>
                  : greeting.message
                }
              </p>
            </div>

            <div className="fy-hero-date">
              <div className="fy-hero-date-day">{dateLabel.day}</div>
              <div className="fy-hero-date-rest">{dateLabel.rest}</div>
            </div>
          </div>

          <div className="fy-stats">
            <div className="fy-stat">
              <span className="fy-stat-value">{projects.count}</span>
              <span className="fy-stat-label">My Projects</span>
              <span className="fy-stat-sub">
                total
              </span>
            </div>
            <div className="fy-stat">
              <span className="fy-stat-value">{userTasks.stats.total}</span>
              <span className="fy-stat-label">Assigned to Me</span>
              <span className="fy-stat-sub">
                total
              </span>
            </div>
            <div className="fy-stat">
              <span className="fy-stat-value">{userTasks.stats.pending}</span>
              <span className="fy-stat-label">Open Tasks</span>
              <span className="fy-stat-sub">
                {userTasks.stats.overdue > 0 ? `${userTasks.stats.overdue} overdue` : "All on track"}
              </span>
            </div>
            <div className="fy-stat">
              <span className="fy-stat-value">
                {userTasks.stats.completed}
              </span>
              <span className="fy-stat-label">Tasks Completed</span>
              <span className="fy-stat-sub">across all projects</span>
            </div>
          </div>
        </div>

        <div className="fy-body">

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            <div className="fy-card">
              <div className="fy-card-head">
                <span className="fy-card-title">
                  {Icon.folder} Recent Projects
                </span>
                <button className="fy-card-link" onClick={() => navigate("/dashboard-projects")}>
                  See all {Icon.chevRight}
                </button>
              </div>

              <div className="fy-proj-list">
                <div className="fy-proj-section-label">My Projects</div>
                {projects.count > 0
                  ? projects.projects.slice(0, 4).map(p => <ProjectRow key={p._id} project={p} userId={id} onClick={() => handleProjectClick(p)} />)
                  : <div className="fy-empty"><span className="fy-empty-icon">📁</span>No projects yet.</div>
                }
                <div className="fy-proj-section-label" style={{ marginTop: "0.5rem" }}>Assigned to Me</div>
                {assigned.count > 0
                  ? assigned.projects.slice(0, 4).map(p => <ProjectRow key={p._id} project={p} onClick={() => handleProjectClick(p)} />)
                  : <div className="fy-empty"><span className="fy-empty-icon">🤝</span>None assigned yet.</div>
                }
              </div>
            </div>

            <div className="fy-card">
              <div className="fy-card-head">
                <span className="fy-card-title">
                  {Icon.clock} Recent Tasks
                  <span className="fy-card-badge">{userTasks.stats.total}</span>
                </span>
                <button className="fy-card-link" onClick={() => navigate("/dashboard-projects")}>
                  View projects {Icon.chevRight}
                </button>
              </div>

              <div className="fy-tasks-list">
                {userTasks.stats.total > 0
                  ? userTasks.tasks.slice(0, 4).map(t => <TaskRow key={t._id} task={t} />)
                  : (
                    <div className="fy-empty">
                      <span className="fy-empty-icon">✅</span>
                      All caught up - no active tasks.
                    </div>
                  )
                }
              </div>
            </div>

          </div>

          <div className="fy-sidebar">

            <div className="fy-card">
              <div className="fy-card-head">
                <span className="fy-card-title">
                  {Icon.lightning} Recent Activity
                </span>
              </div>

              <div className="fy-activity-list">
                {notifications.slice(0, 4).map((item) => {
                  const timeAgo = item?.updatedAt ? formatTimeAgo(item.updatedAt) : "";

                  return (
                    <div key={item._id} className="fy-activity-item">
                      <div className={`fy-activity-av`}>
                        {item.actor.avatarUrl ? (
                          <img src={item.actor.avatarUrl} alt={item.actor.firstName} />
                        ) : (
                          <span>
                            {((item.actor.firstName?.[0] || "") + (item.actor.lastName?.[0] || "")).toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      <div className="fy-activity-content">
                        <p className="fy-activity-text">{item.message}</p>
                        <span className="fy-activity-time">{timeAgo}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="fy-card">
              <div className="fy-card-head">
                <span className="fy-card-title">Quick Links</span>
              </div>

              <div className="fy-quicklinks">
                <button className="fy-quicklink-btn" onClick={() => navigate("/dashboard-projects")}>
                  <div className="fy-quicklink-icon blue">{Icon.folder}</div>
                  <div>
                    <div className="fy-quicklink-label">All Projects</div>
                    <div className="fy-quicklink-sub">Browse owned & assigned</div>
                  </div>
                  <span className="fy-quicklink-arrow">{Icon.chevRight}</span>
                </button>

                <button className="fy-quicklink-btn" onClick={() => navigate(`/dashboard-profile/${user.id}`)}>
                  <div className="fy-quicklink-icon purple">{Icon.userPlus}</div>
                  <div>
                    <div className="fy-quicklink-label">My Profile</div>
                    <div className="fy-quicklink-sub">Edit info, skills & bio</div>
                  </div>
                  <span className="fy-quicklink-arrow">{Icon.chevRight}</span>
                </button>

                <button  className="fy-quicklink-btn"  onClick={() => projects?.projects?.[0] && handleProjectClick(projects.projects[0])} >
                  <div className="fy-quicklink-icon green">{Icon.task}</div>
                  <div>
                    {projects.count > 0 && projects.projects.length > 0 ? (
                      <>
                        <div className="fy-quicklink-label">{projects.projects[0].title}</div>
                        <div className="fy-quicklink-sub">Your most recent project</div>
                      </>
                    ) : (
                      <div className="fy-quicklink-sub">No projects found</div>
                    )}
                  </div>
                  <span className="fy-quicklink-arrow">{Icon.chevRight}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
