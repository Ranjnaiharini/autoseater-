import axios from 'axios';
import { toast } from 'sonner';

// Use REACT_APP_BACKEND_URL if provided.
// In the browser (development) prefer a relative '/api' base so CRA's proxy can forward requests and avoid CORS/port issues.
// If REACT_APP_BACKEND_URL is explicitly set (e.g., running against a remote backend), use that.
const explicitBackend = process.env.REACT_APP_BACKEND_URL;
let API_BASE;
if (explicitBackend) {
  const BACKEND_URL = explicitBackend;
  API_BASE = `${BACKEND_URL.replace(/\/$/, '')}/api`;
} else if (typeof window !== 'undefined') {
  // running in browser and no explicit backend -> use relative path so the dev server proxy kicks in
  API_BASE = '/api';
} else {
  // non-browser (server-side) fallback to localhost
  const BACKEND_URL = 'http://localhost:8000';
  API_BASE = `${BACKEND_URL.replace(/\/$/, '')}/api`;
}

// Helpful debug log to surface the API base when the frontend runs
if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.debug('[api] API_BASE=', API_BASE, 'REACT_APP_BACKEND_URL=', process.env.REACT_APP_BACKEND_URL);
}

const api = axios.create({
  baseURL: API_BASE,
});

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Friendly handling for forbidden (admin-only) errors
    if (error.response?.status === 403) {
      toast.error('Admin access required to perform this action.');
      return Promise.reject(error);
    }

    // include the request URL in the toast to make debugging easier
    const requestUrl = error.config?.baseURL ? (error.config.baseURL + (error.config.url || '')) : (error.config?.url || error.response?.request?.responseURL);
    const message = error.response?.data?.detail || error.message || 'An error occurred';
    toast.error(`${message} ${requestUrl ? '(' + requestUrl + ')' : ''}`);

    return Promise.reject(error);
  }
);

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const getMe = () => api.get('/auth/me');

// Students
export const getStudents = () => api.get('/students');
export const createStudent = (data) => api.post('/students', data);
export const createStudentsBulk = (data) => api.post('/students/bulk', data);
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/students/${id}`);

// Departments
export const getDepartments = () => api.get('/departments');
export const createDepartment = (data) => api.post('/departments', data);
export const deleteDepartment = (id) => api.delete(`/departments/${id}`);

// Rooms
export const getRooms = () => api.get('/rooms');
export const createRoom = (data) => api.post('/rooms', data);
export const deleteRoom = (id) => api.delete(`/rooms/${id}`);

// Exams
export const getExams = () => api.get('/exams');
export const getExam = (id) => api.get(`/exams/${id}`);
export const createExam = (data) => api.post('/exams', data);
export const deleteExam = (id) => api.delete(`/exams/${id}`);

// Seating
export const generateSeating = (data) => api.post('/seating/generate', data);
export const getSeatingPlans = (examId) => api.get(`/seating/exam/${examId}`);
export const exportSeatingExcel = (examId) => {
  return api.get(`/seating/export/${examId}`, {
    responseType: 'blob',
  });
};

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');

export default api;
