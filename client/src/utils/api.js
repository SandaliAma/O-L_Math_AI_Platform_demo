import axios from 'axios';
import api from './axiosConfig';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Auth API
export const authAPI = {
  register: (data) => axios.post(`${API_URL}/auth/register`, data),
  login: (data) => axios.post(`${API_URL}/auth/login`, data),
  getMe: () => axios.get(`${API_URL}/auth/me`)
};

// Quiz API
export const quizAPI = {
  generate: (params) => api.get(`/quiz/generate`, { params }),
  getById: (id) => api.get(`/quiz/${id}`),
  submit: (data) => api.post(`/quiz/submit`, data),
  getModelPaper: () => api.get(`/quiz/model-paper`),
  getHistory: () => api.get(`/quiz/history`),
  getTopics: (params) => api.get(`/quiz/topics`, { params })
};

// Forum API
export const forumAPI = {
  getPosts: (params) => axios.get(`${API_URL}/forum/posts`, { params }),
  getPost: (id) => axios.get(`${API_URL}/forum/posts/${id}`),
  createPost: (data) => axios.post(`${API_URL}/forum/posts`, data),
  addComment: (postId, data) => axios.post(`${API_URL}/forum/posts/${postId}/comments`, data),
  likePost: (postId) => axios.post(`${API_URL}/forum/posts/${postId}/like`)
};

// Progress API
export const progressAPI = {
  getDashboard: () => axios.get(`${API_URL}/progress/dashboard`),
  getPortfolio: () => axios.get(`${API_URL}/progress/portfolio`)
};

// Stress API
export const stressAPI = {
  analyze: (data) => axios.post(`${API_URL}/stress/analyze`, data),
  getHistory: () => axios.get(`${API_URL}/stress/history`)
};

// Games API
export const gamesAPI = {
  play: (data) => axios.post(`${API_URL}/games/play`, data),
  getStats: () => axios.get(`${API_URL}/games/stats`),
  getActivity: (days = 30) => axios.get(`${API_URL}/games/activity`, { params: { days } }),
  getActivityLog: () => axios.get(`${API_URL}/games/activity`)
};

// Badges API
export const badgesAPI = {
  getAll: () => axios.get(`${API_URL}/badges`),
  getMyBadges: () => axios.get(`${API_URL}/badges/my-badges`),
  check: (data) => axios.post(`${API_URL}/badges/check`, data),
  getStats: () => axios.get(`${API_URL}/badges/stats`),
  initialize: () => axios.post(`${API_URL}/badges/initialize`)
};

// Recommendations API
export const recommendationsAPI = {
  getAdaptive: (includeXAI = true) => axios.get(`${API_URL}/recommendations/adaptive`, {
    params: { xai: includeXAI ? 'true' : 'false' }
  }),
  getKnowledgeState: () => axios.get(`${API_URL}/recommendations/knowledge-state`),
  getDKTHealth: () => axios.get(`${API_URL}/recommendations/dkt-health`)
};

// Projections API
export const projectionsAPI = {
  runProjection: (params) => axios.post(`${API_URL}/projections/run`, params),
  getReport: () => axios.get(`${API_URL}/projections/report`),
  getVisualizations: () => axios.get(`${API_URL}/projections/visualizations`),
  getVisualization: (filename) => axios.get(`${API_URL}/projections/visualization/${filename}`, {
    responseType: 'blob'
  })
};


