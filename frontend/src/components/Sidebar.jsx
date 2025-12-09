import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getUserReports, deleteReport } from './api.js'
import UserProfile from './UserProfile'

function Sidebar({ onSelectHistory, onNewChat, currentPage, isOpen, setIsOpen }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    console.log('🔐 Authentication status:', isAuthenticated)
    if (isAuthenticated) {
      loadUserReports()
    } else {
      console.log('📱 Using localStorage for non-authenticated user')
      // Load from localStorage for non-authenticated users
      const savedHistory = localStorage.getItem('medlens_history')
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory))
      }
    }
  }, [currentPage, isAuthenticated])

  const loadUserReports = async () => {
    try {
      setLoading(true)
      console.log('📊 Loading user reports...')
      const response = await getUserReports()
      console.log('✅ Reports loaded:', response)
      const reports = response.reports.map(report => ({
        id: report._id,
        filename: report.filename,
        timestamp: report.upload_date,
        result: report.analysis_result,
        type: report.analysis_result?.type || 'medical_report'
      }))
      setHistory(reports)
    } catch (error) {
      console.error('❌ Failed to load user reports:', error)
      console.error('Error details:', error.response?.data)
      
      if (error.response?.status === 401) {
        console.log('🔐 User not authenticated, using localStorage')
      }
      
      // Fallback to localStorage
      const savedHistory = localStorage.getItem('medlens_history')
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory))
      }
    } finally {
      setLoading(false)
    }
  }

  const saveToHistory = (item) => {
    if (!isAuthenticated) {
      // For non-authenticated users, use localStorage
      const newHistory = [item, ...history].slice(0, 20)
      setHistory(newHistory)
      localStorage.setItem('medlens_history', JSON.stringify(newHistory))
    } else {
      // For authenticated users, reports are automatically saved to database
      // Just refresh the list
      loadUserReports()
    }
  }

  const handleDeleteReport = async (reportId, event) => {
    event.stopPropagation()
    if (confirm('Delete this report? This action cannot be undone.')) {
      try {
        if (isAuthenticated) {
          // Delete from database
          console.log('🗑️ Attempting to delete report from database:', reportId)
          await deleteReport(reportId)
          console.log('✅ Report deleted successfully from database')
          // Refresh the reports list
          loadUserReports()
        } else {
          // Delete from localStorage
          console.log('🗑️ Deleting report from localStorage:', reportId)
          const savedHistory = localStorage.getItem('medlens_history')
          if (savedHistory) {
            const historyArray = JSON.parse(savedHistory)
            const updatedHistory = historyArray.filter(item => item.id !== reportId)
            localStorage.setItem('medlens_history', JSON.stringify(updatedHistory))
            setHistory(updatedHistory)
            console.log('✅ Report deleted successfully from localStorage')
          }
        }
      } catch (error) {
        console.error('❌ Failed to delete report:', error)
        console.error('Error details:', error.response?.data)
        
        if (error.response?.status === 401) {
          alert('Please log in to delete reports from the database.')
        } else if (error.response?.status === 403) {
          alert('You are not authorized to delete this report.')
        } else {
          alert('Failed to delete report. Please try again.')
        }
      }
    }
  }

  const clearHistory = () => {
    if (isAuthenticated) {
      alert('To clear your history, please delete individual reports.')
      return
    }
    
    if (confirm('Clear all chat history?')) {
      setHistory([])
      localStorage.removeItem('medlens_history')
    }
  }

  return (
    <>
      {/* Toggle Button - Always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-4 z-50 bg-white/10 backdrop-blur-md text-white p-3 rounded-lg hover:bg-white/20 transition-all shadow-lg ${
          isOpen ? 'left-[17rem]' : 'left-4'
        }`}
        title={isOpen ? 'Hide sidebar' : 'Show sidebar'}
      >
        {isOpen ? '◀' : '☰'}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white/5 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-72`}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-3xl">🏥</span>
              MedLens AI
            </h2>
            <p className="text-sm text-gray-300 mt-1">Medical Report Assistant</p>
          </div>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg mb-4 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span>
            New Analysis
          </button>

          {/* History */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-300 uppercase">History</h3>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {loading ? (
              <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No history yet</p>
            ) : (
              <div className="space-y-2">
                {history.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="relative group"
                  >
                    <button
                      onClick={() => onSelectHistory(item)}
                      className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">
                          {item.type === 'health_trends' ? '📈' : '📄'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">
                            {item.filename || 'Medical Report'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </p>
                          {item.type === 'health_trends' && (
                            <p className="text-xs text-blue-300 mt-1">
                              Trends Analysis
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                    
                    {/* Delete button for authenticated users */}
                    {isAuthenticated && item.id && (
                      <button
                        onClick={(e) => handleDeleteReport(item.id, e)}
                        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/40 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete report"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <UserProfile />
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-gray-400 text-center">
              Powered by Gemini AI
            </p>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}
    </>
  )
}

export default Sidebar

// Export function to save to history
export const saveToHistory = (filename, result) => {
  const savedHistory = localStorage.getItem('medlens_history')
  const history = savedHistory ? JSON.parse(savedHistory) : []
  
  const newItem = {
    id: Date.now(),
    filename,
    timestamp: new Date().toISOString(),
    result
  }
  
  const newHistory = [newItem, ...history].slice(0, 20)
  localStorage.setItem('medlens_history', JSON.stringify(newHistory))
}
