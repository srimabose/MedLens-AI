function FeatureNavigation({ currentPage, onNavigate }) {
  const features = [
    { id: 'upload', label: '📊 Report Analysis', icon: '📊' },
    { id: 'trends', label: '📈 Health Trends', icon: '📈' },
    { id: 'medication', label: '💊 Medication Checker', icon: '💊' },
    { id: 'diet', label: '🥗 Diet Planner', icon: '🥗' },
    { id: 'symptoms', label: '🩺 Symptom Checker', icon: '🩺' }
  ]

  return (
    <div className="mb-6 p-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md">
      <p className="text-sm text-gray-600 mb-3 font-semibold">Quick Navigation:</p>
      <div className="flex flex-wrap gap-2">
        {features.map((feature) => (
          feature.id !== currentPage && (
            <button
              key={feature.id}
              onClick={() => onNavigate(feature.id)}
              className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5 shadow-sm"
            >
              {feature.label}
            </button>
          )
        ))}
      </div>
    </div>
  )
}

export default FeatureNavigation
