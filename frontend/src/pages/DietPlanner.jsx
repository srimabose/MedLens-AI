import { useState } from 'react'
import { generateDietPlan } from '../components/api.js'
import Loader from '../components/Loader'
import LanguageSelector from '../components/LanguageSelector'
import FeatureNavigation from '../components/FeatureNavigation'

function DietPlanner({ onNavigate }) {
  const [healthConditions, setHealthConditions] = useState([])
  const [customCondition, setCustomCondition] = useState('')
  const [dietType, setDietType] = useState('balanced')
  const [cuisine, setCuisine] = useState('indian')
  const [loading, setLoading] = useState(false)
  const [dietPlan, setDietPlan] = useState(null)
  const [language, setLanguage] = useState('en')

  const predefinedConditions = [
    'Low Hemoglobin', 'High Cholesterol', 'Diabetes', 'High Blood Pressure',
    'Thyroid Issues', 'Kidney Problems', 'Liver Issues', 'Vitamin D Deficiency'
  ]

  const toggleCondition = (condition) => {
    if (healthConditions.includes(condition)) {
      setHealthConditions(healthConditions.filter(c => c !== condition))
    } else {
      setHealthConditions([...healthConditions, condition])
    }
  }

  const addCustomCondition = () => {
    if (customCondition.trim() && !healthConditions.includes(customCondition.trim())) {
      setHealthConditions([...healthConditions, customCondition.trim()])
      setCustomCondition('')
    }
  }

  const removeCondition = (condition) => {
    setHealthConditions(healthConditions.filter(c => c !== condition))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addCustomCondition()
    }
  }

  const handleGenerate = async () => {
    if (healthConditions.length === 0) {
      alert('Please select at least one health condition')
      return
    }

    setLoading(true)
    try {
      const result = await generateDietPlan({
        conditions: healthConditions,
        dietType,
        cuisine,
        language
      })
      setDietPlan(result)
    } catch (error) {
      console.error('Diet plan generation failed:', error)
      alert('Failed to generate diet plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <FeatureNavigation currentPage="diet" onNavigate={onNavigate} />
      
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🥗 Personalized Diet Planner</h2>
        <p className="text-gray-600 mb-6">
          Get a customized meal plan based on your health conditions
        </p>

      {!dietPlan && (
        <>
          {/* Health Conditions */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Health Conditions:</h3>
            
            {/* Predefined Conditions */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Select from common conditions:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {predefinedConditions.map((condition) => (
                  <button
                    key={condition}
                    onClick={() => toggleCondition(condition)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      healthConditions.includes(condition)
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-primary-400'
                    }`}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Condition Input */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Or add your own condition:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customCondition}
                  onChange={(e) => setCustomCondition(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your health condition (e.g., PCOS, Arthritis, Food Allergies)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  onClick={addCustomCondition}
                  disabled={!customCondition.trim()}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Selected Conditions Display */}
            {healthConditions.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Selected conditions:</p>
                <div className="flex flex-wrap gap-2">
                  {healthConditions.map((condition) => (
                    <span
                      key={condition}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                    >
                      {condition}
                      <button
                        onClick={() => removeCondition(condition)}
                        className="text-primary-600 hover:text-primary-800 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Diet Type */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Diet Preference:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Balanced', 'Vegetarian', 'Vegan', 'Low Carb', 'High Protein', 'Keto'].map((type) => (
                <button
                  key={type}
                  onClick={() => setDietType(type.toLowerCase().replace(' ', '_'))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    dietType === type.toLowerCase().replace(' ', '_')
                      ? 'bg-secondary-500 border-secondary-500 text-white'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-secondary-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Cuisine */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Cuisine Type:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Indian', 'Bengali', 'South Indian', 'Western', 'Mediterranean', 'Asian'].map((type) => (
                <button
                  key={type}
                  onClick={() => setCuisine(type.toLowerCase().replace(' ', '_'))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    cuisine === type.toLowerCase().replace(' ', '_')
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-green-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="mb-6">
            <LanguageSelector 
              selectedLanguage={language}
              onLanguageChange={setLanguage}
            />
          </div>

          <div className="text-center">
            <button
              onClick={handleGenerate}
              disabled={loading || healthConditions.length === 0}
              className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-3 rounded-lg font-semibold hover:-translate-y-0.5 transition-transform disabled:opacity-60"
            >
              Generate Diet Plan
            </button>
          </div>

          {loading && <Loader message="Creating your personalized diet plan..." />}
        </>
      )}

      {dietPlan && (
        <div className="space-y-6">
          {/* 7-Day Meal Plan */}
          {dietPlan.meal_plan && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <h3 className="text-2xl font-bold text-green-900 mb-4">📅 7-Day Meal Plan</h3>
              <div className="space-y-4">
                {dietPlan.meal_plan.map((day, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-lg">
                    <h4 className="font-bold text-lg text-gray-800 mb-3">{day.day}</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="font-semibold text-sm text-gray-600">Breakfast</p>
                        <p className="text-gray-800">{day.breakfast}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-600">Lunch</p>
                        <p className="text-gray-800">{day.lunch}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-600">Dinner</p>
                        <p className="text-gray-800">{day.dinner}</p>
                      </div>
                    </div>
                    {day.snacks && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="font-semibold text-sm text-gray-600">Snacks</p>
                        <p className="text-gray-800">{day.snacks}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nutritional Guidelines */}
          {dietPlan.guidelines && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-blue-900 mb-4">📋 Nutritional Guidelines</h3>
              <ul className="space-y-2">
                {dietPlan.guidelines.map((guideline, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-gray-700">{guideline}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Foods to Avoid */}
          {dietPlan.avoid && dietPlan.avoid.length > 0 && (
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-red-900 mb-4">🚫 Foods to Avoid</h3>
              <div className="flex flex-wrap gap-2">
                {dietPlan.avoid.map((food, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white rounded-full text-sm text-red-700">
                    {food}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => { setDietPlan(null); setHealthConditions([]) }}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Create New Plan
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default DietPlanner
