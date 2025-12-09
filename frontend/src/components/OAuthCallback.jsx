import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from '../lib/auth.js'
import Loader from './Loader'

function OAuthCallback({ provider }) {
  const [error, setError] = useState('')
  const { login } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const errorParam = urlParams.get('error')

        if (errorParam) {
          setError(`${provider} authentication was cancelled or failed`)
          return
        }

        if (!code) {
          setError('No authorization code received')
          return
        }

        let response
        if (provider === 'google') {
          response = await authAPI.googleCallback(code)
        } else if (provider === 'facebook') {
          response = await authAPI.facebookCallback(code)
        }

        if (response) {
          login(response.user, response.access_token)
          // Redirect will happen automatically due to auth state change
        }
      } catch (error) {
        console.error('OAuth callback error:', error)
        setError(error.response?.data?.detail || `${provider} authentication failed`)
      }
    }

    handleCallback()
  }, [provider, login])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center medical-pattern">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-md mx-auto text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center medical-pattern">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-md mx-auto text-center">
        <Loader message={`Completing ${provider} authentication...`} />
        <p className="text-gray-600 mt-4">Please wait while we sign you in</p>
      </div>
    </div>
  )
}

export default OAuthCallback