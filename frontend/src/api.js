import axios from 'axios';

// All components talk to the backend through this one object.
const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 120000,
});

export default api;
