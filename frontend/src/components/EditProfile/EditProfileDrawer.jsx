import React, { useState, useEffect, useRef, useCallback } from "react";
import "./EditProfileDrawer.css";
import { createPortal } from "react-dom";
import { editUser } from "../../api/services/userServices";
import { useParams } from "react-router-dom";

const Icon = {
  close: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <line x1="5" y1="5" x2="15" y2="15" />
      <line x1="15" y1="5" x2="5" y2="15" />
    </svg>
  ),
  camera: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M2 7.5A1.5 1.5 0 013.5 6h.382a1.5 1.5 0 001.341-.83l.554-1.107A1.5 1.5 0 017.118 3h5.764a1.5 1.5 0 011.341.83l.554 1.107A1.5 1.5 0 0016.118 6h.382A1.5 1.5 0 0118 7.5v8A1.5 1.5 0 0116.5 17h-13A1.5 1.5 0 012 15.5v-8z" />
      <circle cx="10" cy="11" r="2.5" />
    </svg>
  ),
  upload: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M10 13V4M6 8l4-4 4 4" />
      <path d="M3 14v2a1 1 0 001 1h12a1 1 0 001-1v-2" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <line x1="10" y1="4" x2="10" y2="16" />
      <line x1="4" y1="10" x2="16" y2="10" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2">
      <line x1="5" y1="5" x2="15" y2="15" />
      <line x1="15" y1="5" x2="5" y2="15" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="4 10 8 14 16 6" />
    </svg>
  ),
  save: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 3h10l3 3v11a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" />
      <rect x="7" y="3" width="6" height="4" rx="0.5" />
      <rect x="5" y="11" width="10" height="6" rx="0.5" />
    </svg>
  ),
};

const BIO_MAX = 200;

export default function EditProfileDrawer({ isOpen, onClose, profile, onSave }) {
  
  const { id } = useParams();

  const [form, setForm] = useState({
    firstName:   "",
    lastName:    "",
    position:    "",
    company:     "",
    location:    "",
    email:       "",
    bio: "",
    skills:      [],
    avatarUrl:   null,
  });

  const [newSkill, setNewSkill]   = useState("");
  const [saving, setSaving]       = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isDirty, setIsDirty]     = useState(false);

  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const fileInputRef  = useRef(null);
  const skillInputRef = useRef(null);
  const firstFieldRef = useRef(null);
  const toastTimer    = useRef(null);

  useEffect(() => {
    if (isOpen && profile) {
      setForm({
        firstName:   profile.firstName   ?? "",
        lastName:    profile.lastName    ?? "",
        position:    profile.position    ?? "",
        company:     profile.company     ?? "",
        location:    profile.location    ?? "",
        email:       profile.email       ?? "",
        bio:         profile.bio ?? "",
        skills:      [...(profile.skills ?? [])],
        avatarUrl:   profile.avatarUrl   ?? null,
      });
      setNewSkill("");
      setIsDirty(false);
      setTimeout(() => firstFieldRef.current?.focus(), 360);
    }
  }, [isOpen, profile]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && isOpen) handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setIsDirty(true);
  };

  const handleClose = useCallback(() => {
    if (saving) return;
    onClose();
  }, [saving, onClose]);

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed || form.skills.includes(trimmed)) return;
    setForm((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    setNewSkill("");
    setIsDirty(true);
    skillInputRef.current?.focus();
  };

  const removeSkill = (skill) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
    setIsDirty(true);
  };

  const onSkillKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); addSkill(); }
  };

  const initials = `${form.firstName?.[0] ?? ""}${form.lastName?.[0] ?? ""}`.toUpperCase();
  const bioLen   = form.bio.length;

  const handleSave = async (e) => {
      e.preventDefault();
      setError("");
      setSaving(true);

      try {
          const res = await editUser(id, form);
          
          setSuccess(true);
          setIsDirty(false);
          onSave(res.data); 

          setTimeout(() => {
              onClose();
          }, 1000); 

      } catch (err) {
          setSuccess(false);
          setError(err.response?.data?.message || "Something went wrong.");
      } finally {
          setSaving(false);
      }
  };



  return createPortal(
    <>
      <div className={`epd-overlay${isOpen ? " open" : ""}`} onClick={handleClose} aria-hidden="true" />

      <aside className={`epd-drawer${isOpen ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Edit profile">

        <div className="epd-header">
          <div className="epd-header-left">
            <span className="epd-title">Edit Profile</span>
            <span className="epd-subtitle">
              {isDirty ? "Unsaved changes" : "All changes saved"}
            </span>
          </div>
          <button className="epd-close-btn" onClick={handleClose} aria-label="Close">
            {Icon.close}
          </button>
        </div>

        <div className="epd-body">

          <div className="epd-section">
            <span className="epd-section-label">Profile Photo</span>
            <div className="epd-avatar-row">
              <div className="epd-avatar-preview">
                <div className="epd-avatar">
                  {form.avatarUrl ? <img src={form.avatarUrl} alt="Avatar preview" /> : initials || "?"}
                </div>
                <div
                  className="epd-avatar-overlay"
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  aria-label="Change photo"
                  onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                >
                  {Icon.camera}
                </div>
              </div>

              <div className="epd-avatar-info">
                <p className="epd-avatar-hint">
                  Upload a new photo to personalise your profile.
                  <span>JPG, PNG or GIF · max 5 MB</span>
                </p>
                <button className="epd-upload-btn" onClick={() => fileInputRef.current?.click()}> {Icon.upload} Upload photo </button>
              </div>
              <input ref={fileInputRef} className="epd-file-input" type="file" accept="image/*" />
            </div>
          </div>

          <div className="epd-section">
            <span className="epd-section-label">Basic Info</span>

            <div className="epd-row">
              <div className="epd-field">
                <label className="epd-label" htmlFor="epd-firstName">First Name</label>
                <input
                  ref={firstFieldRef}
                  id="epd-firstName"
                  className="epd-input"
                  type="text"
                  placeholder="Alex"
                  value={form.firstName}
                  onChange={set("firstName")}
                  maxLength={40}
                />
              </div>

              <div className="epd-field">
                <label className="epd-label" htmlFor="epd-lastName">Last Name</label>
                <input
                  id="epd-lastName"
                  className="epd-input"
                  type="text"
                  placeholder="Morrison"
                  value={form.lastName}
                  onChange={set("lastName")}
                  maxLength={40}
                />
              </div>

              <div className="epd-field">
                <label className="epd-label" htmlFor="epd-position">Job Title / Position</label>
                <input
                  id="epd-position"
                  className="epd-input"
                  type="text"
                  placeholder="Senior Product Designer"
                  value={form.position}
                  onChange={set("position")}
                  maxLength={80}
                />
              </div>

              <div className="epd-field">
                <label className="epd-label" htmlFor="epd-company">Company</label>
                <input
                  id="epd-company"
                  className="epd-input"
                  type="text"
                  placeholder="Figma Inc."
                  value={form.company}
                  onChange={set("company")}
                  maxLength={80}
                />
              </div>

              <div className="epd-field">
                <label className="epd-label" htmlFor="epd-location">Location</label>
                <input
                  id="epd-location"
                  className="epd-input"
                  type="text"
                  placeholder="San Francisco, CA"
                  value={form.location}
                  onChange={set("location")}
                  maxLength={80}
                />
              </div>

              <div className="epd-field">
                <label className="epd-label" htmlFor="epd-email">Email</label>
                <input
                  id="epd-email"
                  className="epd-input"
                  type="email"
                  placeholder="alex@company.com"
                  value={form.email}
                  onChange={set("email")}
                  maxLength={120}
                />
              </div>
            </div>
          </div>

          <div className="epd-section">
            <span className="epd-section-label">Bio</span>

            <div className="epd-field full">
              <label className="epd-label" htmlFor="epd-description">About you</label>
              <textarea
                id="epd-description"
                className="epd-textarea"
                placeholder="Tell people a bit about yourself — your background, what you work on, and what you care about."
                value={form.bio}
                onChange={set("bio")}
                maxLength={BIO_MAX}
                rows={4}
              />
              <span className={`epd-char-count${bioLen > BIO_MAX * 0.88 ? " warn" : ""}`}> {bioLen} / {BIO_MAX} </span>
            </div>
          </div>

          <div className="epd-section">
            <span className="epd-section-label">Skills</span>

            <div className="epd-skills-wrap">
              <div className="epd-skills-tags" aria-label="Current skills">
                {form.skills.length === 0 && (
                  <span style={{ fontSize: "0.8125rem", color: "var(--grey-400)" }}>
                    No skills added yet
                  </span>
                )}
                {form.skills.map((skill) => (
                  <span key={skill} className="epd-skill-chip">
                    {skill}
                    <button className="epd-skill-remove" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}> {Icon.x} </button>
                  </span>
                ))}
              </div>

              <div className="epd-skill-add-row">
                <input
                  ref={skillInputRef}
                  className="epd-skill-input"
                  type="text"
                  placeholder="Add a skill (e.g. Figma, React…)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={onSkillKeyDown}
                  maxLength={40}
                />
                <button
                  className="epd-skill-add-btn"
                  onClick={addSkill}
                  disabled={!newSkill.trim() || form.skills.includes(newSkill.trim())}
                  aria-label="Add skill"
                >
                  {Icon.plus} Add
                </button>
              </div>

              <p className="epd-skills-hint">
                Press Enter or click Add · up to 12 skills recommended
              </p>
            </div>
          </div>

        </div>

        <div className="epd-footer">
          <span className="epd-footer-left">
            {isDirty ? "You have unsaved changes" : "No pending changes"}
          </span>
          <div className="epd-footer-right">
            <button className="epd-btn cancel" onClick={(handleClose)} disabled={saving}>
              Cancel
            </button>
            <button className="epd-btn save" onClick={handleSave} disabled={saving || !isDirty}>
              {saving
                ? <><span className="epd-spinner" /> Saving…</>
                : <>{Icon.save} Save Changes</>}
            </button>
          </div>
        </div>
      </aside>

      <div className={`epd-toast${showToast ? " show" : ""}`} role="status">
        <span className="epd-toast-icon">{Icon.check}</span>
        Profile updated successfully
      </div>
    </>
  ,
    document.getElementById("modal-root")
  );
}
