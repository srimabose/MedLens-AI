import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create axios instance with auth interceptor
const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
authApi.interceptors.request.use((config) => {
  const token = Cookies.get('medlens_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API functions
export const authAPI = {
  // Register with email/password
  register: async (userData) => {
    console.log('🔄 Making registration API call to:', `${API_URL}/auth/register`)
    console.log('📤 Registration data:', userData)
    try {
      const response = await authApi.post('/auth/register', userData)
      console.log('✅ Registration API response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Registration API error:', error)
      throw error
    }
  },

  // Login with email/password
  login: async (credentials) => {
    const response = await authApi.post('/auth/login', credentials)
    return response.data
  },

  // Get current user info
  getCurrentUser: async () => {
    const response = await authApi.get('/auth/me')
    return response.data
  },

  // Google OAuth
  getGoogleAuthUrl: async () => {
    const response = await authApi.get('/auth/google')
    return response.data.auth_url
  },

  googleCallback: async (code) => {
    const response = await authApi.post('/auth/google/callback', { code })
    return response.data
  },

  // Facebook OAuth
  getFacebookAuthUrl: async () => {
    const response = await authApi.get('/auth/facebook')
    return response.data.auth_url
  },

  facebookCallback: async (code) => {
    const response = await authApi.post('/auth/facebook/callback', { code })
    return response.data
  },

  // Logout
  logout: async () => {
    const response = await authApi.post('/auth/logout')
    return response.data
  }
}

export default authApi