import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Loader2, Mic, MicOff, Save, Download, Trash2 } from 'lucide-react'
import { useData } from '../context/DataContext'
import { getTodayKey } from '../utils/helpers'

const SUGGESTED_QUESTIONS = [
  { emoji: '🚽', text: 'How is potty training progress?', category: 'potty' },
  { emoji: '😴', text: 'Analyze sleep patterns', category: 'sleep' },
  { emoji: '🍽️', text: 'Is eating schedule consistent?', category: 'meals' },
  { emoji: '📈', text: 'Show weekly trends', category: 'trends' },
  { emoji: '💡', text: 'Any training recommendations?', category: 'advice' },
]

export default function DashboardChat() {
  const { puppy, updateNotes } = useData()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState('all')
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
      }
      
      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
      
      recognitionRef.current = recognition
    }
  }, [])

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in your browser')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (error) {
        console.error('Voice input error:', error)
        setIsListening(false)
      }
    }
  }

  const handleSend = async (messageText = input) => {
    if (!messageText.trim() || loading) return

    const userMessage = { role: 'user', content: messageText }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            message: messageText,
            dateRange,
            includeContext: true,
          }),
        }
      )

      const data = await response.json()

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.response },
        ])
      } else {
        throw new Error(data.error || 'Unknown error')
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '❌ Sorry, I encountered an error. Please make sure the chat-assistant Edge Function is deployed in Supabase.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestedQuestion = (question) => {
    handleSend(question.text)
  }

  const exportConversation = () => {
    const text = messages
      .map((m) => `${m.role === 'user' ? 'You' : 'PuppyBot'}: ${m.content}`)
      .join('\n\n')
    
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `puppybot-chat-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const saveToNotes = async (content, messageIndex) => {
    try {
      await updateNotes(content, getTodayKey())
      setMessages((prev) => 
        prev.map((msg, i) => 
          i === messageIndex ? { ...msg, saved: true } : msg
        )
      )
      setTimeout(() => {
        setMessages((prev) => 
          prev.map((msg) => ({ ...msg, saved: false }))
        )
      }, 2000)
    } catch (error) {
      console.error('Error saving to notes:', error)
      alert('Failed to save to notes')
    }
  }

  const clearChat = () => {
    if (confirm('Clear all messages?')) {
      setMessages([])
    }
  }

  const puppyName = puppy?.name || 'Puppy'

  return (
    <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm overflow-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-steel-500 to-steel-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-white" size={20} />
            <div>
              <h3 className="text-white font-bold text-sm">
                {puppyName}Bot Assistant
              </h3>
              <p className="text-steel-100 text-xs">Ask me anything about {puppyName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Date range selector - right aligned */}
            <div className="flex gap-2 text-xs">
              {['week', 'month', 'ytd', 'all'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    dateRange === range
                      ? 'bg-white text-steel-600'
                      : 'bg-steel-400 text-white hover:bg-steel-300 border border-steel-300'
                  }`}
                >
                  {range === 'ytd' ? 'YTD' : range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            {messages.length > 0 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={exportConversation}
                  className="text-white hover:bg-steel-400 p-1.5 rounded-lg transition-colors"
                  title="Export conversation"
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={clearChat}
                  className="text-white hover:bg-steel-400 p-1.5 rounded-lg transition-colors"
                  title="Clear chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-sand-50/30">
        {messages.length === 0 && (
          <div className="text-center py-4">
            <Sparkles className="mx-auto text-steel-300 mb-3" size={28} />
            <p className="text-sand-600 text-sm font-medium mb-2">
              I can help you understand {puppyName}&apos;s patterns and get training insights!
            </p>
            
            {/* Suggested questions */}
            <div className="space-y-2 mt-4">
              <p className="text-xs text-sand-500 font-semibold uppercase tracking-wide mb-2">
                Try asking:
              </p>
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedQuestion(q)}
                  className="w-full text-left px-3 py-2 bg-white border border-sand-200 rounded-lg text-xs text-sand-700 hover:border-steel-300 hover:bg-sand-50 transition-colors flex items-center gap-2"
                >
                  <span>{q.emoji}</span>
                  <span>{q.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex flex-col gap-1 max-w-[85%]">
              <div
                className={`px-4 py-2 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-steel-500 text-white'
                    : 'bg-white text-sand-900 border border-sand-200 shadow-sm'
                }`}
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {msg.content}
              </div>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1 ml-2">
                  {msg.saved ? (
                    <span className="text-[10px] text-emerald-600 font-medium">✓ Saved to notes</span>
                  ) : (
                    <button
                      onClick={() => saveToNotes(msg.content, i)}
                      className="text-[10px] text-sand-400 hover:text-steel-500 transition-colors flex items-center gap-1"
                      title="Save to today's notes"
                    >
                      <Save size={10} />
                      Save to notes
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl flex items-center gap-2 border border-sand-200 shadow-sm">
              <Loader2 className="animate-spin text-steel-500" size={16} />
              <span className="text-xs text-sand-600">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-sand-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about training, patterns, or advice..."
            className="flex-1 px-4 py-2 border border-sand-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300"
            disabled={loading}
          />
          {recognitionRef.current && (
            <button
              onClick={toggleVoiceInput}
              disabled={loading}
              className={`px-3 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isListening
                  ? 'bg-warm-400 text-white'
                  : 'bg-sand-100 text-sand-600 hover:bg-sand-200'
              }`}
              title="Voice input"
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-steel-500 text-white rounded-xl hover:bg-steel-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
