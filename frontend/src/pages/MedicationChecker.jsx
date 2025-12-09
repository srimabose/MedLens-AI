import { useState } from 'react'
import { checkMedicationInteractions } from '../components/api.js'
import Loader from '../components/Loader'
import FeatureNavigation from '../components/FeatureNavigation'

function MedicationChecker({ onNavigate }) {
  const [medications, setMedications] = useState([''])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const commonMedications = [
    'Metformin 500mg', 'Aspirin 75mg', 'Atorvastatin 20mg', 'Lisinopril 10mg',
    'Amlodipine 5mg', 'Levothyroxine 50mcg', 'Omeprazole 20mg', 'Paracetamol 500mg',
    'Ibuprofen 400mg', 'Vitamin D3 1000IU', 'Calcium 500mg', 'Iron 65mg'
  ]

  const addMedication = () => {
    setMedications([...medications, ''])
  }

  const updateMedication = (index, value) => {
    const updated = [...medications]
    updated[index] = value
    setMedications(updated)
  }

  const removeMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index))
  }

  const handleCheck = async () => {
    const validMeds = medications.filter(m => m.trim())
    if (validMeds.length < 2) {
      alert('Please enter at least 2 medications')
      return
    }

    setLoading(true)
    try {
      const result = await checkMedicationInteractions(validMeds)
      setResults(result)
    } catch (error) {
      console.error('Interaction check failed:', error)
      alert('Failed to check interactions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityClass = (severity) => {
    if (severity === 'high') return 'bg-red-100 border-red-300 text-red-800'
    if (severity === 'moderate') return 'bg-yellow-100 border-yellow-300 text-yellow-800'
    return 'bg-blue-100 border-blue-300 text-blue-800'
  }

  return (
    <div className="max-w-4xl mx-auto">
      <FeatureNavigation currentPage="medication" onNavigate={onNavigate} />
      
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">💊 Medication Interaction Checker</h2>
        <p className="text-gray-600 mb-6">
          Check for potential interactions between your medications
        </p>

      {!results && (
        <>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Enter Your Medications:</h3>
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="text-sm text-primary-600 hover:text-primary-800 underline"
              >
                {showSuggestions ? 'Hide' : 'Show'} Common Medications
              </button>
            </div>

            {showSuggestions && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Click to add common medications:</p>
                <div className="flex flex-wrap gap-2">
                  {commonMedications.map((med) => (
                    <button
                      key={med}
                      onClick={() => {
                        const emptyIndex = medications.findIndex(m => !m.trim())
                        if (emptyIndex !== -1) {
                          updateMedication(emptyIndex, med)
                        } else {
                          setMedications([...medications, med])
                        }
                      }}
                      className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm hover:bg-primary-50 hover:border-primary-300 transition-colors"
                    >
                      {med}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {medications.map((med, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={med}
                    onChange={(e) => updateMedication(index, e.target.value)}
                    placeholder={`Medication ${index + 1} (include name and dosage, e.g., Metformin 500mg)`}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                  {medications.length > 1 && (
                    <button
                      onClick={() => removeMedication(index)}
                      className="px-4 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <p className="text-sm text-gray-500 mt-2">
              💡 Tip: Include both brand names and generic names for better accuracy (e.g., "Crocin/Paracetamol 500mg")
            </p>
          </div>

          <div className="flex gap-4 justify-center mb-6">
            <button
              onClick={addMedication}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              + Add Medication
            </button>
            <button
              onClick={handleCheck}
              disabled={loading || medications.filter(m => m.trim()).length < 2}
              className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-3 rounded-lg font-semibold hover:-translate-y-0.5 transition-transform disabled:opacity-60"
            >
              Check Interactions
            </button>
          </div>

          {loading && <Loader message="Checking medication interactions..." />}

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Disclaimer:</strong> This tool provides general information only. Always consult your doctor or pharmacist before making any changes to your medications.
            </p>
          </div>
        </>
      )}

      {results && (
        <div className="space-y-6">
          {/* Interactions */}
          {results.interactions && results.interactions.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">⚠️ Potential Interactions Found</h3>
              <div className="space-y-4">
                {results.interactions.map((interaction, idx) => (
                  <div key={idx} className={`p-5 rounded-lg border-2 ${getSeverityClass(interaction.severity)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-lg">
                        {interaction.medications.join(' + ')}
                      </h4>
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase">
                        {interaction.severity} Risk
                      </span>
                    </div>
                    <p className="mb-3">{interaction.description}</p>
                    {interaction.recommendation && (
                      <div className="bg-white/50 p-3 rounded">
                        <p className="text-sm font-semibold">Recommendation:</p>
                        <p className="text-sm">{interaction.recommendation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Interactions */}
          {(!results.interactions || results.interactions.length === 0) && (
            <div className="bg-green-50 border-2 border-green-300 p-6 rounded-lg text-center">
              <p className="text-2xl mb-2">✅</p>
              <p className="text-green-800 font-semibold">No major interactions detected</p>
              <p className="text-sm text-green-700 mt-2">
                However, always inform your doctor about all medications you're taking
              </p>
            </div>
          )}

          {/* General Advice */}
          {results.general_advice && results.general_advice.length > 0 && (
            <div className="bg-blue-50 p-5 rounded-lg">
              <h3 className="text-lg font-bold text-blue-900 mb-3">💡 General Advice</h3>
              <ul className="space-y-2">
                {results.general_advice.map((advice, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-gray-700">{advice}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => { setResults(null); setMedications(['']) }}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Check New Medications
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default MedicationChecker
