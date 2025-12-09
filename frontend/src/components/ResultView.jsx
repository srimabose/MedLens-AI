import LanguageSelector, { LANGUAGES } from './LanguageSelector'
import { useState } from 'react'
import { translateReport } from './api.js'
import Loader from './Loader'

function ResultView({ result, filename, onStartChat, onBackToUpload, initialLanguage = 'en' }) {
  const [currentResult, setCurrentResult] = useState(result)
  const [language, setLanguage] = useState(initialLanguage)
  const [translating, setTranslating] = useState(false)

  const handleLanguageChange = async (newLanguage) => {
    if (newLanguage === language) return
    
    setTranslating(true)
    try {
      const translated = await translateReport(result, newLanguage)
      setCurrentResult(translated)
      setLanguage(newLanguage)
    } catch (error) {
      console.error('Translation failed:', error)
      alert('Failed to translate. Please try again.')
    } finally {
      setTranslating(false)
    }
  }

  const getRiskClass = (level) => {
    if (level === 'normal') return 'bg-green-100 text-green-800'
    if (level === 'caution') return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getRiskEmoji = (level) => {
    if (level === 'normal') return '🟢'
    if (level === 'caution') return '🟡'
    return '🔴'
  }

  const currentLang = LANGUAGES.find(l => l.code === language)

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">📊 Analysis Results</h2>
            {filename && (
              <p className="text-sm text-gray-500">File: {filename}</p>
            )}
          </div>
          <div className="w-64">
            <LanguageSelector 
              selectedLanguage={language}
              onLanguageChange={handleLanguageChange}
            />
            {currentLang && (
              <p className="text-xs text-gray-500 mt-1 text-center">
                {currentLang.flag} Showing in {currentLang.name}
              </p>
            )}
          </div>
        </div>
        {translating && <Loader message="Translating..." />}
      </div>
      
      {!translating && (
        <>
          {/* Patient-Friendly Explanation */}
          <div className="bg-green-50 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">What This Means For You</h3>
            <p className="text-gray-700 leading-relaxed">{currentResult.explanation}</p>
          </div>

          {/* Risk Flags & Alerts */}
          {currentResult.risk_flags && currentResult.risk_flags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">🚦 Risk Flags & Health Alerts</h3>
              <div className="space-y-3">
                {currentResult.risk_flags.map((flag, idx) => {
                  const levelColors = {
                    critical: 'bg-red-50 border-red-300',
                    caution: 'bg-yellow-50 border-yellow-300',
                    normal: 'bg-green-50 border-green-300'
                  }
                  const levelTextColors = {
                    critical: 'text-red-900',
                    caution: 'text-yellow-900',
                    normal: 'text-green-900'
                  }
                  return (
                    <div key={idx} className={`p-5 rounded-lg border-2 ${levelColors[flag.level] || levelColors.caution}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{getRiskEmoji(flag.level)}</span>
                        <div className="flex-1">
                          <h4 className={`font-bold text-lg mb-2 ${levelTextColors[flag.level] || levelTextColors.caution}`}>
                            {flag.category}
                          </h4>
                          <p className="text-gray-700 mb-2 leading-relaxed">{flag.message}</p>
                          {flag.parameters_affected && flag.parameters_affected.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-300">
                              <p className="text-sm font-semibold text-gray-600">Affected Parameters:</p>
                              <p className="text-sm text-gray-700">{flag.parameters_affected.join(', ')}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Lab Values with Explanations */}
          {currentResult.lab_values && currentResult.lab_values.length > 0 && (
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">🔬 Lab Results</h3>
              <div className="space-y-3">
                {currentResult.lab_values.map((lab, idx) => (
                  <div key={idx} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-800">{lab.name}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-2xl font-bold text-primary-600">{lab.value}</span>
                          {lab.range && (
                            <span className="text-sm text-gray-500">Normal: {lab.range}</span>
                          )}
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${getRiskClass(lab.status === 'normal' ? 'normal' : lab.status === 'high' || lab.status === 'low' ? 'caution' : 'normal')}`}>
                        {lab.status}
                      </span>
                    </div>
                    {lab.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          <strong>What this means:</strong> {lab.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medications */}
          {currentResult.medications && currentResult.medications.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">💊 Medications</h3>
              <ul className="space-y-2">
                {currentResult.medications.map((med, idx) => (
                  <li key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <strong className="text-gray-800">{med.name}</strong> - {med.dose} ({med.frequency})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Personalized Health Guidance */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">🎯 Personalized Health Guidance</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Diet Recommendations */}
              {currentResult.diet_recommendations && currentResult.diet_recommendations.length > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border border-green-200">
                  <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                    🥗 Diet Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {currentResult.diet_recommendations.map((diet, idx) => (
                      <li key={idx} className="text-gray-700 flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span>{diet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Lifestyle Changes */}
              {currentResult.lifestyle_recommendations && currentResult.lifestyle_recommendations.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    🏃 Lifestyle Changes
                  </h4>
                  <ul className="space-y-2">
                    {currentResult.lifestyle_recommendations.map((lifestyle, idx) => (
                      <li key={idx} className="text-gray-700 flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{lifestyle}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Follow-up Tests */}
              {currentResult.followup_tests && currentResult.followup_tests.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg border border-purple-200">
                  <h4 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    🔬 Follow-up Tests
                  </h4>
                  <ul className="space-y-2">
                    {currentResult.followup_tests.map((test, idx) => (
                      <li key={idx} className="text-gray-700 flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span>{test}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* General Recommendations */}
              {currentResult.general_recommendations && currentResult.general_recommendations.length > 0 && (
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-lg border border-orange-200">
                  <h4 className="text-lg font-semibold text-orange-800 mb-3 flex items-center gap-2">
                    💡 General Advice
                  </h4>
                  <ul className="space-y-2">
                    {currentResult.general_recommendations.map((rec, idx) => (
                      <li key={idx} className="text-gray-700 flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Questions for Doctor */}
          {currentResult.questions_for_doctor && currentResult.questions_for_doctor.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">❓ Questions to Ask Your Doctor</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {currentResult.questions_for_doctor.map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <div className="flex gap-4 justify-center mt-8">
        <button 
          className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-lg font-semibold hover:-translate-y-0.5 transition-transform"
          onClick={onStartChat}
        >
          💬 Ask MedLens Anything
        </button>
        <button 
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          onClick={onBackToUpload}
        >
          📊 Analyze Another Report
        </button>
      </div>
    </div>
  )
}

export default ResultView
