import { createContext, useContext, useState, useEffect } from 'react'
import Cookies from 'js-cookie'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)

  useEffect(() => {
    // Check for existing token on mount
    const savedToken = Cookies.get('medlens_token')
    const savedUser = localStorage.getItem('medlens_user')
    
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    
    // Save to cookies and localStorage
    Cookies.set('medlens_token', authToken, { expires: 7 }) // 7 days
    localStorage.setItem('medlens_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    
    // Clear storage
    Cookies.remove('medlens_token')
    localStorage.removeItem('medlens_user')
  }

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}