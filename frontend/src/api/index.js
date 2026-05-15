import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getBranches = async () => {
  const response = await api.get('/api/branches/');
  return response.data;
};

export const deleteBranch = async (name) => {
  const response = await api.delete(`/api/branches/${name}/`);
  return response.data;
};

export const getSubjects = async (branch, semester) => {
  const response = await api.get(`/api/subjects/?branch=${branch}&semester=${semester}`);
  return response.data;
};

export const generateTimetable = async (data) => {
  const response = await api.post('/api/generate/', data);
  return response.data;
};

export default api;
