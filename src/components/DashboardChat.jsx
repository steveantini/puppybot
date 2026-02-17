import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Mic, MicOff, Save, Download, Trash2, PawPrint } from 'lucide-react'
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
    <div className="max-w-4xl mx-auto">
      {/* Title — on page background, not in a card */}
      <div className="flex items-center gap-3 mb-4">
        <PawPrint size={28} className="text-warm-300" />
        <h2 className="text-2xl font-bold text-sand-900">
          Welcome to <span className="text-steel-400">{puppyName}</span><span className="text-steel-500">Bot</span>!
        </h2>
      </div>

      {/* Date range selector — subtle, on background */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-sand-400 font-medium">Data range:</span>
        <div className="flex gap-1.5">
          {['week', 'month', 'ytd', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                dateRange === range
                  ? 'bg-steel-500 text-white'
                  : 'bg-sand-100 text-sand-500 hover:bg-sand-200'
              }`}
            >
              {range === 'ytd' ? 'YTD' : range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>

        {/* Action buttons when messages exist */}
        {messages.length > 0 && (
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={exportConversation}
              className="text-sand-400 hover:text-steel-500 p-1.5 rounded-lg transition-colors"
              title="Export conversation"
            >
              <Download size={14} />
            </button>
            <button
              onClick={clearChat}
              className="text-sand-400 hover:text-red-500 p-1.5 rounded-lg transition-colors"
              title="Clear chat"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Chat window — clean white rectangle */}
      <div className="bg-white rounded-2xl border border-sand-200/60 shadow-sm overflow-hidden">
        {/* Messages area */}
        <div className="h-[420px] overflow-y-auto p-5 relative">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-sand-400 text-sm mb-6">
                Ask about training, patterns, or advice
              </p>
              
              {/* Suggested questions */}
              <div className="w-full max-w-md space-y-2">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedQuestion(q)}
                    className="w-full text-left px-4 py-2.5 border border-sand-200/80 rounded-xl text-xs text-sand-600 hover:border-steel-300 hover:bg-sand-50 transition-colors flex items-center gap-2.5"
                  >
                    <span className="text-sm">{q.emoji}</span>
                    <span>{q.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex flex-col gap-1 max-w-[85%]">
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-steel-500 text-white'
                      : 'bg-sand-50 text-sand-900 border border-sand-200/60'
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
            <div className="flex justify-start mb-4">
              <div className="bg-sand-50 px-4 py-3 rounded-2xl flex items-center gap-2 border border-sand-200/60">
                <Loader2 className="animate-spin text-steel-500" size={16} />
                <span className="text-xs text-sand-500">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="px-5 pb-4 pt-2 border-t border-sand-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={`Ask about ${puppyName}'s training, patterns, or advice...`}
              className="flex-1 px-4 py-2.5 border border-sand-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 placeholder:text-sand-300"
              disabled={loading}
            />
            {recognitionRef.current && (
              <button
                onClick={toggleVoiceInput}
                disabled={loading}
                className={`px-3 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isListening
                    ? 'bg-warm-400 text-white'
                    : 'bg-sand-100 text-sand-500 hover:bg-sand-200'
                }`}
                title="Voice input"
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            )}
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 bg-steel-500 text-white rounded-xl hover:bg-steel-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>

          {/* Powered by Claude — bottom right */}
          <div className="flex justify-end mt-2">
            <p className="text-[10px] text-sand-300">
              powered by Claude 3.5 Sonnet
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
