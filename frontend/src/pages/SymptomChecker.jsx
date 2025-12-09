import { useState } from 'react'
import { checkSymptoms } from '../lib/index.js'
import Loader from '../components/Loader'
import LanguageSelector from '../components/LanguageSelector'
import FeatureNavigation from '../components/FeatureNavigation'

function SymptomChecker({ onNavigate }) {
  const [symptoms, setSymptoms] = useState('')
  const [reportId, setReportId] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [language, setLanguage] = useState('en')

  const handleCheck = async () => {
    if (!symptoms.trim()) {
      alert('Please describe your symptoms')
      return
    }

    setLoading(true)
    try {
      const result = await checkSymptoms({
        symptoms,
        reportId: reportId || null,
        language
      })
      setResults(result)
    } catch (error) {
      console.error('Symptom check failed:', error)
      alert('Failed to check symptoms. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <FeatureNavigation currentPage="symptoms" onNavigate={onNavigate} />
      
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🩺 Symptom Checker</h2>
        <p className="text-gray-600 mb-6">
          Describe your symptoms and get insights based on your medical reports
        </p>

      {!results && (
        <>
          <div className="mb-6">
            <label className="block font-semibold text-gray-800 mb-2">
              Describe Your Symptoms:
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="E.g., I feel dizzy and tired, especially in the morning..."
              rows={5}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="mb-6">
            <label className="block font-semibold text-gray-800 mb-2">
              Report ID (Optional):
            </label>
            <input
              type="text"
              value={reportId}
              onChange={(e) => setReportId(e.target.value)}
              placeholder="Enter report ID to cross-check with your lab results"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave empty for general symptom analysis
            </p>
          </div>

          <div className="mb-6">
            <LanguageSelector 
              selectedLanguage={language}
              onLanguageChange={setLanguage}
            />
          </div>

          <div className="text-center">
            <button
              onClick={handleCheck}
              disabled={loading || !symptoms.trim()}
              className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-3 rounded-lg font-semibold hover:-translate-y-0.5 transition-transform disabled:opacity-60"
            >
              Analyze Symptoms
            </button>
          </div>

          {loading && <Loader message="Analyzing your symptoms..." />}
        </>
      )}

      {results && (
        <div className="space-y-6">
          {/* Possible Causes */}
          {results.possible_causes && results.possible_causes.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-blue-900 mb-4">🔍 Possible Causes</h3>
              <ul className="space-y-3">
                {results.possible_causes.map((cause, idx) => (
                  <li key={idx} className="bg-white p-4 rounded-lg">
                    <p className="font-semibold text-gray-800">{cause.condition}</p>
                    <p className="text-sm text-gray-600 mt-1">{cause.explanation}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Report Correlation */}
          {results.report_correlation && (
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-purple-900 mb-4">📊 Report Correlation</h3>
              <p className="text-gray-700 leading-relaxed">{results.report_correlation}</p>
            </div>
          )}

          {/* Recommendations */}
          {results.recommendations && results.recommendations.length > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-green-900 mb-4">💡 What You Should Do</h3>
              <ul className="space-y-2">
                {results.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warning */}
          {results.urgency === 'high' && (
            <div className="bg-red-50 border-2 border-red-300 p-5 rounded-lg">
              <p className="text-red-800 font-semibold flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                Seek immediate medical attention
              </p>
            </div>
          )}

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Disclaimer:</strong> This is not a medical diagnosis. Always consult a healthcare professional for proper evaluation.
            </p>
          </div>

          <div className="text-center">
            <button
              onClick={() => { setResults(null); setSymptoms(''); setReportId('') }}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Check New Symptoms
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default SymptomChecker
