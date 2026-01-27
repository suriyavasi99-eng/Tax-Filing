import axios from 'axios';
// import { log } from 'console';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
console.log("api url>>>",API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzZ0BnbWFpbC5jb20iLCJ1c2VySWQiOjcsIm5hbWUiOiJzdXJpeWEiLCJpYXQiOjE3Njk0MDEyOTcsImV4cCI6MTc2OTQ4NzY5N30.LBd-DEmWEfbB1vUjAocbOiE2L_bRfD-0R6DH6ESM1-w",
    'Content-Type': 'application/json',
  },
});

export const get = (url, config) => apiClient.get(url, config);
export const post = (url, data, config) => apiClient.post(url, data, config);
export const del = (url, config) => apiClient.delete(url, config);
export const put = (url, data, config) => apiClient.put(url, data, config);

export default apiClient;