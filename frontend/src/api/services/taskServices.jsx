import api from "../axios";

export const getUserTasks = (userId) => {
  return api.get(`/api/projects/tasks/?user_id=${userId}`);
};

export const getProjectTasks = (projectId) => {
  return api.get(`/api/projects/tasks/?project_id=${projectId}`);
};

// export const getMyTasks = () => {
//   return api.get('/tasks/');
// };

export const getTask = (id) => {
    return api.get(`/api/projects/tasks/${id}/`);
};

export const updateTaskStatus = (id, status) => {
  return api.patch(`/api/projects/tasks/${id}/status/`, { status });
};

export const addComment = (id, body) => {
  return api.post(`/api/projects/tasks/${id}/comments/`, { body });
};

export const updateChecklistItem = (id, item_id, is_done) => {
  return api.patch(`/api/projects/tasks/${id}/checklist/${item_id}/`, { is_done });
};

export const createTask = (payload) => {
  return api.post("/api/projects/tasks/", payload);
};

export const createChecklist = (id, payload) => {
  return api.post(`/api/projects/tasks/${id}/checklist/`, payload);
};