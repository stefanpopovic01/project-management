import React, { useState, useEffect, useContext } from "react";
import "./DashboardProfile.css";
import { useParams } from "react-router-dom";
import { getUser, getFollowers, getFollowing, follow, unfollow } from "../../api/services/userServices";
import { getUserProjects, getAssignedProjects } from "../../api/services/projectServices";
import { getAllUserTasks } from "../../api/services/taskServices";
import { formatTimeAgo } from "..//../utils/formatDate";
import EditProfileDrawer from "../../components/EditProfile/EditProfileDrawer"
import { AuthContext } from "../../contex/AuthContext";

const Icon = {
  pencil: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M14.5 2.5l3 3L6 17H3v-3L14.5 2.5z" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <line x1="10" y1="4" x2="10" y2="16" />
      <line x1="4" y1="10" x2="16" y2="10" />
    </svg>
  ),
  share: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="15" cy="4" r="1.75" />
      <circle cx="5" cy="10" r="1.75" />
      <circle cx="15" cy="16" r="1.75" />
      <line x1="6.7" y1="9.1" x2="13.3" y2="5" />
      <line x1="6.7" y1="10.9" x2="13.3" y2="15" />
    </svg>
  ),
  location: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M10 2a6 6 0 016 6c0 4-6 10-6 10S4 12 4 8a6 6 0 016-6z" />
      <circle cx="10" cy="8" r="2" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2" y="4" width="16" height="12" rx="2" />
      <path d="M2 7l8 5 8-5" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="10" cy="10" r="8" />
      <path d="M10 6v4l3 2" />
    </svg>
  ),
};

function ProjectCard({ project, showRole = false }) {

  const timeAgo = project?.updatedAt ? formatTimeAgo(project.updatedAt) : "";

  return (
    <div className="dp-project-card">
      <div className="dp-project-top">
        <div>
          <div className="dp-project-title">{project.title}</div>
          <div className="dp-project-desc">{project.description}</div>
        </div>
        {showRole && <span className="dp-role-badge">{project.role}</span>}
      </div>
      <div className="dp-project-bottom">
        <div className="dp-project-tags">
          {/* {project.tags.map((t) => (
            <span key={t} className="dp-tag">{t}</span>
          ))} */}
        </div>
        <div className="dp-project-meta">
          <span className="dp-project-status">
            <span className={`dp-status-dot ${project.status}`} />
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
          <span className="dp-project-date">Updated {timeAgo}</span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardProfile() {

  const { user: currentUser, updateUser } = useContext(AuthContext);

  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [followers, setFollowers] = useState({ count: 0, followers: [] });
  const [following, setFollowing] = useState({ count: 0, followers: [] });

  const [projects, setProjects] = useState({ count: 0, projects: [] });
  const [assigned, setAssigned] = useState({ count: 0, projects: [] });

  const [userTasks, setUserTasks] = useState({
    tasks: [],
    stats: {
      total: 0,
      completed: 0,
      overdue: 0,
      pending: 0
    }
  });

  const [loading, setLoading] = useState(true);
  const [follow1, setFollow] = useState("");
  const [unfollow1, setUnfollow] = useState("");
  
  useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [userRes, followersRes, followingRes, projectsRes, assignedRes, taskRes] = await Promise.all([
        getUser(id),
        getFollowers(id),
        getFollowing(id),
        getUserProjects(id),
        getAssignedProjects(id),
        getAllUserTasks(id)
      ]);

      setUser(userRes.data);
      setFollowers(followersRes.data);
      setFollowing(followingRes.data);
      setProjects(projectsRes.data);
      setAssigned(assignedRes.data);
      setUserTasks(taskRes.data)

    } catch (err) {
      console.error("Error loading profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (id) {
    fetchDashboardData();
  }
}, [id]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  if (loading) {
    return (
      <div className="dashboard-spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  const initials = (user.firstName?.[0] || "") + (user.lastName?.[0] || "");
  const displayInitials = initials.toUpperCase();

  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });

  const isOwnProfile = currentUser?.id === user?._id;

  const handleShare = async () => {
    const shareData = {
      title: "User Profile",
      text: `Check out ${user.name}'s profile on our platform!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.log("Share cancelled or failed", err);
    }
  };

  const isFollowing = currentUser?.following?.some(
    (id) => id.toString() === user?._id?.toString()
  );

  const handleFollow = async () => {
    try {
      const res = await follow(id);

      updateUser({
            following: [...currentUser.following, id]
          });

      setFollow(`${user.firstName} ${user.lastName} followed succesfully.`);
      
    } catch (err) {
      console.error("Follow failed:", err.response?.data?.message || err.message);
    }
  };

  const handleUnfollow = async () => {
    try {
      const res = await unfollow(id);

      updateUser({
            following: currentUser.following.filter(favId => favId !== id)
          });
      setUnfollow(`${user.firstName} ${user.lastName} unfollowed succesfully.`);
      
    } catch (err) {
      console.error("Follow failed:", err.response?.data?.message || err.message);
    }
  };

  const handleUpdateUser = (updatedData) => {
  setUser(updatedData);
  };

  return (
    <>
      <div className="dp-page">

        <div className="dp-banner-wrap">
          <div className="dp-banner">
            <div className="dp-banner-dots" />
            {/* {isOwnProfile && (
              <button className="dp-banner-edit-btn">
                {Icon.pencil}
                Edit banner
              </button>
            )} */}
          </div>
        </div>

        <div className="dp-container">
          <div className="dp-profile-card">

            <div className="dp-profile-header">
              <div className="dp-avatar-wrap">
                <div className="dp-avatar">
                  {user.avatarUrl
                    ? <img src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                    : displayInitials }
                </div>
                <div className="dp-avatar-badge" />
              </div>

              <div className="dp-profile-actions">
                <button className="dp-btn ghost" onClick={() => handleShare()}>{Icon.share} Share</button>
              {isOwnProfile && (
                <button
                  className="dp-btn outline"
                  onClick={() => setDrawerOpen(true)}
                >
                  {Icon.pencil} Edit Profile
                </button>
              )}
                {!isOwnProfile && (
                  <button onClick={isFollowing ? handleUnfollow : handleFollow } className="dp-btn primary"> {Icon.plus} {isFollowing ? "Unfollow" : "Follow"} </button>
                )}
              </div>
            </div>

            <div className="dp-profile-info">
              <h1 className="dp-name">
                {user.firstName} {user.lastName}
              </h1>

              <div className="dp-position-row">
                <span className="dp-position">{user.position}</span>
                <span className="dp-divider-dot" />
                <span className="dp-company">{user.company}</span>
              </div>

              <div className="dp-meta-row">
                <span className="dp-meta-item">{Icon.location}{user.location}</span>
                <span className="dp-meta-item">{Icon.mail}{user.email}</span>
                <span className="dp-meta-item">{Icon.clock}{`Joined ${joinedDate}`}</span>
              </div>

              <p className="dp-description">{user.bio}</p>

              <div className="dp-skills-row">
                {user.skills.map((s) => (
                  <span key={s} className="dp-skill-tag">{s}</span>
                ))}
              </div>
            </div>

            <div className="dp-stats-strip">
              <div className="dp-stat">
                <div className="dp-stat-value">{projects.count}</div>
                <div className="dp-stat-label">Projects</div>
              </div>
              <div className="dp-stat">
                <div className="dp-stat-value">{userTasks.stats.completed}</div>
                <div className="dp-stat-label">Contributions</div>
              </div>
              <div className="dp-stat">
                <div className="dp-stat-value">{followers.count}</div>
                <div className="dp-stat-label">Followers</div>
              </div>
              <div className="dp-stat">
                <div className="dp-stat-value">{following.count}</div>
                <div className="dp-stat-label">Following</div>
              </div>
            </div>
          </div>

          <div className="dp-content">
            <div className="dp-section">
              <div className="dp-section-header">
                <span className="dp-section-title">
                  <span className="dp-section-title-dot" />
                  Created Projects
                </span>
                <span className="dp-section-count">{projects.count}</span>
              </div>
              <div className="dp-projects-list">
                {projects.count > 0
                  ? projects.projects.map((p) => <ProjectCard key={p._id} project={p} />)
                  : <div className="dp-empty">No projects created yet.</div>}
              </div>
            </div>

            <div className="dp-section">
              <div className="dp-section-header">
                <span className="dp-section-title">
                  <span className="dp-section-title-dot" />
                  Collaborated On
                </span>
                <span className="dp-section-count">{assigned.count}</span>
              </div>
              <div className="dp-projects-list">
                {assigned.count > 0
                  ? assigned.projects.map((p) => (
                      <ProjectCard key={p._id} project={p} />
                    ))
                  : <div className="dp-empty">No collaborations yet.</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditProfileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        profile={user}
        onSave={handleUpdateUser}
      />
    </>
  );
}
