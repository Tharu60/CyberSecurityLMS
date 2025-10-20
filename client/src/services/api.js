import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Stage API
export const stageAPI = {
  getAllStages: () => api.get('/stages'),
  getStageById: (id) => api.get(`/stages/${id}`),
  getStageQuestions: (id) => api.get(`/stages/${id}/questions`),
  createStage: (data) => api.post('/stages', data),
  updateStage: (id, data) => api.put(`/stages/${id}`, data),
  deleteStage: (id) => api.delete(`/stages/${id}`),
};

// Progress API
export const progressAPI = {
  getMyProgress: () => api.get('/progress/my-progress'),
  submitInitialAssessment: (answers) => api.post('/progress/initial-assessment', { answers }),
  submitStageAssessment: (stageId, answers) => api.post('/progress/stage-assessment', { stageId, answers }),
  markVideoCompleted: (videoId) => api.post('/progress/video-completed', { videoId }),
  getVideoProgress: (stageId) => api.get('/progress/videos', { params: { stageId } }),
  getUserProgress: (userId) => api.get(`/progress/user/${userId}`),
};

// Video API
export const videoAPI = {
  getVideosByStage: (stageId) => api.get(`/videos/stage/${stageId}`),
  getAllVideos: () => api.get('/videos'),
  createVideo: (data) => api.post('/videos', data),
  updateVideo: (id, data) => api.put(`/videos/${id}`, data),
  deleteVideo: (id) => api.delete(`/videos/${id}`),
};

// Question API
export const questionAPI = {
  getQuestionsByStage: (stageId) => api.get(`/questions/stage/${stageId}`),
  createQuestion: (data) => api.post('/questions', data),
  updateQuestion: (id, data) => api.put(`/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/questions/${id}`),
};

// Admin API
export const adminAPI = {
  getAllUsers: (role) => api.get('/admin/users', { params: { role } }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getStatistics: () => api.get('/admin/statistics'),
  getStudentAnalytics: () => api.get('/admin/analytics'),
};

// Certificate API
export const certificateAPI = {
  generateCertificate: () => api.post('/certificates/generate'),
  getMyCertificate: () => api.get('/certificates/my-certificate'),
  verifyCertificate: (code) => api.get(`/certificates/verify/${code}`),
};

export default api;
