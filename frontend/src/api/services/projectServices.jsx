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
    return api.get(`/api/projects/${id}/`)
};

export const updateProject = (id, data) => {
  return api.patch(`/api/projects/${id}/`, data);
};

export const removeProjectMember = (projectId, user_id) => {
  return api.post(`/api/projects/${projectId}/remove-member/`, { user_id });
};

export const invite = (projectId, userId, expiresAt) => {
  return api.post(`/api/projects/invites/`, { project: projectId, receiver: userId, expires_at: expiresAt } );
};