import api from "../axios";

export const getAllUserTasks = (id) => {
    return api.get(`/task/userTasks/${id}`);
};

export const getProjectTasks = (projectId) => {
    return api.get(`/task/${projectId}/tasks`);
};

export const getTask = (id) => {
    return api.get(`/task/${id}`);
};

export const updateTaskStatus = (id, status) => {
  return api.patch(`/task/${id}/status`, { status });
};

export const addComment = (id, body) => {
  return api.post(`/task/${id}/comments`, { body });
};

export const updateChecklistItem = (taskId, itemId, isDone) => {
  return api.patch(`/task/${taskId}/checklist/${itemId}`, { isDone });
};

export const createTask = (payload) => {
  return api.post("/task", payload);
};