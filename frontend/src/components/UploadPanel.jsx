import { useState } from 'react'
import { analyzeReport } from '../lib/index.js'
import Loader from './Loader'
import LanguageSelector from './LanguageSelector'

function UploadPanel({ onAnalysisComplete }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [language, setLanguage] = useState('en')

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && (selectedFile.type.includes('pdf') || selectedFile.type.includes('image'))) {
      setFile(selectedFile)
    } else {
      alert('Please upload a PDF or image file')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    handleFileSelect(droppedFile)
  }

  const handleAnalyze = async () => {
    if (!file) return

    setLoading(true)
    try {
      const result = await analyzeReport(file, language)
      onAnalysisComplete(result, file.name, language)
    } catch (error) {
      console.error('Analysis failed:', error)
      
      // Check for rate limit error
      if (error.response?.status === 429 || error.response?.data?.detail?.includes('rate limit')) {
        alert('⏱️ API Rate Limit Reached\n\nYou\'ve exceeded the free tier limit of 20 requests per day. Please wait a moment and try again.\n\nTip: The limit resets every 24 hours.')
      } else {
        alert('Failed to analyze report. Please try again.\n\nError: ' + (error.response?.data?.detail || error.message))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Medical Report Analysis</h2>
      <p className="text-gray-600 mb-6">
        Upload lab results, prescriptions, X-rays, or discharge summaries for AI-powered analysis
      </p>

      <div
        className={`border-3 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all ${
          dragging 
            ? 'border-primary-500 bg-green-50' 
            : 'border-primary-400 hover:bg-green-50/50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files[0])}
        />
        {file ? (
          <div>
            <p className="text-5xl mb-3">📄</p>
            <p className="font-semibold text-gray-800">{file.name}</p>
            <p className="text-gray-500 text-sm mt-1">{(file.size / 1024).toFixed(2)} KB</p>
          </div>
        ) : (
          <div>
            <p className="text-6xl mb-3">📤</p>
            <p className="text-lg font-medium text-gray-700">Drag & drop your medical report here</p>
            <p className="text-gray-500 mt-2">or click to browse</p>
          </div>
        )}
      </div>

      {file && !loading && (
        <div className="mt-6">
          <LanguageSelector 
            selectedLanguage={language}
            onLanguageChange={setLanguage}
          />
          <p className="text-sm text-gray-600 mt-2 text-center">
            The analysis will be provided in your selected language
          </p>
        </div>
      )}

      {file && (
        <div className="text-center mt-6">
          <button 
            className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-3 rounded-lg font-semibold hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleAnalyze} 
            disabled={loading}
          >
            {loading ? 'Analyzing...' : 'Analyze Report'}
          </button>
        </div>
      )}

      {loading && <Loader message="AI is analyzing your report..." />}

      <div className="mt-6">
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Supported:</strong> PDFs, Images (JPEG, PNG) • <strong>Languages:</strong> 16+ languages including English, Hindi, Spanish, Chinese, Arabic, and more
          </p>
        </div>
      </div>
    </div>
  )
}

export default UploadPanel
