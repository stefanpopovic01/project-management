import api from "../axios";

export const getAllProjects = (limit = null) => {
  return api.get('/api/projects/', {
    params: {
      ...(limit && { limit }),
    },
  });
};

export const getUserProjects = (userId, limit = null) => {
  return api.get('/api/projects/', {
    params: {
      user_id: userId,
      ...(limit && { limit }),
    },
  });
};

export const getCreatedProjects = (userId, search = "", limit = null) => {
  return api.get('/api/projects/', {
    params: {
      user_id: userId,
      filter: 'created',
      search,
      ...(limit && { limit }),
    },
  });
};

export const getAssignedProjects = (userId, search = "", limit = null) => {
  return api.get('/api/projects/', {
    params: {
      user_id: userId,
      filter: 'assigned',
      search,
      ...(limit && { limit }),
    },
  });
};

export const createProject = (projectData) => {
    return api.post("/api/projects/", projectData);
};

export const acceptInvite = (inviteId) => {
    return api.post(`/api/projects/invites/${inviteId}/accept/`);
};

export const declineInvite = (inviteId) => {
    return api.post(`/api/projects/invites/${inviteId}/decline/`);
};







export const getProject = (id) => {
    return api.get(`/project/${id}`)
};

export const updateProject = (id, data) => {
  return api.patch(`/project/${id}`, data);
};

export const removeProjectMember = (projectId, userId) => {
  return api.delete(`/project/${projectId}/members/${userId}`);
};

export const invite = (projectId, userId, expiresAt) => {
  return api.post(`project/invite`, { projectId, userId, expiresAt });
};