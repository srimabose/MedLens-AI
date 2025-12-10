import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import UploadPanel from './components/UploadPanel'
import ResultView from './components/ResultView'
import ChatPanel from './components/ChatPanel'
import Sidebar, { saveToHistory } from './components/Sidebar'
import HealthTrends from './pages/HealthTrends'
import MedicationChecker from './pages/MedicationChecker'
import DietPlanner from './pages/DietPlanner'
import SymptomChecker from './pages/SymptomChecker'
import Login from './components/Login'
import Register from './components/Register'
import OAuthCallback from './components/OAuthCallback'
import Loader from './components/Loader'
import Footer from './components/Footer'

function AppContent() {
  const [currentPage, setCurrentPage] = useState('upload')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [currentFilename, setCurrentFilename] = useState('')
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [authMode, setAuthMode] = useState('login') // 'login' or 'register'
  const [apiStatus, setApiStatus] = useState('checking') // 'checking', 'connected', 'error'
  const { user, loading, isAuthenticated } = useAuth()

  // Check API connection on mount
  useEffect(() => {
    const checkAPI = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'https://medlens-ai-aah4.onrender.com'
        const response = await fetch(`${API_URL}/health`)
        if (response.ok) {
          setApiStatus('connected')
          console.log('✅ API connection successful')
        } else {
          setApiStatus('error')
          console.error('❌ API health check failed:', response.status)
        }
      } catch (error) {
        setApiStatus('error')
        console.error('❌ API connection failed:', error)
      }
    }
    checkAPI()
  }, [])

  // Handle OAuth callbacks
  const urlParams = new URLSearchParams(window.location.search)
  const isGoogleCallback = window.location.pathname === '/auth/google/callback'
  const isFacebookCallback = window.location.pathname === '/auth/facebook/callback'

  if (isGoogleCallback) {
    return <OAuthCallback provider="google" />
  }

  if (isFacebookCallback) {
    return <OAuthCallback provider="facebook" />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center medical-pattern">
        <Loader message="Loading..." />
      </div>
    )
  }

  // Show auth screen if user clicks login/signup in guest mode
  const showAuthScreen = !isAuthenticated && (authMode === 'login' || authMode === 'register')
  
  if (showAuthScreen) {
    return (
      <div className="min-h-screen flex flex-col medical-pattern">
        <div className="flex-1 py-8 px-4">
          <header className="text-center text-white mb-12">
            <h1 className="text-5xl font-bold mb-3 drop-shadow-lg">🏥 MedLens AI</h1>
            <p className="text-xl opacity-90">Your Medical Report Explainer & Health Assistant</p>
          </header>

          <div className="mb-4 text-center">
            <button
              onClick={() => setAuthMode('guest')}
              className="text-white/70 hover:text-white text-sm underline"
            >
              ← Continue as Guest
            </button>
          </div>
          
          {authMode === 'login' ? (
            <Login onSwitchToRegister={() => setAuthMode('register')} />
          ) : (
            <Register onSwitchToLogin={() => setAuthMode('login')} />
          )}
        </div>
        <Footer />
      </div>
    )
  }

  const handleAnalysisComplete = (result, filename, language = 'en') => {
    setAnalysisResult(result)
    setCurrentFilename(filename)
    setCurrentLanguage(language)
    setCurrentPage('results')
    
    // Save to history
    saveToHistory(filename, result)
  }

  const handleStartChat = () => {
    setCurrentPage('chat')
  }

  const handleBackToUpload = () => {
    setCurrentPage('upload')
    setAnalysisResult(null)
    setCurrentFilename('')
  }

  const handleNewChat = () => {
    setCurrentPage('upload')
    setAnalysisResult(null)
    setCurrentFilename('')
  }

  const handleSelectHistory = (item) => {
    if (item.result?.type === 'health_trends' || item.type === 'health_trends') {
      // Handle trends analysis
      setCurrentPage('trends')
      // You could set the trends result in HealthTrends component if needed
    } else {
      // Handle regular medical report
      setAnalysisResult(item.result)
      setCurrentFilename(item.filename)
      setCurrentPage('results')
    }
  }

  // Authenticated user interface
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <Sidebar 
          onSelectHistory={handleSelectHistory}
          onNewChat={handleNewChat}
          currentPage={currentPage}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
        
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'} flex flex-col`}>
          <div className="flex-1 py-8 px-4 medical-pattern">
            {/* Header with Home Button and Feature Navigation */}
            <header className="text-center text-white mb-12 relative">
              {currentPage !== 'upload' && (
                <button
                  onClick={handleBackToUpload}
                  className="absolute left-0 top-16 z-10 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-lg"
                >
                  <span>←</span> Home
                </button>
              )}
              <h1 className="text-5xl font-bold mb-3 drop-shadow-lg">🏥 MedLens AI</h1>
              <p className="text-xl opacity-90">Your Medical Report Explainer & Health Assistant</p>
              
              {/* API Status Indicator */}
              {apiStatus === 'error' && (
                <div className="mt-4 bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-lg p-3 max-w-md mx-auto">
                  <p className="text-sm text-red-100">
                    ⚠️ <strong>Connection Issue:</strong> Unable to connect to backend API. 
                    Please check your internet connection.
                  </p>
                </div>
              )}
              
              {apiStatus === 'checking' && (
                <div className="mt-4 bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-lg p-3 max-w-md mx-auto">
                  <p className="text-sm text-blue-100">
                    🔄 <strong>Connecting:</strong> Checking backend API connection...
                  </p>
                </div>
              )}

              {!isAuthenticated && apiStatus === 'connected' && (
                <div className="mt-4 space-y-3">
                  <div className="bg-yellow-500/20 backdrop-blur-md border border-yellow-400/30 rounded-lg p-3 max-w-md mx-auto">
                    <p className="text-sm text-yellow-100">
                      🔓 <strong>Guest Mode:</strong> You can test all AI features without creating an account. 
                      Reports won't be saved to history.
                    </p>
                  </div>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setAuthMode('login')}
                      className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      🔑 Login
                    </button>
                    <button
                      onClick={() => setAuthMode('register')}
                      className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      📝 Sign Up
                    </button>
                  </div>
                </div>
              )}
              
              {/* Feature Navigation */}
              {currentPage === 'upload' && (
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => setCurrentPage('trends')}
                    className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                  >
                    📈 Health Trends
                  </button>
                  <button
                    onClick={() => setCurrentPage('medication')}
                    className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                  >
                    💊 Medication Checker
                  </button>
                  <button
                    onClick={() => setCurrentPage('diet')}
                    className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                  >
                    🥗 Diet Planner
                  </button>
                  <button
                    onClick={() => setCurrentPage('symptoms')}
                    className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                  >
                    🩺 Symptom Checker
                  </button>
                </div>
              )}
            </header>

            {currentPage === 'upload' && (
              <UploadPanel onAnalysisComplete={handleAnalysisComplete} />
            )}

            {currentPage === 'results' && (
              <ResultView 
                result={analysisResult}
                filename={currentFilename}
                initialLanguage={currentLanguage}
                onStartChat={handleStartChat}
                onBackToUpload={handleBackToUpload}
              />
            )}

            {currentPage === 'chat' && (
              <ChatPanel 
                context={analysisResult}
                initialLanguage={currentLanguage}
                onBack={() => setCurrentPage('results')}
                onHome={handleBackToUpload}
              />
            )}

            {currentPage === 'trends' && <HealthTrends onNavigate={setCurrentPage} />}
            {currentPage === 'medication' && <MedicationChecker onNavigate={setCurrentPage} />}
            {currentPage === 'diet' && <DietPlanner onNavigate={setCurrentPage} />}
            {currentPage === 'symptoms' && <SymptomChecker onNavigate={setCurrentPage} />}
          </div>
          <Footer />
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
