import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2, Mic, MicOff, Save, Download, Trash2, PawPrint, ArrowUp } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase'
import { getGreeting, getTodayKey } from '../utils/helpers'

export default function DashboardChat() {
  const { puppy, updateNotes } = useData()
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [dateRange, setDateRange] = useState('all')
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const textareaRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!user?.id || historyLoaded) return
    const loadHistory = async () => {
      const { data } = await supabase
        .from('chat_history')
        .select('role, message, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(100)
      if (data && data.length > 0) {
        setMessages(data.map((row) => ({ role: row.role, content: row.message })))
      }
      setHistoryLoaded(true)
    }
    loadHistory()
  }, [user?.id, historyLoaded])

  // Auto-resize textarea
  const resizeTextarea = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 150) + 'px'
  }, [])

  useEffect(() => {
    resizeTextarea()
  }, [input, resizeTextarea])

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

      if (!response.ok) {
        const text = await response.text()
        console.error('Edge Function HTTP error:', response.status, text)
        let detail = `HTTP ${response.status}`
        try { const j = JSON.parse(text); if (j.error) detail = j.error } catch {}
        throw new Error(detail)
      }

      const data = await response.json()

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.response },
        ])
        if (user?.id) {
          supabase.from('chat_history').insert([
            { message: messageText, role: 'user', date_range: dateRange, user_id: user.id },
            { message: data.response, role: 'assistant', date_range: dateRange, user_id: user.id },
          ]).then(() => {})
        }
      } else {
        throw new Error(data.error || 'Unknown error')
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errMsg = error?.message || 'Unknown error'
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ Sorry, I encountered an error: ${errMsg}`,
        },
      ])
    } finally {
      setLoading(false)
    }
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

  const clearChat = async () => {
    if (confirm('Clear all messages?')) {
      setMessages([])
      if (user?.id) {
        await supabase.from('chat_history').delete().eq('user_id', user.id)
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const puppyName = puppy?.name || 'your puppy'
  const hasMessages = messages.length > 0

  return (
    <div className="max-w-3xl mx-auto">
      {/* Centered greeting — on page background */}
      <div className="flex items-center justify-center gap-3 mb-3">
        <PawPrint size={26} className="text-warm-300" />
        <h2 className="text-2xl font-bold text-sand-900">
          {getGreeting()}! What would you like to know about {puppyName}?
        </h2>
      </div>

      {/* Centered data range */}
      <div className="flex items-center justify-center gap-2 mb-6">
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

        {hasMessages && (
          <div className="flex items-center gap-1 ml-3">
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

      {/* Conversation — free on page background, no card */}
      {hasMessages && (
        <div className="mb-6 max-h-[50vh] overflow-y-auto px-1 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex flex-col gap-1 max-w-[85%]">
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-steel-500 text-white'
                      : 'bg-white text-sand-900 border border-sand-200/60 shadow-sm'
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
              <div className="bg-white px-4 py-3 rounded-2xl flex items-center gap-2 border border-sand-200/60 shadow-sm">
                <Loader2 className="animate-spin text-steel-500" size={16} />
                <span className="text-xs text-sand-500">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Claude-style input container */}
      <div className="bg-white rounded-2xl border border-sand-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-3">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask about ${puppyName}'s training, patterns, or advice...`}
          rows={1}
          className="w-full resize-none bg-transparent text-sm text-sand-900 placeholder:text-sand-300 focus:outline-none leading-relaxed px-1 py-1"
          disabled={loading}
        />
        <div className="flex items-center justify-between mt-1">
          <p className="text-[10px] text-sand-300 pl-1">
            powered by Claude Sonnet 4.5
          </p>
          <div className="flex items-center gap-1.5">
            {recognitionRef.current && (
              <button
                onClick={toggleVoiceInput}
                disabled={loading}
                className={`p-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isListening
                    ? 'bg-warm-400 text-white'
                    : 'text-sand-400 hover:bg-sand-100 hover:text-sand-600'
                }`}
                title="Voice input"
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            )}
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className={`p-2 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                input.trim()
                  ? 'bg-steel-500 text-white hover:bg-steel-600'
                  : 'bg-sand-100 text-sand-400'
              }`}
              title="Send"
            >
              <ArrowUp size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
