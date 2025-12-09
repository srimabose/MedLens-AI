import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from './auth.js'
import { simpleRegister, testRegistration, fileRegister } from './api.js'

function Register({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    console.log('🔄 Starting registration for:', formData.email)

    try {
      // Try file-based registration (no database required)
      const response = await fileRegister({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name
      })
      
      if (response.status === 'success') {
        console.log('✅ Registration successful:', response)
        login(response.user, response.access_token)
      } else {
        throw new Error(response.message || 'Registration failed')
      }
    } catch (error) {
      console.error('❌ Registration failed:', error)
      setError(error.response?.data?.message || error.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleTestRegistration = async () => {
    try {
      const testData = {
        email: formData.email || 'test@example.com',
        password: formData.password || 'testpass123',
        full_name: formData.full_name || 'Test User'
      }
      
      const response = await testRegistration(testData)
      console.log('🔍 Test result:', response)
      
      if (response.status === 'success') {
        setError(`✅ Test passed: ${response.message}`)
      } else {
        setError(`❌ Test failed: ${response.message}`)
      }
    } catch (error) {
      console.error('Test error:', error)
      setError(`❌ Test error: ${error.message}`)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const authUrl = await authAPI.getGoogleAuthUrl()
      window.location.href = authUrl
    } catch (error) {
      setError('Failed to initiate Google login')
    }
  }

  const handleFacebookLogin = async () => {
    try {
      const authUrl = await authAPI.getFacebookAuthUrl()
      window.location.href = authUrl
    } catch (error) {
      setError('Failed to initiate Facebook login')
    }
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
        <p className="text-gray-600">Join MedLens AI to get started</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            required
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Create a password"
            minLength="6"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            required
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Confirm your password"
            minLength="6"
          />
        </div>

        <div className="space-y-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-2 px-4 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
          
          <button
            type="button"
            onClick={handleTestRegistration}
            className="w-full bg-gray-500 text-white py-1 px-4 rounded-md hover:bg-gray-600 transition-colors text-sm"
          >
            🔍 Test Backend Connection
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={handleGoogleLogin}
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="ml-2">Google</span>
          </button>

          <button
            onClick={handleFacebookLogin}
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="ml-2">Facebook</span>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}

export default Register