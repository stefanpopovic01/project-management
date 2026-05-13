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

export const getCreatedProjects = (limit = null) => {
  return api.get('/api/projects/', {
    params: {
      filter: 'created',
      ...(limit && { limit }),
    },
  });
};

export const getAssignedProjects = (userId, limit = null) => {
  return api.get('/api/projects/', {
    params: {
      filter: 'assigned',
      ...(limit && { limit }),
    },
  });
};

export const searchProjects = (search, limit = null) => {
  return api.get('/api/projects/', {
    params: {
      search,
      ...(limit && { limit }),
    },
  });
};

export const createProject = (projectData) => {
    return api.post("/api/projects/", projectData);
};





export const respondInvite = (projectId, action) => {
  return api.patch("/project/respond-invite", {
    projectId,
    action
  });
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