import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('medlens_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const analyzeReport = async (file, language = 'en') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('language', language)
  
  const response = await api.post('/analyze-report', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  
  return response.data
}

export const analyzeReportNoAuth = async (file, language = 'en') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('language', language)
  
  const response = await api.post('/analyze-report-no-auth', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  
  return response.data
}

export const chatWithAI = async (message, context = null) => {
  const response = await api.post('/chat', { message, context })
  return response.data
}

export const translateReport = async (result, targetLanguage) => {
  const response = await api.post('/translate-report', { 
    result, 
    target_language: targetLanguage 
  })
  return response.data
}

export const checkMedicationInteractions = async (medications) => {
  const response = await api.post('/check-medication-interactions', { medications })
  return response.data
}

export const generateDietPlan = async (params) => {
  const response = await api.post('/generate-diet-plan', params)
  return response.data
}

export const analyzeHealthTrends = async (files, language = 'en') => {
  const formData = new FormData()
  files.forEach((file, index) => {
    formData.append(`files`, file)
  })
  formData.append('language', language)
  
  const response = await api.post('/analyze-health-trends', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const checkSymptoms = async (params) => {
  const response = await api.post('/check-symptoms', params)
  return response.data
}

export const getUserReports = async () => {
  const response = await api.get('/reports')
  return response.data
}

export const deleteReport = async (reportId) => {
  const response = await api.delete(`/reports/${reportId}`)
  return response.data
}
