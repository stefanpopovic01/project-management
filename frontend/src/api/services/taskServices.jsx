import api from "../axios";

export const getUserTasks = (userId) => {
  return api.get(`/api/projects/tasks/?user_id=${userId}`);
};

export const getProjectTasks = (projectId) => {
  return api.get(`/api/projects/tasks/?project_id=${projectId}`);
};

export const getMyTasks = () => {
  return api.get('/tasks/');
};

export const getTask = (id) => {
    return api.get(`/task/${id}`);
};

export const updateTaskStatus = (id, status) => {
  return api.patch(`/api/projects/tasks/${id}/status/`, { status });
};

export const addComment = (id, body) => {
  return api.post(`/task/${id}/comments`, { body });
};

export const updateChecklistItem = (taskId, itemId, isDone) => {
  return api.patch(`/task/${taskId}/checklist/${itemId}`, { isDone });
};

export const createTask = (payload) => {
  return api.post("/api/projects/tasks/", payload);
};

export const createChecklist = (id, payload) => {
  return api.post(`/api/projects/tasks/${id}/checklist/`, payload);
};

    // POST /tasks/<id>/checklist/
    //     Add a new checklist item to a task.
    //     Required body: { text }
    //     Optional body: { is_done } → defaults to False
    //     Permission: task creator only