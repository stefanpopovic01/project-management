import React from "react";
import "./LandingPage.css";
import { Link } from 'react-router-dom';

import Kanban from "../../assets/Kanban.png"
import Profile from "../../assets/Profile.png"
import ForYou from "../../assets/ForYou.png"
import Comments from "../../assets/Comments.png"


export default function Landing() {
  return (
    <>
      <section className="hero">
        <div className="hero-grid-bg" />
        <div className="hero-inner">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Now in public beta
          </div>
          <h1 className="hero-title">
            Every task. Every team.<br />
            <em>One board.</em>
          </h1>
          <p className="hero-sub">
            Flowly turns project chaos into clear, trackable progress. Assign tasks, follow teammates, drag cards across columns and ship faster — together.
          </p>
          <div className="hero-ctas">
            <Link to="/register" className="cta-primary">Start for free →</Link>  
            <a href="#features" className="cta-ghost">See how it works</a>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <strong>12k+</strong>
              <span>Teams onboard</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <strong>3.4M</strong>
              <span>Tasks completed</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <strong>98%</strong>
              <span>Satisfaction rate</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="dashboard-mock">
            <div className="mock-topbar">
              <div className="mock-dot red" />
              <div className="mock-dot yellow" />
              <div className="mock-dot green" />
              <span className="mock-label">Project Dashboard - Q4 Launch</span>
            </div>
            <div className="mock-columns">
              <div className="mock-col">
                <div className="mock-col-head planning">Planning</div>
                <div className="mock-card">
                  <div className="mock-card-tag">Design</div>
                  <div className="mock-card-title">Finalize brand guide</div>
                  <div className="mock-card-meta">
                    <div className="mock-avatar" />
                    <div className="mock-avatar" style={{marginLeft: '-6px', background: '#facc15'}} />
                  </div>
                </div>
                <div className="mock-card">
                  <div className="mock-card-tag">Research</div>
                  <div className="mock-card-title">User interviews</div>
                  <div className="mock-card-meta">
                    <div className="mock-avatar" style={{background: '#34d399'}} />
                  </div>
                </div>
              </div>
              <div className="mock-col">
                <div className="mock-col-head inprogress">In Progress</div>
                <div className="mock-card mock-card--active">
                  <div className="mock-card-tag active-tag">Dev</div>
                  <div className="mock-card-title">Auth flow implementation</div>
                  <div className="mock-progress-bar">
                    <div className="mock-progress-fill" style={{width: '65%'}} />
                  </div>
                  <div className="mock-card-meta">
                    <div className="mock-avatar" style={{background: '#1661d8'}} />
                    <div className="mock-avatar" style={{marginLeft: '-6px'}} />
                    <span className="mock-due">Due Fri</span>
                  </div>
                </div>
                <div className="mock-card">
                  <div className="mock-card-tag">Content</div>
                  <div className="mock-card-title">Landing page copy</div>
                  <div className="mock-progress-bar">
                    <div className="mock-progress-fill" style={{width: '30%'}} />
                  </div>
                  <div className="mock-card-meta">
                    <div className="mock-avatar" style={{background: '#f97316'}} />
                  </div>
                </div>
              </div>
              <div className="mock-col">
                <div className="mock-col-head done">Done</div>
                <div className="mock-card mock-card--done">
                  <div className="mock-card-tag done-tag">Design</div>
                  <div className="mock-card-title">Wireframes v2</div>
                  <div className="mock-card-meta">
                    <div className="mock-avatar" style={{background: '#34d399'}} />
                    <span className="mock-check">✓ Completed</span>
                  </div>
                </div>
                <div className="mock-card mock-card--done">
                  <div className="mock-card-tag done-tag">Strategy</div>
                  <div className="mock-card-title">Competitor analysis</div>
                  <div className="mock-card-meta">
                    <div className="mock-avatar" />
                    <span className="mock-check">✓ Completed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-float-card top-right">
            <span className="float-icon">👥</span>
            <div>
              <strong>5 people online</strong>
              <span>Editing now</span>
            </div>
          </div>
          <div className="hero-float-card bottom-left">
            <span className="float-icon">⚡</span>
            <div>
              <strong>Task assigned</strong>
              <span>Auth flow → Alex</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="features-inner">

          <div className="section-label">What Flowly does</div>
          <h2 className="section-title">
            Built for how real teams actually work
          </h2>
          <p className="section-sub">
            No bloated feature lists. Just the essentials done exceptionally well.
          </p>

          <div className="features-grid">
            <div className="feature-card feature-card--large">
              <div className="feature-icon" style={{background: '#eef3ff', color: '#1661d8'}}>⬛</div>
              <h3>Kanban Board: Your Team's Heartbeat</h3>
              <p>Every project lives on one shared board. Three columns: <strong>Planning, In Progress, Done.</strong> Drag tasks between them in real time. Everyone sees the same picture instantly.</p>
              <div className="feature-img-placeholder">
                <img src={Kanban} alt="Kanban board screenshot" />
                <span>Project board view</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{background: '#fffbeb', color: '#ca8a04'}}>🧩</div>
              <h3>Task Management</h3>
              <p>Create tasks with descriptions, due dates, priority levels and comments. Track every detail without leaving the board.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{background: '#f0fdf4', color: '#16a34a'}}>👤</div>
              <h3>People & Profiles</h3>
              <p>Follow teammates, view their project history and experience. Know who's the right person before you assign.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{background: '#fff1f2', color: '#e11d48'}}>🎯</div>
              <h3>Task Assignment</h3>
              <p>Drag a task, pick a person. Assignees get notified instantly. Accountability built in by design.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{background: '#f5f3ff', color: '#7c3aed'}}>📊</div>
              <h3>Progress Tracking</h3>
              <p>Visual progress bars per task and per project. See how close you are to done at a glance, not after a meeting.</p>
            </div>

            <div className="feature-card feature-card--wide">
              <div className="feature-icon" style={{background: '#eff6ff', color: '#1661d8'}}>🤝</div>
              <h3>Project Collaboration</h3>
              <p>Invite teammates to projects with a link. Manage roles and keep the right people in the loop without the chaos of email threads.</p>
              <div className="collab-visual">
                <div className="collab-avatars">
                  {['#1661d8','#facc15','#34d399','#f97316','#e11d48'].map((c, i) => (
                    <div key={i} className="collab-avatar" style={{background: c, zIndex: 5 - i}} />
                  ))}
                  <span className="collab-count">+8</span>
                </div>
                <span className="collab-label">12 members collaborating</span>
              </div>
            </div>
          </div>

          <div className="screenshots-row">
            <div className="screenshot-label">
              <span>Product screenshots</span>
            </div>
            <div className="screenshots">
              <div className="screenshot-block">
                <img src={Comments} alt="Dashboard screenshot" />
                <span>Explore projects</span>
              </div>
              <div className="screenshot-block screenshot-block--mid">
                <img src={ForYou} alt="Task detail screenshot" />
                <span>Main dashboard</span>
              </div>
              <div className="screenshot-block">
                <img src={Profile} alt="Profile screenshot" />
                <span>User profile</span>
              </div>
            </div>
          </div>

          <div className="steps-section">
            <div className="section-label">Simple by design</div>
            <h2 className="section-title">Up and running in minutes</h2>
            <div className="steps">
              <div className="step">
                <div className="step-num">01</div>
                <div className="step-line" />
                <h4>Create a project</h4>
                <p>Name it, describe it, set a deadline. Done in 30 seconds.</p>
              </div>
              <div className="step">
                <div className="step-num">02</div>
                <div className="step-line" />
                <h4>Invite your team</h4>
                <p>Send an invitation. Teammates accept and see everything immediately.</p>
              </div>
              <div className="step">
                <div className="step-num">03</div>
                <div className="step-line" />
                <h4>Create & assign tasks</h4>
                <p>Add tasks to the board and assignee them to the right person.</p>
              </div>
              <div className="step">
                <div className="step-num" style={{background: '#1661d8', color: '#fff'}}>04</div>
                <div className="step-line hidden" />
                <h4>Track & ship</h4>
                <p>Watch cards move across columns as your team executes.</p>
              </div>
            </div>
          </div>

          <div className="cta-banner">
            <div className="cta-banner-text">
              <h2>Ready to bring your team to Flowly?</h2>
              <p>Free for teams up to 5. No credit card required.</p>
            </div>
            <div className="cta-banner-actions">
              <Link to="/register" className="cta-primary cta-primary--dark">Get started free →</Link>
              <a href="/contact" className="cta-ghost cta-ghost--light">Talk to us</a>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}