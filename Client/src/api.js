// src/api.js
import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

const api = axios.create({
  baseURL,
  // do NOT set a global Content-Type here — we'll set it conditionally below
})

// attach token if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  // If the body is a plain object (JSON), set content-type
  const isPlainObject = config.data && Object.prototype.toString.call(config.data) === '[object Object]'
  if (isPlainObject && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json'
  }

  // Otherwise (e.g., FormData) leave Content-Type unset so the browser sets boundary
  return config
}, err => Promise.reject(err))

export default api
