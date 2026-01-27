import axios from 'axios';
// import { log } from 'console';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
console.log("api url>>>",API_BASE_URL);
const userString = sessionStorage.getItem('user');
const user = userString ? JSON.parse(userString) : null;
const token = user?.token;
console.log("login token", token);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Authorization": `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

export const get = (url, config) => apiClient.get(url, config);
export const post = (url, data, config) => apiClient.post(url, data, config);
export const del = (url, config) => apiClient.delete(url, config);
export const put = (url, data, config) => apiClient.put(url, data, config);

export default apiClient;