import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Handle response errors
apiClient.interceptors.response.use((response) => {
  return response
}, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }
  return Promise.reject(error)
})

// Events API
export const eventsAPI = {
  getAll: (params) => apiClient.get('/events', { params }),
  getById: (id) => apiClient.get(`/events/${id}`),
  create: (data) => apiClient.post('/events', data),
  update: (id, data) => apiClient.put(`/events/${id}`, data),
  delete: (id) => apiClient.delete(`/events/${id}`),
  rsvp: (id) => {
    // For MVP: generate or use a user ID
    const userId = localStorage.getItem('userId') || 'anon_' + Date.now()
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', userId)
    }
    return apiClient.post(`/events/${id}/rsvp`, { userId })
  },
  cancelRsvp: (id) => {
    const userId = localStorage.getItem('userId')
    return apiClient.delete(`/events/${id}/rsvp`, { data: { userId } })
  },
  addFeedback: (id, data) => apiClient.post(`/events/${id}/feedback`, data),
  getUpcoming: () => apiClient.get('/events/upcoming'),
  getMyEvents: () => apiClient.get('/events/myevents'),
  searchByRadius: (zipcode, distance) => 
    apiClient.get(`/events/radius/${zipcode}/${distance}`)
}

// Auth API
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getCurrentUser: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/updateprofile', data),
  updatePassword: (data) => apiClient.put('/auth/updatepassword', data),
  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }
}

// Users API
export const usersAPI = {
  getById: (id) => apiClient.get(`/users/${id}`),
  update: (id, data) => apiClient.put(`/users/${id}`, data),
  delete: (id) => apiClient.delete(`/users/${id}`)
}

export default apiClient
