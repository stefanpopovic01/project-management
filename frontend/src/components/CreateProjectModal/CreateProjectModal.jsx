import "./CreateProjectModal.css";
import { useState } from "react";
import { createPortal } from "react-dom";
import { createProject } from "../../api/services/projectServices";

export default function CreateProjectModal({ onProjectCreated, onClose }) {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleCreateProject = async (e) => {
    e.preventDefault();

    try {
      const res = await createProject({ title, description, deadline: selectedDate });

      setSuccess(true);
      setError("");
      onProjectCreated?.();

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong..");
      setSuccess(false);
    }
  };

  if (success) {
  
  const timer = setTimeout(() => {
    onClose();
  }, 2000);

  }

  return createPortal(

    <div className="cp-overlay" onClick={onClose}>
      <div
        className="cp-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cp-header">
          <h2>Create Project</h2>
          <button className="cp-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="cp-body">
          <div className="cp-field">
            <label>Project Name</label>
            <input type="text" placeholder="Enter project name..." value={title} onChange={(e) => setTitle(e.target.value)}/>
          </div>

          <div className="cp-field">
            <label>Description</label>
            <textarea placeholder="Project description..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="cp-field">
            <label>Deadline</label>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}/>
          </div>
        </div>

        <div className="cp-footer">
          <button className="cp-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="cp-create" onClick={handleCreateProject}>
            <i className="fa-solid fa-plus"></i> Create Project
          </button>
        </div>

        {success && <p className="cp-succes-msg">You've successfully created project.</p>}
        {error && <p className="cp-error-msg">{error}</p>}

      </div>
    </div>,
    document.getElementById("modal-root")
  );
}
