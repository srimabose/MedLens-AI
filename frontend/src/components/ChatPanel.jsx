import { useState, useEffect } from 'react'
import { chatWithAI } from './api.js'
import Loader from './Loader'
import VoiceChat from './VoiceChat'
import LanguageSelector from './LanguageSelector'

function ChatPanel({ context, onBack, onHome, initialLanguage = 'en' }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! I\'m MedLens AI. Ask me anything about your medical report.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState(initialLanguage)
  const [autoSpeak, setAutoSpeak] = useState(false)

  const voiceChat = VoiceChat({ 
    language, 
    onTranscript: (text) => {
      setInput(text)
    }
  })

  const handleSend = async (text = input) => {
    if (!text.trim()) return

    const userMessage = { role: 'user', text }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await chatWithAI(text, context)
      const aiMessage = { role: 'ai', text: response.response }
      setMessages(prev => [...prev, aiMessage])
      
      // Auto-speak response if enabled
      if (autoSpeak && voiceChat.isSupported) {
        setTimeout(() => voiceChat.speak(response.response), 100)
      }
    } catch (error) {
      console.error('Chat failed:', error)
      const errorMessage = { role: 'ai', text: 'Sorry, I encountered an error. Please try again.' }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleVoiceInput = () => {
    if (voiceChat.isListening) {
      voiceChat.stopListening()
    } else {
      voiceChat.startListening()
    }
  }

  const handleSpeakMessage = (text) => {
    if (voiceChat.isSpeaking) {
      voiceChat.stopSpeaking()
    } else {
      voiceChat.speak(text)
    }
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-gray-800">💬 Ask MedLens Anything</h2>
          <div className="flex gap-2">
            <button 
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              onClick={onBack}
            >
              ← Back to Results
            </button>
          </div>
        </div>

        {/* Voice Controls */}
        <div className="flex items-center justify-between gap-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
          <div className="flex-1">
            <LanguageSelector 
              selectedLanguage={language}
              onLanguageChange={setLanguage}
            />
          </div>
          
          {voiceChat.isSupported && (
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSpeak}
                  onChange={(e) => setAutoSpeak(e.target.checked)}
                  className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                />
                <span>🔊 Auto-speak responses</span>
              </label>
            </div>
          )}
        </div>

        {!voiceChat.isSupported && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Voice features are not supported in your browser. Try Chrome, Edge, or Safari.
            </p>
          </div>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto mb-6 space-y-3">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`p-4 rounded-lg relative group ${
              msg.role === 'user' 
                ? 'bg-blue-100 text-right ml-12' 
                : 'bg-gray-100 mr-12'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <strong className="text-sm text-gray-600">
                  {msg.role === 'user' ? 'You' : 'MedLens AI'}
                </strong>
                <p className="mt-1 text-gray-800">{msg.text}</p>
              </div>
              
              {/* Voice button for AI messages */}
              {msg.role === 'ai' && voiceChat.isSupported && (
                <button
                  onClick={() => handleSpeakMessage(msg.text)}
                  className={`opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-white/50 ${
                    voiceChat.isSpeaking ? 'opacity-100 animate-pulse' : ''
                  }`}
                  title={voiceChat.isSpeaking ? 'Stop speaking' : 'Speak this message'}
                >
                  {voiceChat.isSpeaking ? '🔇' : '🔊'}
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="bg-gray-100 p-4 rounded-lg mr-12">
            <em className="text-gray-600">MedLens is thinking...</em>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder={voiceChat.isListening ? "Listening..." : "Ask about your report or click mic to speak..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
          className={`flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary-500 ${
            voiceChat.isListening ? 'border-red-400 bg-red-50' : 'border-gray-300'
          }`}
          disabled={voiceChat.isListening}
        />
        
        {/* Voice Input Button */}
        {voiceChat.isSupported && (
          <button
            onClick={handleVoiceInput}
            className={`px-4 py-3 rounded-lg font-semibold transition-all ${
              voiceChat.isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            title={voiceChat.isListening ? 'Stop listening' : 'Start voice input'}
          >
            {voiceChat.isListening ? '🎤 Listening...' : '🎤'}
          </button>
        )}
        
        <button 
          className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-lg font-semibold hover:-translate-y-0.5 transition-transform disabled:opacity-60"
          onClick={() => handleSend()} 
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </div>

      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>💡 Tips:</strong> 
          {voiceChat.isSupported && ' Click the microphone to speak your question •'}
          {' '}Enable auto-speak to hear responses • 
          {' '}Change language for voice in your preferred language
        </p>
      </div>
    </div>
  )
}

export default ChatPanel
