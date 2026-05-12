import React, { useState, useCallback, useRef, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./DashboardSingleProject.css";

import { getProject, updateProject, removeProjectMember, invite } from "../../api/services/projectServices";
import { getTask, createTask, getProjectTasks } from "../../api/services/taskServices";
import { updateTaskStatus, updateChecklistItem, addComment} from "../../api/services/taskServices";
import { getUsers } from "../../api/services/userServices";
import { AuthContext } from "../../contex/AuthContext";


const Icon = {
  back: (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="13 5 7 10 13 15" /></svg>),
  close: (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="5" y1="5" x2="15" y2="15" /><line x1="15" y1="5" x2="5" y2="15" /></svg>),
  plus: (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="10" y1="4" x2="10" y2="16" /><line x1="4" y1="10" x2="16" y2="10" /></svg>),
  users: (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="7" cy="7" r="3" /><path d="M1 17c0-3.3 2.7-6 6-6" /><circle cx="14" cy="7" r="3" /><path d="M19 17c0-3.3-2.7-6-6-6" /></svg>),
  calendar: (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="4" width="16" height="14" rx="2" /><line x1="2" y1="8" x2="18" y2="8" /><line x1="6" y1="2" x2="6" y2="6" /><line x1="14" y1="2" x2="14" y2="6" /></svg>),
  pencil: (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M14.5 2.5l3 3L6 17H3v-3L14.5 2.5z" /></svg>),
  userPlus: (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="8" cy="7" r="4" /><path d="M2 17c0-3.3 2.7-6 6-6" /><line x1="15" y1="11" x2="15" y2="17" /><line x1="12" y1="14" x2="18" y2="14" /></svg>),
  drag: (<svg viewBox="0 0 20 20" fill="currentColor"><circle cx="7" cy="6" r="1.25" /><circle cx="13" cy="6" r="1.25" /><circle cx="7" cy="10" r="1.25" /><circle cx="13" cy="10" r="1.25" /><circle cx="7" cy="14" r="1.25" /><circle cx="13" cy="14" r="1.25" /></svg>),
  send: (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><line x1="18" y1="2" x2="9" y2="11" /><polygon points="18,2 12,18 9,11 2,8" /></svg>),
  flag: (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 3v14M4 3h12l-3 4 3 4H4" /></svg>),
  check: (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 10 8 14 16 6" /></svg>),
  trash: (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><polyline points="3 6 5 6 17 6" /><path d="M8 6V4h4v2" /><path d="M7 6l1 10h4l1-10" /></svg>),
  save: (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 3h10l3 3v11a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" /><rect x="7" y="3" width="6" height="4" rx="0.5" /><rect x="5" y="11" width="10" height="6" rx="0.5" /></svg>),
  mail: (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="4" width="16" height="12" rx="2" /><path d="M2 7l8 5 8-5" /></svg>),
  task: (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="14" height="14" rx="2" /><polyline points="7 10 9 12 13 8" /></svg>),
};

const COLUMNS = [
  { id: "planned",  label: "Planned",     dotClass: "planned" },
  { id: "progress", label: "In Progress", dotClass: "progress" },
  { id: "done",     label: "Done",        dotClass: "done" },
];

const PRIORITIES = ["high", "medium", "low"];

function fmtDate(iso) {
  if (!iso) return { label: "—", overdue: false };
  const d   = new Date(iso);
  const now = new Date();
  return {
    label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    overdue: d < now,
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function useToast() {
  const [show, setShow] = useState(false);
  const [msg,  setMsg]  = useState("");
  const timer = useRef(null);

  const fire = (message) => {
    clearTimeout(timer.current);
    setMsg(message);
    setShow(true);
    timer.current = setTimeout(() => setShow(false), 2200);
  };

  useEffect(() => () => clearTimeout(timer.current), []);
  return { show, msg, fire };
}

function TaskDetailDrawer({ task, colLabel, isOpen, onClose, currentUser }) {
  const [comment,  setComment]  = useState("");
  const [checks,   setChecks]   = useState([]);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (task) {
      setChecks(task.checklist.map(c => ({ ...c })));
      setComments([...task.comments]);
    }
    setComment("");
  }, [task?.id]);

  const toggleCheck = async (id) => {
    const current = checks.find(c => c.id === id);
    if (!current) return;

    const newDone = !current.done;

    setChecks(prev =>
      prev.map(c =>
        c.id === id ? { ...c, done: newDone } : c
      )
    );

  try {
    await updateChecklistItem(task.id, id, newDone);
  } catch (err) {
    console.error(err);
    setChecks(prev =>
      prev.map(c =>
        c.id === id ? { ...c, done: current.done } : c
      )
    );
  }
};

const sendComment = async () => {
  if (!comment.trim()) return;

  const text = comment.trim();
  const taskId = task.id;

  const initials =
    `${currentUser.firstName?.[0] ?? ""}${currentUser.lastName?.[0] ?? ""}`.toUpperCase() || "?";

  const newComment = {
    author: `${currentUser.firstName ?? ""} ${currentUser.lastName ?? ""}`.trim(),
    initials,
    time: "Just now",
    avatarUrl: currentUser.avatarUrl || "",
    text
  };

  setComments(prev => [...prev, newComment]);
  setComment("");

  try {
    await addComment(taskId, text);
  } catch (err) {
    console.error(err);
  }
};

  const due = task ? fmtDate(task.due) : null;
  const doneCount = checks.filter(c => c.done).length;
  if (!task) return null;

  return (
    <>
      <div className={`dsp-overlay${isOpen ? " open" : ""}`} onClick={onClose} />
      <aside className={`dsp-drawer${isOpen ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Task detail">
        <div className="dsp-drawer-header">
          <div className="dsp-drawer-title-wrap">
            <div className="dsp-drawer-title">{task.title}</div>
            <div className="dsp-drawer-subtitle">In: {colLabel}</div>
          </div>
          <button className="dsp-drawer-close" onClick={onClose}>{Icon.close}</button>
        </div>

        <div className="dsp-drawer-body">
          <div className="dsp-detail-section">
            <div className="dsp-dlabel">Details</div>
            <div className="dsp-detail-row">
              <span className="dsp-detail-row-label">Priority</span>
              <span className="dsp-detail-row-value"><span className={`dsp-priority ${task.priority}`}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span></span>
            </div>
            <div className="dsp-detail-row">
              <span className="dsp-detail-row-label">Assignee</span>
              <span className="dsp-detail-row-value">
                <span className="dsp-detail-assignee-chip">
                <span className="dsp-detail-assignee-av">
                  {task.assignee.avatarUrl ? (
                    <img  src={task.assignee.avatarUrl}  alt={task.assignee.initials}  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    task.assignee.initials
                  )}
                </span>
                  {task.assignee.name}
                </span>
              </span>
            </div>
            <div className="dsp-detail-row">
              <span className="dsp-detail-row-label">Due date</span>
              <span className={`dsp-detail-row-value${due?.overdue ? " dsp-task-due overdue" : ""}`}>{due?.label}</span>
            </div>
            {task.tags.length > 0 && (
              <div className="dsp-detail-row">
                <span className="dsp-detail-row-label">Tags</span>
                <span className="dsp-detail-row-value">{task.tags.map(t => <span key={t} className="dsp-task-tag">{t}</span>)}</span>
              </div>
            )}
          </div>

          <div className="dsp-detail-section">
            <div className="dsp-dlabel">Description</div>
            <p className="dsp-drawer-desc">{task.description}</p>
          </div>

          {checks.length > 0 && (
            <div className="dsp-detail-section">
              <div className="dsp-dlabel">Checklist — {doneCount}/{checks.length}</div>
              <div className="dsp-checklist-list">
                {checks.map(item => (
                  <label key={item.id} className={`dsp-check-item${item.done ? " checked" : ""}`}>
                    <input type="checkbox" checked={item.done} onChange={() => toggleCheck(item.id)} />
                    {item.text}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="dsp-detail-section">
            <div className="dsp-dlabel">Comments ({comments.length})</div>
            {comments.length > 0 && (
              <div className="dsp-comments">
                {comments.map((c, i) => (
                  <div key={i} className="dsp-comment">
              <div className="dsp-comment-av">
                {c.avatarUrl ? (
                  <img src={c.avatarUrl} alt={`${c.initials}'s avatar`} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                ) : (
                  c.initials
                )}
              </div>
                    <div className="dsp-comment-body">
                      <div className="dsp-comment-top">
                        <span className="dsp-comment-author">{c.author}</span>
                        <span className="dsp-comment-time">{c.time}</span>
                      </div>
                      <p className="dsp-comment-text">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dsp-drawer-footer">
          <div className="dsp-comment-input-row">
            <input className="dsp-comment-input" type="text" placeholder="Add a comment…" value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === "Enter" && sendComment()} />
            <button className="dsp-comment-send" onClick={sendComment}>{Icon.send}</button>
          </div>
        </div>
      </aside>
    </>
  );
}

function AddTaskDrawer({ isOpen, onClose, onAdd, defaultCol, members, projectId }) {
  const EMPTY = { title: "", description: "", priority: "medium", due: "", checklist: [], tags: [], assigneeId: members?.[0]?.user?._id || null };
  const [form,        setForm]       = useState(EMPTY);
  const [col,         setCol]        = useState(defaultCol || "planned");
  const [checkInput,  setCheckInput] = useState("");
  const [tagInput,    setTagInput]   = useState("");
  const [saving,      setSaving]     = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setForm({ ...EMPTY, assigneeId: members?.[0]?.user?._id || null });
      setCol(defaultCol || "planned");
      setCheckInput("");
      setTagInput("");
      setTimeout(() => titleRef.current?.focus(), 340);
    }
  }, [isOpen, defaultCol]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const addCheck = () => {
    if (!checkInput.trim()) return;
    setForm(prev => ({
      ...prev,
      checklist: [...prev.checklist, { id: `nc-${Date.now()}`, text: checkInput.trim(), done: false }],
    }));
    setCheckInput("");
  };

  const removeCheck = (id) =>
    setForm(prev => ({ ...prev, checklist: prev.checklist.filter(c => c.id !== id) }));

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || form.tags.includes(t)) return;
    setForm(prev => ({ ...prev, tags: [...prev.tags, t] }));
    setTagInput("");
  };

  const removeTag = (tag) =>
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));

  const getMemberDisplay = (member) => {
    const user = member?.user;
    const firstName = user?.firstName || "";
    const lastName  = user?.lastName  || "";
    const avatarUrl = user?.avatarUrl  || "";
    const initials  = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "?";
    const name      = [firstName, lastName].filter(Boolean).join(" ") || user?.email || "Unknown";
    return { avatarUrl, initials, name, id: user?._id };
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title:       form.title.trim(),
        description: form.description.trim(),
        project:     projectId,
        assignedTo:  form.assigneeId || null,
        priority:    form.priority,
        dueDate:     form.due || null,
        status:      col,
        tags:        form.tags,
        checklist:   form.checklist,
        comments:    [],
      };

      const response = await createTask(payload);
      const task = response.data.task;

      const selectedMember =
        members?.find(m => m.user?._id === form.assigneeId) || members?.[0];

      const selectedUser = selectedMember?.user || null;
      
      onAdd({
        _id:          task._id,
        status:      task.status,
        title:       task.title,
        description: task.description,
        priority:    task.priority,
        assignedTo:  selectedUser,
        tags:        task.tags,
        dueDate:         task.dueDate || null,
        checklist:   task.checklist,
        comments:    [],
      });

      onClose();
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className={`dsp-overlay${isOpen ? " open" : ""}`} onClick={onClose} />
      <aside className={`dsp-drawer${isOpen ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Add task">
        <div className="dsp-drawer-header">
          <div className="dsp-drawer-title-wrap">
            <div className="dsp-drawer-title">Add Task</div>
            <div className="dsp-drawer-subtitle">New task for this project</div>
          </div>
          <button className="dsp-drawer-close" onClick={onClose}>{Icon.close}</button>
        </div>

        <div className="dsp-drawer-body">
          <div className="dsp-field">
            <label className="dsp-field-label">Add to column</label>
            <div className="dsp-role-row">
              {COLUMNS.map(c => (
                <button key={c.id} className={`dsp-role-opt${col === c.id ? " selected" : ""}`} onClick={() => setCol(c.id)}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="dsp-field">
            <label className="dsp-field-label" htmlFor="at-title">Title <span style={{ color: "#dc2626" }}>*</span></label>
            <input ref={titleRef} id="at-title" className="dsp-input" placeholder="e.g. Design login screen" value={form.title} onChange={set("title")} maxLength={120} />
          </div>

          <div className="dsp-field">
            <label className="dsp-field-label" htmlFor="at-desc">Description</label>
            <textarea id="at-desc" className="dsp-textarea" placeholder="What needs to be done? Include context, acceptance criteria, links…" value={form.description} onChange={set("description")} rows={4} />
          </div>

          <div className="dsp-field">
            <label className="dsp-field-label">Priority</label>
            <div className="dsp-priority-group">
              {PRIORITIES.map(p => (
                <button key={p} className={`dsp-priority-opt${form.priority === p ? ` selected ${p}` : ""}`} onClick={() => setForm(prev => ({ ...prev, priority: p }))}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="dsp-field">
            <label className="dsp-field-label" htmlFor="at-due">Due date</label>
            <input id="at-due" className="dsp-input" type="date" value={form.due} onChange={set("due")} />
          </div>

          {members?.length > 0 && (
            <div className="dsp-field">
              <label className="dsp-field-label">Assignee</label>
              <div className="dsp-members-row">
                {members.map((member) => {
                  const { avatarUrl, initials, name, id } = getMemberDisplay(member);
                  const isSelected = form.assigneeId === id;
                  return (
                    <button
                      key={member._id}
                      title={name}
                      className={`dsp-member-btn${isSelected ? " selected" : ""}`}
                      onClick={() => setForm(prev => ({ ...prev, assigneeId: id }))}
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={name}
                          className="dsp-member-avatar"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <span
                        className="dsp-member-initials"
                        style={{ display: avatarUrl ? "none" : "flex" }}
                      >
                        {initials}
                      </span>
                      <span className="dsp-member-name">{name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="dsp-field">
            <label className="dsp-field-label">Tags</label>
            {form.tags.length > 0 && (
              <div className="dsp-tags-row">
                {form.tags.map(tag => (
                  <span key={tag} className="dsp-tag-pill">
                    {tag}
                    <button className="dsp-tag-remove" onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`}>
                      {Icon.close}
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="dsp-add-check-row">
              <input
                className="dsp-add-check-input"
                placeholder="Add tag…"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addTag()}
                maxLength={40}
              />
              <button className="dsp-icon-btn" onClick={addTag} disabled={!tagInput.trim()}>
                {Icon.plus}
              </button>
            </div>
          </div>

          <div className="dsp-field">
            <label className="dsp-field-label">Checklist</label>
            {form.checklist.length > 0 && (
              <div className="dsp-checklist-list">
                {form.checklist.map(item => (
                  <div key={item.id} className="dsp-check-item">
                    <input type="checkbox" checked={item.done} readOnly />
                    <span style={{ flex: 1 }}>{item.text}</span>
                    <button className="dsp-check-remove" onClick={() => removeCheck(item.id)}>{Icon.close}</button>
                  </div>
                ))}
              </div>
            )}
            <div className="dsp-add-check-row">
              <input className="dsp-add-check-input" placeholder="Add checklist item…" value={checkInput} onChange={e => setCheckInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addCheck()} maxLength={120} />
              <button className="dsp-icon-btn" onClick={addCheck} disabled={!checkInput.trim()}>{Icon.plus}</button>
            </div>
          </div>
        </div>

        <div className="dsp-drawer-footer">
          <div className="dsp-drawer-actions">
            <button className="dsp-drawer-btn cancel" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="dsp-drawer-btn save" onClick={handleSave} disabled={saving || !form.title.trim()}>
              {saving ? <><span className="dsp-spinner" /> Adding…</> : <>{Icon.task} Add Task</>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function InviteDrawer({ isOpen, onClose, projectTitle, projectId, onInvite }) {
  const [search,        setSearch]        = useState("");
  const [results,       setResults]       = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [expiresAt,     setExpiresAt]     = useState("");
  const [searching,     setSearching]     = useState(false);
  const [saving,        setSaving]        = useState(false);
  const inputRef  = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSearch(""); setResults([]); setSelectedUsers([]); setExpiresAt("");
      setTimeout(() => inputRef.current?.focus(), 340);
    }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleSearchChange = useCallback((val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    if (val.length < 2) { setResults([]); return; }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await getUsers(val);
        setResults(res.data.users || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, []);

  const toggleUser = (user) => {
    setSelectedUsers(prev =>
      prev.find(u => u._id === user._id)
        ? prev.filter(u => u._id !== user._id)
        : [...prev, user]
    );
  };

  const removeUser = (id) => setSelectedUsers(prev => prev.filter(u => u._id !== id));

  const getInitials = (u) =>
    ((u.firstName?.[0] ?? "") + (u.lastName?.[0] ?? "")).toUpperCase();

  const handleSend = async () => {
    if (!selectedUsers.length) return;
    setSaving(true);
    try {
      await Promise.all(
        selectedUsers.map(u =>
          invite(projectId, u._id, expiresAt || null)
        )
      );
      onInvite?.(selectedUsers);
    } finally {
      setSaving(false);
      onClose();
    }
  };

  return (
    <>
      <div className={`dsp-overlay${isOpen ? " open" : ""}`} onClick={onClose} />
      <aside className={`dsp-drawer${isOpen ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Invite people">

        <div className="dsp-drawer-header">
          <div className="dsp-drawer-title-wrap">
            <div className="dsp-drawer-title">Invite People</div>
            <div className="dsp-drawer-subtitle">to {projectTitle}</div>
          </div>
          <button className="dsp-drawer-close" onClick={onClose}>{Icon.close}</button>
        </div>

        <div className="dsp-drawer-body">

          <div className="dsp-field">
            <label className="dsp-field-label">Search users</label>
            <div className="dsp-search-wrap">
              <span className="dsp-search-icon">{Icon.search}</span>
              <input
                ref={inputRef}
                className="dsp-search-input"
                type="text"
                placeholder="Search by name or email…"
                value={search}
                onChange={e => handleSearchChange(e.target.value)}
              />
              {searching && <span className="dsp-search-spinner" />}
            </div>

            {results.length > 0 && (
              <div className="dsp-user-results">
                {results.map(u => {
                  const isSelected = !!selectedUsers.find(s => s._id === u._id);
                  return (
                    <div
                      key={u._id}
                      className={`dsp-user-item${isSelected ? " selected" : ""}`}
                      onClick={() => toggleUser(u)}
                    >
                      <div className="dsp-avatar">
                        {u.avatarUrl
                          ? <img src={u.avatarUrl} alt={getInitials(u)} />
                          : getInitials(u)
                        }
                      </div>
                      <div className="dsp-user-info">
                        <div className="dsp-user-name">{u.firstName} {u.lastName}</div>
                        <div className="dsp-user-email">{u.email}</div>
                      </div>
                      {isSelected && <div className="dsp-check">{Icon.check}</div>}
                    </div>
                  );
                })}
              </div>
            )}

            {search.length >= 2 && !searching && results.length === 0 && (
              <div className="dsp-user-results">
                <div className="dsp-no-results">No users found</div>
              </div>
            )}
          </div>

          {selectedUsers.length > 0 && (
            <div className="dsp-field">
              <label className="dsp-field-label">Selected ({selectedUsers.length})</label>
              <div className="dsp-selected-chips">
                {selectedUsers.map(u => (
                  <div key={u._id} className="dsp-chip">
                    <div className="dsp-chip-avatar">
                      {u.avatarUrl
                        ? <img src={u.avatarUrl} alt={getInitials(u)} />
                        : getInitials(u)
                      }
                    </div>
                    {u.firstName} {u.lastName}
                    <button className="dsp-chip-remove" onClick={() => removeUser(u._id)}>
                      {Icon.close}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="dsp-field">
            <label className="dsp-field-label">Invite expires at</label>
            <input
              className="dsp-expires-input"
              type="datetime-local"
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
            />
            <p className="dsp-email-hint">Leave blank for a permanent invite.</p>
          </div>

        </div>

        <div className="dsp-drawer-footer">
          <div className="dsp-drawer-actions">
            <button className="dsp-drawer-btn cancel" onClick={onClose} disabled={saving}>Cancel</button>
            <button
              className="dsp-drawer-btn save"
              onClick={handleSend}
              disabled={saving || selectedUsers.length === 0}
            >
              {saving
                ? <><span className="dsp-spinner" /> Sending…</>
                : <>{Icon.mail} Send {selectedUsers.length > 0 ? `${selectedUsers.length} ` : ""}Invite{selectedUsers.length !== 1 ? "s" : ""}</>
              }
            </button>
          </div>
        </div>

      </aside>
    </>
  );
}

function EditProjectDrawer({ isOpen, onClose, project, onSave }) {
  const [form,    setForm]    = useState({ title: "", description: "", deadline: "", status: "" });
  const [members, setMembers] = useState([]);
  const [saving,  setSaving]  = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const titleRef = useRef(null);

const STATUS_OPTIONS = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "review", label: "Review" },
  { value: "archived", label: "Archived" }
];

  useEffect(() => {
    if (isOpen && project) {
      setForm({ title: project.title, description: project.description, deadline: project.deadline ? project.deadline.split("T")[0] : "", status: project.status });
      setMembers([...project.members]);
      setIsDirty(false);
      setTimeout(() => titleRef.current?.focus(), 340);
    }
  }, [isOpen, project]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const set = (field) => (e) => { setForm(prev => ({ ...prev, [field]: e.target.value })); setIsDirty(true); };

  const handleSave = async () => {
    if (!form.title.trim()) return;

    try {
      setSaving(true);

      const updated = await updateProject(project._id, form);

      onSave?.(updated.data.project);

      setIsDirty(false);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

const handleRemoveMember = async (userId) => {
  try {
    setMembers(prev => prev.filter(m => m.user._id !== userId));
    console.log("aaa", project._id, userId);
    await removeProjectMember(project._id, userId);

    setIsDirty(true);
  } catch (err) {
    console.error(err);
  }
};

  if (!project) return null;

  return (
    <>
      <div className={`dsp-overlay${isOpen ? " open" : ""}`} onClick={onClose} />
      <aside className={`dsp-drawer${isOpen ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Edit project">
        <div className="dsp-drawer-header">
          <div className="dsp-drawer-title-wrap">
            <div className="dsp-drawer-title">Edit Project</div>
            <div className="dsp-drawer-subtitle">{isDirty ? "Unsaved changes" : "No pending changes"}</div>
          </div>
          <button className="dsp-drawer-close" onClick={onClose}>{Icon.close}</button>
        </div>

        <div className="dsp-drawer-body">
          <div>
            <div className="dsp-dlabel">Project Info</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="dsp-field">
                <label className="dsp-field-label" htmlFor="ep-title">Title <span style={{ color: "#dc2626" }}>*</span></label>
                <input ref={titleRef} id="ep-title" className="dsp-input" value={form.title} onChange={set("title")} maxLength={120} placeholder="Project title" />
              </div>
              <div className="dsp-field">
                <label className="dsp-field-label" htmlFor="ep-desc">Description</label>
                <textarea id="ep-desc" className="dsp-textarea" value={form.description} onChange={set("description")} rows={4} placeholder="What is this project about?" />
              </div>
              <div className="dsp-field">
                <label className="dsp-field-label" htmlFor="ep-deadline">Deadline</label>
                <input id="ep-deadline" className="dsp-input" type="date" value={form.deadline} onChange={set("deadline")} />
              </div>

              <div className="dsp-field">
                <div className="dsp-status-group">
                  <label className="dsp-field-label">Status</label>

                  <div className="dsp-status-buttons">
                    {STATUS_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`dsp-status-btn ${
                          form.status === opt.value ? "active" : ""
                        }`}
                        onClick={() => {
                          setForm(prev => ({
                            ...prev,
                            status: opt.value
                          }));
                          setIsDirty(true);
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div>
            <div className="dsp-dlabel">Members ({members.length})</div>
            <div className="dsp-member-list">
              {members.map(m => {
                return (
                  <div key={m._id} className="dsp-member-row">
                    <div className="dsp-member-av">
                      {m.user?.avatarUrl ? (
                        <img src={m.user.avatarUrl} alt={`${m.user?.firstName ?? ""} ${m.user?.lastName ?? ""}`} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover"}} />
                        ) : ( `${m.user?.firstName?.[0] ?? ""}${m.user?.lastName?.[0] ?? ""}`.toUpperCase() )}
                      </div>

                    <span className="dsp-member-name">
                      {m.user?.firstName ?? ""} {m.user?.lastName ?? ""}
                    </span>

                    <span className="dsp-member-role">
                      {m?.status == "pending" ? "invited" : "member"}
                    </span>

                    <button
                      className="dsp-member-remove"
                      onClick={() => handleRemoveMember(m.user._id)}
                    >
                      {Icon.trash}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="dsp-drawer-footer">
          <div className="dsp-drawer-actions">
            <button className="dsp-drawer-btn cancel" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="dsp-drawer-btn save" 
            onClick={handleSave} 
            disabled={saving || !isDirty || !form.title.trim()}>
              {saving ? <><span className="dsp-spinner" /> Saving…</> : <>{Icon.save} Save Changes</>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function TaskCard({ task, isOwner, onDragStart, onDragEnd, onClick }) {
  const due        = fmtDate(task.due);
  const canDrag    = isOwner;
  const doneChecks = task.checklist.filter(c => c.done).length;

  return (
    <div
      className="dsp-task-card"
      draggable={canDrag}
      onDragStart={canDrag ? (e) => onDragStart(e, task.id) : undefined}
      onDragEnd={onDragEnd}
      onClick={() => onClick(task)}
    >
      {canDrag && <span className="dsp-drag-hint">{Icon.drag}</span>}
      <div className="dsp-task-top">
        <span className="dsp-task-title">{task.title}</span>
        <span className={`dsp-priority ${task.priority}`}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
      </div>
      {task.description && <p className="dsp-task-desc-preview">{task.description}</p>}
      <div className="dsp-task-footer">
        <div className="dsp-task-tags">{task.tags.map(t => <span key={t} className="dsp-task-tag">{t}</span>)}</div>
        <div className="dsp-task-meta">
          {task.checklist.length > 0 && <span style={{ fontSize: "0.6875rem", color: "#9ca3af" }}>{doneChecks}/{task.checklist.length}</span>}
          <span className={`dsp-task-due${due.overdue ? " overdue" : ""}`}>{Icon.calendar} {due.label}</span>
      <div className="dsp-task-assignee" title={task.assignee.name}>
        {task.assignee.avatarUrl ? (
          <img
            src={task.assignee.avatarUrl}
            alt={task.assignee.name}
            className="dsp-task-avatar"
          />
        ) : (
          task.assignee.initials
        )}
      </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardSingleProject() {
  const { id }    = useParams();
  const { state } = useLocation();
  const { user } = useContext(AuthContext);
    
  const navigate  = useNavigate();

  const [dragOverCol,  setDragOverCol]  = useState(null);

  const [activeTask,   setActiveTask]   = useState(null);
  const [taskOpen,     setTaskOpen]     = useState(false);
  const [addOpen,      setAddOpen]      = useState(false);
  const [addDefaultCol,setAddDefaultCol]= useState("planned");
  const [inviteOpen,   setInviteOpen]   = useState(false);
  const [editOpen,     setEditOpen]     = useState(false);

  const toast = useToast();

  const handleDragStart = useCallback((e, taskId) => { 
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("taskId", taskId);
  }, []);

  const handleDragEnd   = useCallback(() => setDragOverCol(null), []); 
  const handleDragOver  = useCallback((e, colId) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOverCol(colId); }, []);

  const handleDrop = useCallback(async (e, colId) => {
    e.preventDefault();

    const taskId = e.dataTransfer.getData("taskId");

    setTasks1(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task._id === taskId
          ? { ...task, status: colId }
          : task
      )
    }));

  setDragOverCol(null);

    try {
      await updateTaskStatus(taskId, colId);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const openTask = (task) => { setActiveTask(task); setTaskOpen(true); };
  const openAddTask = (col = "planned") => { setAddDefaultCol(col); setAddOpen(true); };

  const [loading, setLoading] = useState(false);
  const [project1, setProject1] = useState({});
  const [tasks1, setTasks1] = useState({ count: 0, tasks: [] });

  const fetchProjectData = async () => {
      try {
        setLoading(true);
  
        const [projectsRes, tasksRes] = await Promise.all([
          getProject(id),
          getProjectTasks(id)
        ]);
  
        setProject1(projectsRes.data);
        setTasks1(tasksRes.data);
  
      } catch (err) {
        console.error("Error loading project data:", err);
      } finally {
        setLoading(false);
      }
  };

    const isOwner = project1.creator?._id === user.id;

  const [singleTask, setSingleTask] = useState({});
  const [isLoadingTask, setIsLoadingTask] = useState(false);

  const handleTaskClick = async (taskId) => { 
    if (!taskId) return;

    setIsLoadingTask(true);
    try {
      const res = await getTask(taskId);

      if (res?.data) {
        setSingleTask(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch task details:", error);
    } finally {
      setIsLoadingTask(false);
    }
  };

  const dl = project1?.deadline ? fmtDate(project1.deadline) : null;
  const visibleMembers =
    (project1?.members || [])
      .filter(m => m.status === "accepted")
      .slice(0, 5);

  const acceptedMembers =
    project1?.members?.filter(m => m.status === "accepted") || [];

    useEffect(() => {
        fetchProjectData();
    }, [id] );

  return (
    <>
      <div className="dsp-page">

        <div className="dsp-breadcrumb" onClick={() => navigate(`/dashboard-projects/`)} role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && navigate("/dashboard-projects/")}>
          {Icon.back} Back to Projects
        </div>

        <div className="dsp-info-card">
          <div className="dsp-info-left">
            <h1 className="dsp-project-title">
              {project1?.title || ""}
              <span className={`dsp-status ${project1?.status || ""}`}>
                <span className="dsp-status-dot" />
                {project1?.status?.charAt(0)?.toUpperCase() + project1?.status?.slice(1) || ""}
              </span>
            </h1>
            <p className="dsp-project-desc">{project1?.description || ""}</p>

            <div className="dsp-meta-strip">
              <span className="dsp-meta-item">
                {Icon.flag}
            <strong>
              {project1?.creator 
                ? `${project1.creator.firstName} ${project1.creator.lastName}` 
                : "Unknown Creator"}
            </strong>
                <span style={{ color: "#d1d5db", fontSize: "0.75rem" }}>Owner</span>
              </span>
              <span className="dsp-meta-divider" />
              <span className={`dsp-meta-item${dl?.overdue ? " dsp-task-due overdue" : ""}`}>
                {Icon.calendar}
              <strong>
              <strong>{dl?.label || "No deadline"}</strong>
              </strong>
                <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}>{dl?.overdue ? "Overdue" : "Deadline"}</span>
              </span>
              <span className="dsp-meta-divider" />
              <span className="dsp-meta-item">
                {Icon.users}
                <div className="dsp-meta-avatars">
                {visibleMembers.map((m, i) => (
                  <div key={i} className="dsp-meta-avatar" title={m?.user?.firstName || "Member"}>
                    {m?.user?.avatarUrl ? (
                      <img src={m.user.avatarUrl} alt="avatar" />
                    ) : (
                      `${m?.user?.firstName?.[0] || ""}${m?.user?.lastName?.[0] || ""}`
                    )}
                  </div>
                ))}
                </div>
              <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}>
              {acceptedMembers.length}{" "}
              {acceptedMembers.length === 1 ? "member" : "members"}
              </span>              </span>
              <span className="dsp-meta-divider" />
              <span className="dsp-meta-item">
                {Icon.check}
              <strong>{project1?.completedTasks ?? 0}</strong>
              <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}>
                / {project1?.totalTasks ?? 0} done
              </span>
              </span>
            </div>
          </div>
          <div className="dsp-info-actions">

          {isOwner && (
            <button className="dsp-btn primary" onClick={() => openAddTask("planned")}>
              {Icon.plus} Add Task
            </button>

          )}

          {isOwner && (
              <>
                <button className="dsp-btn ghost" onClick={() => setInviteOpen(true)}>
                  {Icon.userPlus} Invite
                </button>
                <button className="dsp-btn outline" onClick={() => setEditOpen(true)}>
                  {Icon.pencil} Edit Project
                </button>
              </>
            )}
          </div>
        </div>

        <div className="dsp-board-wrap">
          <div className="dsp-board">
            {COLUMNS.map(col => {
              const colTasks = (tasks1.tasks || []).filter(t => t.status === col.id);
              const isOver = dragOverCol === col.id; 
              return (
                <div
                  key={col.id}
                  className={`dsp-col${isOver ? " drag-over" : ""}`}
                  onDragOver={e => handleDragOver(e, col.id)}
                  onDragLeave={() => setDragOverCol(null)}
                  onDrop={e => handleDrop(e, col.id)}
                >
                  <div className="dsp-col-header">
                    <div className="dsp-col-title-wrap">
                      <span className={`dsp-col-dot ${col.dotClass}`} />
                      <span className="dsp-col-name">{col.label}</span>
                      <span className="dsp-col-count">{colTasks.length}</span>
                    </div>
                  {isOwner && (
                    <button
                      className="dsp-col-add-btn"
                      onClick={() => openAddTask(col.id)}
                      aria-label={`Add task to ${col.label}`}
                      title="Add task"
                    >
                      {Icon.plus}
                    </button>
                  )}

                  </div>
                  <div className={`dsp-col-body${isOver ? " drag-over-zone" : ""}`}>
                    {colTasks.map(task => {
                    const assigneeInitials = task.assignedTo
                      ? `${task.assignedTo.firstName?.[0] || ""}${task.assignedTo.lastName?.[0] || ""}`.toUpperCase()
                      : "";
                    const { firstName = "", lastName = "" } = task.assignedTo || {};

                    const fullName = `${firstName} ${lastName}`.trim();
                    const assigneeName = fullName || "Unassigned";

                      const normalizedTask = {
                        id:          task._id,
                        col:         task.status,
                        title:       task.title,
                        description: task.description,
                        priority:    task.priority,
                        due:         task.dueDate,
                        tags:        task.tags || [],
                        checklist:   (task.checklist || []).map(c => ({
                          id:   c._id,
                          text: c.text,
                          done: c.isDone,
                        })),
                        comments: task.comments || [],
                        assignee: { name: assigneeName, initials: assigneeInitials, avatarUrl: task.assignedTo?.avatarUrl || "" }, 
                      };

                    const taskAuth =
                      task.createdBy === user.id ||
                      task.assignedTo?._id === user.id;

                      return (
                        <TaskCard
                          key={task._id}
                          task={normalizedTask}
                          isOwner={taskAuth}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          onClick={() => handleTaskClick(task._id).then(() => setTaskOpen(true))}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <TaskDetailDrawer
        task={(() => {
          if (!singleTask?._id) return null;

          const a = singleTask.assignedTo;

          const assigneeName = a
            ? `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim() || "Unassigned"
            : "Unassigned";

          const assigneeInitials = a
            ? `${a.firstName?.[0] ?? ""}${a.lastName?.[0] ?? ""}`.toUpperCase() || "?"
            : "?";

          return {
            id:          singleTask._id,
            title:       singleTask.title,
            description: singleTask.description,
            priority:    singleTask.priority,
            due:         singleTask.dueDate,
            tags:        singleTask.tags || [],
            checklist:   (singleTask.checklist || []).map(c => ({
              id:   c._id,
              text: c.text,
              done: c.isDone,
            })),
            comments: (singleTask.comments || []).map(c => {
              const author = c.author;

              const authorName = typeof author === "object" && author !== null
                ? `${author.firstName || ""} ${author.lastName || ""}`.trim()
                : "Unknown";

              const authorInitials = typeof author === "object" && author !== null
                ? `${author.firstName?.[0] || ""}${author.lastName?.[0] || ""}`.toUpperCase()
                : "?";
              return {
                author:   authorName,
                initials: authorInitials,
                time:     c.createdAt
                  ? new Date(c.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                  : "",
                text: c.body,
                avatarUrl: author.avatarUrl || ""
              };
            }),
            assignee: { name: assigneeName, initials: assigneeInitials, avatarUrl: a?.avatarUrl || null },
          };
        })()}
        colLabel={
          COLUMNS.find(c => c.id === singleTask?.status)?.label || ""
        }
        isOpen={taskOpen}
        onClose={() => setTaskOpen(false)}
        currentUser={user}
      />


       <AddTaskDrawer
          isOpen={addOpen}
          onClose={() => setAddOpen(false)}
          defaultCol={addDefaultCol}
          members={project1.members?.filter(m => m.status === "accepted") || []}
                  onAdd={(newTask) => {
          setTasks1(prev => ({
            ...prev,
            tasks: [...prev.tasks, newTask],
            count: prev.count + 1
          }));
            toast.fire("Task added successfully");
          }}
          projectId={project1._id}
      />

      <InviteDrawer
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        projectTitle={project1.title}
        onInvite={(emails, role) => toast.fire(`Invited ${emails.length} person${emails.length !== 1 ? "s" : ""} as ${role}`)}
        projectId={project1._id}
      />

      <EditProjectDrawer
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        project={project1}
        onSave={(updated) => {
          setProject1(updated);
          toast.fire("Project updated successfully");
        }}
      />  

      <div className={`dsp-toast${toast.show ? " show" : ""}`} role="status">
        <span className="dsp-toast-icon">{Icon.check}</span>
        {toast.msg}
      </div>
    </>
  );
}
