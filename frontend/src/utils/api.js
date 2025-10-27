import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

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
    
    const message = error.response?.data?.detail || error.message || 'An error occurred';
    toast.error(message);
    
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
