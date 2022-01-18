import axios from 'axios';

export const API_URL = 'http://localhost:5000';

const $api = axios.create({
  withCredentials: true, // для автоматического добавления кук к каждому запросу
  baseURL: API_URL,
});

$api.interceptors.request.use((config) => {
  config.headers!.Authorization = `Bearer ${localStorage.getItem('token')}`;
  return config;
});

export default $api;
