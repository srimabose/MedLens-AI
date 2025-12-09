import { useState } from 'react'
import { analyzeHealthTrends } from '../lib/api.js'
import { saveToHistory } from '../components/Sidebar'
import Loader from '../components/Loader'
import LanguageSelector from '../components/LanguageSelector'
import FeatureNavigation from '../components/FeatureNavigation'

function HealthTrends({ onNavigate }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [trends, setTrends] = useState(null)
  const [language, setLanguage] = useState('en')

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    const remainingSlots = 10 - files.length
    const newFiles = selectedFiles.slice(0, remainingSlots)
    
    if (selectedFiles.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more file(s). Maximum is 10 files.`)
    }
    
    setFiles([...files, ...newFiles])
  }

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove))
  }

  const handleAnalyze = async () => {
    if (files.length < 2) {
      alert('Please upload at least 2 reports to analyze trends')
      return
    }

    setLoading(true)
    try {
      const result = await analyzeHealthTrends(files, language)
      setTrends(result)
      
      // Save to history
      const trendsFilename = `Health Trends Analysis - ${files.length} Reports`
      saveToHistory(trendsFilename, {
        ...result,
        type: 'health_trends'
      })
    } catch (error) {
      console.error('Trend analysis failed:', error)
      
      // Check for rate limit error
      if (error.response?.status === 429 || error.response?.data?.detail?.includes('rate limit')) {
        alert('⏱️ API Rate Limit Reached\n\nYou\'ve exceeded the free tier limit of 20 requests per day. Please wait a moment and try again.\n\nNote: Analyzing multiple reports uses multiple API calls. The limit resets every 24 hours.')
      } else {
        alert('Failed to analyze trends. Please try again.\n\nError: ' + (error.response?.data?.detail || error.message))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <FeatureNavigation currentPage="trends" onNavigate={onNavigate} />
      
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">📈 Health Trend Detector</h2>
        <p className="text-gray-600 mb-6">
          Upload 2-10 previous reports to track your health trends over time
        </p>

      {!trends && (
        <>
          <div className="border-3 border-dashed border-primary-400 rounded-xl p-8 text-center mb-6">
            <input
              type="file"
              multiple
              accept=".pdf,image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="trend-files"
            />
            <label htmlFor="trend-files" className="cursor-pointer">
              <p className="text-5xl mb-3">📊</p>
              <p className="text-lg font-medium text-gray-700">
                {files.length === 0 ? 'Click to upload multiple reports' : 'Click to add more reports'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {files.length > 0 ? `${files.length} of 10 files selected` : 'Select 2-10 reports'}
              </p>
            </label>
          </div>

          {files.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Selected Reports:</h3>
                {files.length < 10 && (
                  <label htmlFor="trend-files" className="cursor-pointer text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
                    <span>+ Add More Files</span>
                  </label>
                )}
              </div>
              <div className="space-y-2">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                    <span className="text-2xl">📄</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {files.length >= 2 && (
            <div className="mb-6">
              <LanguageSelector 
                selectedLanguage={language}
                onLanguageChange={setLanguage}
              />
            </div>
          )}

          {files.length >= 2 && (
            <div className="text-center">
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-3 rounded-lg font-semibold hover:-translate-y-0.5 transition-transform disabled:opacity-60"
              >
                {loading ? 'Analyzing Trends...' : 'Analyze Health Trends'}
              </button>
            </div>
          )}

          {loading && <Loader message="Analyzing your health trends across multiple reports..." />}
        </>
      )}

      {trends && (
        <div className="space-y-6">
          {/* Overall Summary */}
          {trends.overall_summary && (
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg border-2 border-indigo-200">
              <h3 className="text-2xl font-bold text-indigo-900 mb-3">📋 Overall Health Summary</h3>
              {trends.time_span && (
                <p className="text-sm text-indigo-700 mb-3">
                  Analysis Period: {trends.time_span} {trends.most_recent_date && `(Most Recent: ${trends.most_recent_date})`}
                </p>
              )}
              <p className="text-gray-800 leading-relaxed">{trends.overall_summary}</p>
            </div>
          )}

          {/* Risk Flags & Alerts */}
          {trends.risk_flags && trends.risk_flags.length > 0 && (
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🚦 Risk Flags & Alerts</h3>
              <div className="space-y-3">
                {trends.risk_flags.map((flag, idx) => {
                  const levelColors = {
                    critical: 'bg-red-50 border-red-300 text-red-900',
                    caution: 'bg-yellow-50 border-yellow-300 text-yellow-900',
                    normal: 'bg-green-50 border-green-300 text-green-900'
                  }
                  const levelIcons = {
                    critical: '🔴',
                    caution: '🟡',
                    normal: '🟢'
                  }
                  return (
                    <div key={idx} className={`p-4 rounded-lg border-2 ${levelColors[flag.level] || levelColors.caution}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{levelIcons[flag.level] || '🟡'}</span>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-1">{flag.category}</h4>
                          <p className="mb-2">{flag.message}</p>
                          {flag.parameters_affected && flag.parameters_affected.length > 0 && (
                            <p className="text-sm opacity-75">
                              Affected: {flag.parameters_affected.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Timeline with Patient-Friendly Explanations */}
          {trends.timeline && trends.timeline.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-blue-900 mb-4">📅 Health Parameter Timeline</h3>
              <div className="space-y-4">
                {trends.timeline.map((item, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-lg text-gray-800">
                        {item.parameter} {item.unit && `(${item.unit})`}
                      </h4>
                      {item.concern_level && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          item.concern_level === 'critical' ? 'bg-red-100 text-red-700' :
                          item.concern_level === 'caution' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {item.trend}
                        </span>
                      )}
                    </div>
                    
                    {/* Values with dates */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {Array.isArray(item.values) ? (
                        item.values.map((val, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <div className="text-center">
                              {val.date && <p className="text-xs text-gray-500">{val.date}</p>}
                              <span className={`font-semibold ${
                                val.status === 'high' || val.status === 'low' ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {val.value || val}
                              </span>
                            </div>
                            {i < item.values.length - 1 && <span className="text-gray-400">→</span>}
                          </div>
                        ))
                      ) : (
                        <span className="text-sm">{item.values}</span>
                      )}
                    </div>
                    
                    {/* Patient-friendly explanation */}
                    {item.explanation && (
                      <div className="bg-blue-50 p-3 rounded-lg mt-3">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          <strong>What this means:</strong> {item.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patterns */}
          {trends.patterns && trends.patterns.length > 0 && (
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-purple-900 mb-4">🔍 Detected Patterns</h3>
              <ul className="space-y-3">
                {trends.patterns.map((pattern, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-white p-4 rounded-lg">
                    <span className="text-2xl">{pattern.type === 'warning' ? '⚠️' : pattern.type === 'improvement' ? '✅' : '📊'}</span>
                    <p className="text-gray-700">{pattern.message}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Personalized Health Guidance */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Diet Recommendations */}
            {trends.diet_recommendations && trends.diet_recommendations.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg">
                <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
                  <span>🥗</span> Diet Recommendations
                </h3>
                <ul className="space-y-2">
                  {trends.diet_recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Lifestyle Changes */}
            {trends.lifestyle_recommendations && trends.lifestyle_recommendations.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg">
                <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <span>🏃</span> Lifestyle Changes
                </h3>
                <ul className="space-y-2">
                  {trends.lifestyle_recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Follow-up Tests */}
            {trends.followup_tests && trends.followup_tests.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg">
                <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
                  <span>🔬</span> Follow-up Tests
                </h3>
                <ul className="space-y-2">
                  {trends.followup_tests.map((test, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-purple-600 mt-0.5">•</span>
                      <span className="text-gray-700">{test}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Questions for Doctor */}
            {trends.questions_for_doctor && trends.questions_for_doctor.length > 0 && (
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-lg">
                <h3 className="text-lg font-bold text-orange-900 mb-3 flex items-center gap-2">
                  <span>❓</span> Questions for Doctor
                </h3>
                <ul className="space-y-2">
                  {trends.questions_for_doctor.map((question, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-orange-600 mt-0.5">•</span>
                      <span className="text-gray-700">{question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="text-center">
            <button
              onClick={() => { setTrends(null); setFiles([]) }}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Analyze New Reports
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default HealthTrends
