import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || ''

const promptSuggestions = [
  'Summarize this idea for me',
  'Draft a product launch email',
  'Explain this in simple terms',
  'What are the latest AI trends?',
]

// ─── Local Storage Helpers ────────────────────────────────────────────────────
const STORAGE_KEY = 'northstar-chats'

const loadChats = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveChats = (chats) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
  } catch {}
}

// ─── SVG Icon Library ─────────────────────────────────────────────────────────
const Icon = ({ name, className = '' }) => {
  const icons = {
    spark: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path d="M12 2l1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    close: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    menu: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    moon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path d="M21 13.5A8.5 8.5 0 1 1 10.5 3a7 7 0 0 0 10.5 10.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    sun: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    settings: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M19 12a7 7 0 0 0-.1-1.1l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-1.9-1.1L14.5 2h-5l-.8 2.9a7.6 7.6 0 0 0-1.9 1.1l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.1l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 0 0 1.9 1.1L9.5 22h5l.8-2.9a7.6 7.6 0 0 0 1.9-1.1l2.4 1 2-3.4-2-1.6c.06-.35.1-.72.1-1.1Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    logout: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path d="M10 17l-3-3 3-3M7 14h9M15 5h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    mic: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <rect x="9" y="3" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M6 11a6 6 0 0 0 12 0M12 17v4M8 21h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    micOff: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M18.89 13.23A6 6 0 0 0 18 11M6.54 6.54A6 6 0 0 0 6 11a6 6 0 0 0 12 0M15 9.34V5a3 3 0 0 0-5.68-1.33M9 9v3a3 3 0 0 0 5.12 2.12M12 17v4M8 21h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    paperclip: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path d="M7 12.5 13 6.5a3 3 0 1 1 4.2 4.2L11 16.7a2 2 0 0 1-2.8-2.8l6.3-6.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    image: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" />
        <path d="m6 17 3-3 2 2 3-4 4 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    send: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    trash: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    volume: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path d="M11 5L6 9H2v6h4l5 4V5ZM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    copy: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    chat: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  }
  return icons[name] || null
}

// ─── Format file size ─────────────────────────────────────────────────────────
const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function App() {
  // Auth state
  const [view, setView] = useState('login')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [user, setUser] = useState(null)
  const [statusMessage, setStatusMessage] = useState('Sign in to unlock the AI workspace.')

  // Chat state
  const [chatSessions, setChatSessions] = useState(loadChats)
  const [activeChatId, setActiveChatId] = useState(null)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AI voice assistant. Sign in to start chatting — you can type, upload files, or just speak to me!' },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [chatSearch, setChatSearch] = useState('')

  // Voice state
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [transcript, setTranscript] = useState('')
  const [voiceError, setVoiceError] = useState('')
  const recognitionRef = useRef(null)
  // Use a ref to track listening state without stale closures
  const isListeningRef = useRef(false)
  // Accumulate final recognized text in a ref to avoid state-batching issues
  const accumulatedTextRef = useRef('')

  // Upload state
  const [uploadedImages, setUploadedImages] = useState([])
  const [uploadedFiles, setUploadedFiles] = useState([])
  const imageInputRef = useRef(null)
  const fileInputRef = useRef(null)

  // UI state
  const [theme, setTheme] = useState('system')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [model, setModel] = useState('ollama')
  const [providerStatus, setProviderStatus] = useState([])
  const [copiedId, setCopiedId] = useState(null)

  const textareaRef = useRef(null)
  const conversationEndRef = useRef(null)

  // ─── Persist chats to localStorage ─────────────────────────────────────────
  useEffect(() => {
    saveChats(chatSessions)
  }, [chatSessions])

  // ─── Scroll to bottom on new message ───────────────────────────────────────
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  // ─── Theme init ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const storedTheme = localStorage.getItem('ai-theme')
    if (storedTheme) {
      setTheme(storedTheme)
    } else {
      setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    }
    const storedProvider = localStorage.getItem('ai-provider')
    if (storedProvider) setModel(storedProvider)
    const storedVoice = localStorage.getItem('ai-voice-enabled')
    if (storedVoice !== null) setVoiceEnabled(storedVoice === 'true')
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const resolved = theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : theme
    root.setAttribute('data-theme', resolved)
    localStorage.setItem('ai-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('ai-provider', model)
  }, [model])

  useEffect(() => {
    localStorage.setItem('ai-voice-enabled', voiceEnabled)
  }, [voiceEnabled])

  // ─── Auto-resize textarea ───────────────────────────────────────────────────
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(140, textareaRef.current.scrollHeight)}px`
    }
  }, [inputValue])

  // ─── Session check ──────────────────────────────────────────────────────────
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' })
        if (!response.ok) return
        const data = await response.json()
        if (data?.data?.user) {
          setUser(data.data.user)
          setIsAuthenticated(true)
          setView('chat')
          setStatusMessage(`Welcome back, ${data.data.user.name.split(' ')[0]}!`)
        }
      } catch {}
    }
    checkSession()
  }, [])

  // ─── Provider status ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch(`${API_URL}/api/ai/providers`, { credentials: 'include' })
        const data = await response.json().catch(() => ({}))
        if (response.ok && Array.isArray(data?.data?.providers)) {
          setProviderStatus(data.data.providers)
        }
      } catch {
        setProviderStatus([])
      }
    }
    fetchProviders()
  }, [])

  // ─── Chat history helpers ────────────────────────────────────────────────────
  const saveCurrentChat = useCallback((msgs, chatId) => {
    if (!msgs.length) return
    const userMsg = msgs.find((m) => m.role === 'user')
    if (!userMsg) return
    const title = userMsg.content.slice(0, 48) + (userMsg.content.length > 48 ? '…' : '')
    const timestamp = new Date().toISOString()

    setChatSessions((prev) => {
      const existing = prev.findIndex((c) => c.id === chatId)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = { ...updated[existing], messages: msgs, title, timestamp }
        return updated
      }
      return [{ id: chatId, title, timestamp, messages: msgs }, ...prev]
    })
  }, [])

  const startNewChat = () => {
    if (activeChatId && messages.length > 1) {
      saveCurrentChat(messages, activeChatId)
    }
    const newId = Date.now().toString()
    setActiveChatId(newId)
    setMessages([{ role: 'assistant', content: 'Fresh conversation started! Ask me anything — or press the mic to speak.' }])
    setInputValue('')
    setUploadedImages([])
    setUploadedFiles([])
    setIsSidebarOpen(false)
  }

  const loadChat = (session) => {
    if (activeChatId && messages.length > 1) {
      saveCurrentChat(messages, activeChatId)
    }
    setActiveChatId(session.id)
    setMessages(session.messages)
    setIsSidebarOpen(false)
  }

  const deleteChat = (e, chatId) => {
    e.stopPropagation()
    setChatSessions((prev) => prev.filter((c) => c.id !== chatId))
    if (activeChatId === chatId) {
      setActiveChatId(null)
      setMessages([{ role: 'assistant', content: 'Hello! Start a new conversation.' }])
    }
  }

  const filteredSessions = useMemo(() =>
    chatSessions.filter((s) => s.title.toLowerCase().includes(chatSearch.toLowerCase())),
    [chatSessions, chatSearch]
  )

  // ─── Voice Input ─────────────────────────────────────────────────────────────
  const networkRetryRef = useRef(0)
  const MAX_NETWORK_RETRIES = 2
  // Fallback recording state (for Brave and browsers that block Web Speech API)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const [isRecordingFallback, setIsRecordingFallback] = useState(false)

  const stopListening = useCallback(() => {
    isListeningRef.current = false
    setIsListening(false)
    setTranscript('')
    setVoiceError('')
    networkRetryRef.current = 0

    // Flush any accumulated text into input before stopping
    if (accumulatedTextRef.current.trim()) {
      const finalText = accumulatedTextRef.current.trim()
      setInputValue((prev) => {
        const trimmed = prev.trim()
        return trimmed ? trimmed + ' ' + finalText : finalText
      })
      accumulatedTextRef.current = ''
    }

    // Stop browser Speech Recognition if active
    try {
      recognitionRef.current?.stop()
    } catch {}
    recognitionRef.current = null

    // Stop fallback MediaRecorder if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch {}
    }

    setStatusMessage('')
    setIsRecordingFallback(false)
  }, [])

  // Fallback: record audio and send to backend for transcription
  const startFallbackRecording = useCallback((stream) => {
    setVoiceError('')
    setIsRecordingFallback(true)
    isListeningRef.current = true
    setIsListening(true)
    setStatusMessage('🎤 Recording… speak now (tap mic to stop & transcribe)')
    setTranscript('Recording audio for transcription…')

    audioChunksRef.current = []
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm',
    })
    mediaRecorderRef.current = mediaRecorder

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onstop = async () => {
      setIsRecordingFallback(false)
      setTranscript('')

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      audioChunksRef.current = []

      // Stop all stream tracks
      stream.getTracks().forEach((t) => t.stop())

      if (audioBlob.size < 1000) {
        setStatusMessage('')
        setIsListening(false)
        isListeningRef.current = false
        return
      }

      setStatusMessage('⏳ Transcribing your audio…')
      setTranscript('Processing speech…')

      try {
        const formData = new FormData()
        formData.append('audio', audioBlob, 'recording.webm')

        const response = await fetch(`${API_URL}/api/ai/transcribe`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        })

        const data = await response.json().catch(() => ({}))

        if (response.ok && data?.data?.text) {
          const spokenText = data.data.text.trim()
          if (spokenText) {
            setInputValue((prev) => {
              const trimmed = prev.trim()
              return trimmed ? trimmed + ' ' + spokenText : spokenText
            })
          }
          setStatusMessage('✅ Transcription complete!')
          setTimeout(() => setStatusMessage(''), 2000)
        } else {
          setVoiceError('Could not transcribe audio. Please try again or type your message.')
          setStatusMessage('')
        }
      } catch {
        setVoiceError('Transcription failed. Please type your message instead.')
        setStatusMessage('')
      } finally {
        setTranscript('')
        setIsListening(false)
        isListeningRef.current = false
      }
    }

    mediaRecorder.start()
  }, [])

  const startListening = useCallback(() => {
    // If already listening — stop (this also stops fallback recording)
    if (isListeningRef.current) {
      stopListening()
      return
    }

    setVoiceError('')
    accumulatedTextRef.current = ''
    networkRetryRef.current = 0

    // Check browser support for Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      // No Speech API at all — go straight to fallback recording
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => startFallbackRecording(stream))
        .catch(() => {
          setVoiceError('🚫 Microphone access denied. Please allow mic in your browser.')
          setStatusMessage('Microphone access denied.')
        })
      return
    }

    // Request microphone permission explicitly first
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        // Keep stream reference for potential fallback use
        const streamRef = stream

        // Permission granted — now start recognition
        const recognition = new SpeechRecognition()
        recognition.lang = 'en-US'
        recognition.interimResults = true
        recognition.maxAlternatives = 1
        recognition.continuous = false
        recognitionRef.current = recognition

        recognition.onstart = () => {
          isListeningRef.current = true
          setIsListening(true)
          setTranscript('')
          setVoiceError('')
          setStatusMessage('🎤 Listening… speak now')
          // Stop permission stream tracks since Speech API handles its own audio
          streamRef.getTracks().forEach((t) => t.stop())
        }

        recognition.onresult = (event) => {
          // Reset network retry counter on successful result
          networkRetryRef.current = 0

          let interimText = ''
          let finalText = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const t = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalText += t + ' '
            } else {
              interimText += t
            }
          }

          if (interimText) {
            setTranscript(interimText)
          }

          if (finalText.trim()) {
            accumulatedTextRef.current = ''
            setInputValue((prev) => {
              const trimmed = prev.trim()
              return trimmed ? trimmed + ' ' + finalText.trim() : finalText.trim()
            })
            setTranscript('')
          }
        }

        recognition.onerror = (event) => {
          // For no-speech: just let onend restart
          if (event.error === 'no-speech' || event.error === 'aborted') {
            return
          }

          // Network error: retry a few times, then fall back to recording mode
          if (event.error === 'network') {
            networkRetryRef.current++
            if (networkRetryRef.current <= MAX_NETWORK_RETRIES) {
              // Retry silently
              setStatusMessage(`🔄 Retrying voice connection (${networkRetryRef.current}/${MAX_NETWORK_RETRIES})…`)
              return  // let onend handle restart
            }

            // Max retries exceeded — switch to fallback recording
            isListeningRef.current = false
            setIsListening(false)
            setTranscript('')
            recognitionRef.current = null

            setStatusMessage('Switching to audio recording mode…')

            // Start fallback recording with a fresh mic stream
            navigator.mediaDevices.getUserMedia({ audio: true })
              .then((fallbackStream) => startFallbackRecording(fallbackStream))
              .catch(() => {
                setVoiceError('🚫 Could not access microphone for recording.')
                setStatusMessage('')
              })
            return
          }

          // Other errors
          const errorMessages = {
            'not-allowed': '🚫 Microphone access denied. Please allow mic access in browser settings.',
            'audio-capture': '🎙️ No microphone found. Please connect a microphone.',
          }
          const msg = errorMessages[event.error] || `Voice error: ${event.error}`

          isListeningRef.current = false
          setIsListening(false)
          setTranscript('')
          setVoiceError(msg)
          setStatusMessage(msg)
          streamRef.getTracks().forEach((t) => t.stop())
        }

        recognition.onend = () => {
          if (isListeningRef.current) {
            try {
              setTimeout(() => {
                if (isListeningRef.current && recognitionRef.current) {
                  recognitionRef.current.start()
                }
              }, 100)
            } catch {
              isListeningRef.current = false
              setIsListening(false)
            }
          } else {
            setIsListening(false)
            setTranscript('')
            setStatusMessage('')
          }
        }

        recognition.start()
      })
      .catch(() => {
        setVoiceError('🚫 Microphone access denied. Please allow mic in your browser.')
        setStatusMessage('Microphone access denied.')
      })
  }, [stopListening, startFallbackRecording])

  // ─── Voice Output ────────────────────────────────────────────────────────────
  const speakText = useCallback((text) => {
    if (!voiceEnabled) return
    if (!window.speechSynthesis) return

    window.speechSynthesis.cancel()
    const plain = text.replace(/```[\s\S]*?```/g, 'code block').replace(/[#*`_~]/g, '')
    const utterance = new SpeechSynthesisUtterance(plain)
    utterance.rate = 0.95
    utterance.pitch = 1.05
    utterance.volume = 1

    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find((v) =>
      v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Microsoft')
    )
    if (preferred) utterance.voice = preferred

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [voiceEnabled])

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel()
    setIsSpeaking(false)
  }

  // ─── Image Upload ────────────────────────────────────────────────────────────
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setUploadedImages((prev) => [...prev, { id: Date.now() + Math.random(), name: file.name, dataUrl: ev.target.result, size: file.size }])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeImage = (id) => setUploadedImages((prev) => prev.filter((img) => img.id !== id))

  // ─── File Upload ─────────────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setUploadedFiles((prev) => [
      ...prev,
      ...files.map((f) => ({ id: Date.now() + Math.random(), name: f.name, size: f.size, type: f.type })),
    ])
    e.target.value = ''
  }

  const removeFile = (id) => setUploadedFiles((prev) => prev.filter((f) => f.id !== id))

  // ─── Copy message ────────────────────────────────────────────────────────────
  const copyMessage = (content, id) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  // ─── Auth ────────────────────────────────────────────────────────────────────
  const handleInputChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    if (!form.email || !form.password) {
      setStatusMessage('Please enter your email and password.')
      return
    }
    if (view === 'signup' && !form.name) {
      setStatusMessage('Please enter your full name.')
      return
    }
    try {
      const endpoint = view === 'signup' ? `${API_URL}/api/auth/register` : `${API_URL}/api/auth/login`
      const payload = view === 'signup'
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Authentication failed.')

      setUser(data.data?.user || null)
      setIsAuthenticated(true)
      setView('chat')
      const firstName = view === 'signup' ? form.name.split(' ')[0] : form.email.split('@')[0]
      setStatusMessage(`Welcome${view === 'signup' ? ' aboard' : ' back'}, ${firstName}! 🎉`)

      const newId = Date.now().toString()
      setActiveChatId(newId)
      setMessages([{
        role: 'assistant',
        content: `Hello, ${firstName}! I'm your AI voice assistant. You can type, upload images/files, or press the mic button and just talk to me! 🎤`,
      }])
    } catch (error) {
      setStatusMessage(error.message || 'Something went wrong.')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' })
    } catch {}
    stopSpeaking()
    recognitionRef.current?.stop()
    setIsAuthenticated(false)
    setUser(null)
    setView('login')
    setStatusMessage('You have been signed out.')
    setUploadedImages([])
    setUploadedFiles([])
  }

  // ─── Send Message ─────────────────────────────────────────────────────────────
  const handleSendMessage = async (event) => {
    event.preventDefault()

    const hasText = inputValue.trim()
    const hasAttachments = uploadedImages.length > 0 || uploadedFiles.length > 0
    if (!hasText && !hasAttachments) return

    if (!isAuthenticated) {
      setStatusMessage('Please sign in to use the chat workspace.')
      return
    }

    stopSpeaking()

    // Build message content
    let contentParts = []
    if (hasText) contentParts.push(inputValue.trim())
    if (uploadedImages.length) contentParts.push(`[${uploadedImages.length} image(s) attached]`)
    if (uploadedFiles.length) contentParts.push(`[Files: ${uploadedFiles.map((f) => f.name).join(', ')}]`)

    const userMessage = {
      role: 'user',
      content: contentParts.join('\n'),
      images: uploadedImages.map((img) => img.dataUrl),
      files: uploadedFiles.map((f) => ({ name: f.name, size: f.size })),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputValue('')
    setUploadedImages([])
    setUploadedFiles([])
    setIsThinking(true)

    const chatId = activeChatId || Date.now().toString()
    if (!activeChatId) setActiveChatId(chatId)

    try {
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          provider: model,
          prompt: inputValue.trim() || 'Please describe what you see in the attachment.',
          model: model === 'ollama' ? 'llama3.2' : model === 'sarvam' ? 'sarvam-30b' : 'llama-3.3-70b-versatile',
          systemPrompt: 'You are a polished, concise, and helpful AI assistant. Answer clearly and professionally.',
          temperature: 0.7,
          topP: 0.9,
          maxTokens: 512,
          stream: false,
        }),
      })

      const data = await response.json().catch(() => ({}))
      const assistantReply = data?.data?.reply || data?.reply || data?.message || 'I could not produce a reply right now.'

      const assistantMessage = { role: 'assistant', content: assistantReply }
      const updatedMessages = [...newMessages, assistantMessage]
      setMessages(updatedMessages)
      saveCurrentChat(updatedMessages, chatId)

      // Speak the reply if voice is enabled
      if (voiceEnabled) {
        speakText(assistantReply)
      }
    } catch (error) {
      const fallback = error?.message || 'The AI provider is unavailable right now.'
      const errMessage = { role: 'assistant', content: fallback }
      setMessages((prev) => [...prev, errMessage])
      setStatusMessage(fallback)
    } finally {
      setIsThinking(false)
    }
  }

  // ─── Message Renderer ─────────────────────────────────────────────────────────
  const renderMessageContent = (content) => {
    const parts = []
    const regex = /```(\w+)?\s*([\s\S]*?)```/g
    let lastIndex = 0
    let match

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <div key={`text-${lastIndex}`} className="message-text-block">
            {formatInlineText(content.slice(lastIndex, match.index))}
          </div>
        )
      }
      parts.push(
        <pre key={`code-${match.index}`} className="code-block">
          {match[1] && <span className="code-lang">{match[1]}</span>}
          <code>{match[2]}</code>
        </pre>
      )
      lastIndex = regex.lastIndex
    }

    if (lastIndex < content.length) {
      parts.push(
        <div key={`tail-${lastIndex}`} className="message-text-block">
          {formatInlineText(content.slice(lastIndex))}
        </div>
      )
    }

    return parts.length ? parts : <div className="message-text-block">{formatInlineText(content)}</div>
  }

  const formatInlineText = (text) => {
    return text.split(/\n{2,}/).filter(Boolean).map((para, i) => (
      <p key={`${i}-${para.slice(0, 8)}`} className="message-paragraph">
        {para.split('\n').map((line, li) => (
          <span key={li}>
            {li > 0 && <br />}
            {line}
          </span>
        ))}
      </p>
    ))
  }

  const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    const h = Math.floor(m / 60)
    const d = Math.floor(h / 24)
    if (d > 0) return `${d}d ago`
    if (h > 0) return `${h}h ago`
    if (m > 0) return `${m}m ago`
    return 'just now'
  }

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="app-shell">
      {/* Aurora Background */}
      <div className="aurora-bg" aria-hidden="true">
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-2" />
        <div className="aurora-orb aurora-orb-3" />
      </div>

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <div className="brand-block">
            <div className="brand-mark">✦</div>
            <div>
              <p className="sidebar-label">AI Workspace</p>
              <h1>Northstar</h1>
            </div>
          </div>
          <button type="button" className="icon-btn" onClick={() => setIsSidebarOpen(false)} aria-label="Close sidebar">
            <Icon name="close" />
          </button>
        </div>

        <button type="button" className="new-chat-btn" onClick={startNewChat}>
          <Icon name="spark" className="icon-small" /> New Chat
        </button>

        {/* Voice assistant toggle */}
        <div className="voice-toggle-bar">
          <div className="voice-toggle-info">
            <Icon name="volume" className="icon-small" />
            <span>Voice replies</span>
          </div>
          <button
            type="button"
            className={`toggle-switch ${voiceEnabled ? 'toggle-on' : ''}`}
            onClick={() => setVoiceEnabled((v) => !v)}
            aria-label="Toggle voice replies"
          >
            <span className="toggle-thumb" />
          </button>
        </div>

        {/* Chat history section */}
        <div className="sidebar-section">
          <div className="section-title-row">
            <span className="section-title">Chat History</span>
            <span className="section-pill">{chatSessions.length}</span>
          </div>
          <label className="search-field">
            <span>⌕</span>
            <input
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              placeholder="Search chats…"
            />
          </label>
          <div className="history-list">
            {filteredSessions.length === 0 && (
              <p className="history-empty">No chats yet. Start a conversation!</p>
            )}
            {filteredSessions.map((session) => (
              <button
                key={session.id}
                type="button"
                className={`history-item ${activeChatId === session.id ? 'active' : ''}`}
                onClick={() => loadChat(session)}
              >
                <div className="history-item-header">
                  <Icon name="chat" className="icon-tiny" />
                  <strong>{session.title}</strong>
                </div>
                <div className="history-item-footer">
                  <span className="history-time">{timeAgo(session.timestamp)}</span>
                  <button
                    type="button"
                    className="history-delete"
                    onClick={(e) => deleteChat(e, session.id)}
                    aria-label="Delete chat"
                  >
                    <Icon name="trash" className="icon-tiny" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <button type="button" className="ghost-btn" onClick={() => setIsSettingsOpen(true)}>
            <Icon name="settings" className="icon-small" /> Settings
          </button>
          <button type="button" className="ghost-btn danger" onClick={handleLogout}>
            <Icon name="logout" className="icon-small" /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main Panel ── */}
      <div className="main-panel">
        <header className="topbar">
          <div className="topbar-left">
            <button type="button" className="icon-btn mobile-only" onClick={() => setIsSidebarOpen(true)} aria-label="Open sidebar">
              <Icon name="menu" />
            </button>
            <div>
              <p className="eyebrow">Premium AI workspace</p>
              <h2>{isAuthenticated ? 'Assistant Workspace' : 'Secure Onboarding'}</h2>
            </div>
          </div>

          <div className="topbar-actions">
            <label className="select-pill">
              <span>Provider</span>
              <select value={model} onChange={(e) => setModel(e.target.value)}>
                <option value="ollama">Ollama</option>
                <option value="grok">Grok</option>
                <option value="sarvam">Sarvam</option>
              </select>
            </label>

            {isSpeaking && (
              <button type="button" className="icon-btn speaking-btn" onClick={stopSpeaking} title="Stop speaking">
                <Icon name="volume" />
              </button>
            )}

            <button
              type="button"
              className="icon-btn"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
            </button>

            <div className="avatar-pill" title={user?.name || 'User'}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        <main className="content-area">
          {/* ── Auth View ── */}
          {!isAuthenticated ? (
            <section className="welcome-grid">
              <div className="hero-card">
                <div className="hero-badge">✦ AI-Powered</div>
                <p className="eyebrow">Modern auth + AI voice</p>
                <h3>Your intelligent voice assistant, ready to help.</h3>
                <p>Sign in to chat, upload files, and speak directly with your AI assistant. Powered by state-of-the-art language models.</p>
                <div className="feature-pills">
                  <span>🔒 Secure sign-in</span>
                  <span>🎤 Voice input & output</span>
                  <span>📎 File uploads</span>
                  <span>🖼️ Image uploads</span>
                  <span>💬 Chat history</span>
                </div>
              </div>

              <div className="auth-card">
                {view === 'login' && (
                  <form className="auth-form" onSubmit={handleAuthSubmit}>
                    <div className="form-heading">
                      <div>
                        <p className="eyebrow">Welcome back</p>
                        <h3>Login</h3>
                      </div>
                      <button type="button" className="ghost-btn" onClick={() => setView('signup')}>
                        Create account
                      </button>
                    </div>
                    <label>
                      Email
                      <input id="login-email" type="email" name="email" value={form.email} onChange={handleInputChange} placeholder="you@example.com" />
                    </label>
                    <label>
                      Password
                      <input id="login-password" type="password" name="password" value={form.password} onChange={handleInputChange} placeholder="••••••••" />
                    </label>
                    <button id="login-submit" type="submit" className="primary-btn">Continue →</button>
                  </form>
                )}
                {view === 'signup' && (
                  <form className="auth-form" onSubmit={handleAuthSubmit}>
                    <div className="form-heading">
                      <div>
                        <p className="eyebrow">Start free</p>
                        <h3>Create account</h3>
                      </div>
                      <button type="button" className="ghost-btn" onClick={() => setView('login')}>
                        Login
                      </button>
                    </div>
                    <label>
                      Full name
                      <input id="signup-name" type="text" name="name" value={form.name} onChange={handleInputChange} placeholder="Alex Morgan" />
                    </label>
                    <label>
                      Email
                      <input id="signup-email" type="email" name="email" value={form.email} onChange={handleInputChange} placeholder="alex@company.com" />
                    </label>
                    <label>
                      Password
                      <input id="signup-password" type="password" name="password" value={form.password} onChange={handleInputChange} placeholder="Create a strong password" />
                    </label>
                    <button id="signup-submit" type="submit" className="primary-btn">Create account →</button>
                  </form>
                )}
              </div>
            </section>
          ) : (
            /* ── Chat View ── */
            <section className="chat-stage">
              {/* Conversation area */}
              <div className="conversation-shell">
                <div className="conversation" role="log" aria-live="polite">
                  {messages.map((message, index) => (
                    <article
                      key={`${message.role}-${index}`}
                      className={`message-row ${message.role}`}
                      style={{ '--i': index }}
                    >
                      {message.role === 'assistant' && (
                        <div className="assistant-avatar">✦</div>
                      )}
                      <div className={`message-bubble ${message.role}`}>
                        <div className="message-meta">
                          <span>{message.role === 'user' ? (user?.name?.split(' ')[0] || 'You') : 'Northstar AI'}</span>
                          <div className="message-actions">
                            {message.role === 'assistant' && voiceEnabled && (
                              <button
                                type="button"
                                className="msg-action-btn"
                                onClick={() => speakText(message.content)}
                                title="Read aloud"
                              >
                                <Icon name="volume" className="icon-tiny" />
                              </button>
                            )}
                            <button
                              type="button"
                              className="msg-action-btn"
                              onClick={() => copyMessage(message.content, index)}
                              title="Copy"
                            >
                              {copiedId === index
                                ? <span style={{ fontSize: '0.7rem' }}>✓</span>
                                : <Icon name="copy" className="icon-tiny" />
                              }
                            </button>
                          </div>
                        </div>

                        {/* Attached images */}
                        {message.images?.length > 0 && (
                          <div className="message-images">
                            {message.images.map((src, i) => (
                              <img key={i} src={src} alt={`Attachment ${i + 1}`} className="message-image-thumb" />
                            ))}
                          </div>
                        )}

                        {/* Attached files */}
                        {message.files?.length > 0 && (
                          <div className="message-files">
                            {message.files.map((f, i) => (
                              <span key={i} className="file-badge">
                                📄 {f.name} ({formatBytes(f.size)})
                              </span>
                            ))}
                          </div>
                        )}

                        {renderMessageContent(message.content)}
                      </div>
                    </article>
                  ))}

                  {/* Thinking indicator */}
                  {isThinking && (
                    <article className="message-row assistant">
                      <div className="assistant-avatar">✦</div>
                      <div className="message-bubble assistant typing">
                        <div className="typing-dots" aria-hidden="true">
                          <span /><span /><span />
                        </div>
                        <span className="thinking-label">Thinking…</span>
                      </div>
                    </article>
                  )}

                  {/* Speaking indicator */}
                  {isSpeaking && (
                    <div className="speaking-indicator">
                      <div className="waveform">
                        {[...Array(5)].map((_, i) => <span key={i} style={{ '--d': i }} />)}
                      </div>
                      <span>Speaking…</span>
                      <button type="button" onClick={stopSpeaking} className="stop-speaking-btn">Stop</button>
                    </div>
                  )}

                  <div ref={conversationEndRef} />
                </div>
              </div>

              {/* Composer */}
              <form className="composer" onSubmit={handleSendMessage}>
                {/* Prompt suggestions */}
                <div className="prompt-suggestions">
                  {promptSuggestions.map((s) => (
                    <button key={s} type="button" className="chip-btn" onClick={() => setInputValue(s)}>
                      {s}
                    </button>
                  ))}
                </div>

                {/* Preview: uploaded images */}
                {uploadedImages.length > 0 && (
                  <div className="upload-preview-bar">
                    {uploadedImages.map((img) => (
                      <div key={img.id} className="image-preview-item">
                        <img src={img.dataUrl} alt={img.name} />
                        <button type="button" className="preview-remove" onClick={() => removeImage(img.id)}>×</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Preview: uploaded files */}
                {uploadedFiles.length > 0 && (
                  <div className="file-preview-bar">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="file-preview-item">
                        <span>📄</span>
                        <div>
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">{formatBytes(file.size)}</span>
                        </div>
                        <button type="button" className="preview-remove" onClick={() => removeFile(file.id)}>×</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Voice error banner */}
                {voiceError && (
                  <div className="voice-error-banner">
                    <span>{voiceError}</span>
                    <button type="button" onClick={() => setVoiceError('')}>×</button>
                  </div>
                )}

                {/* Listening status bar */}
                {isListening && (
                  <div className="listening-banner">
                    <div className="mic-wave-bar">
                      <span /><span /><span /><span /><span />
                    </div>
                    <span>🎤 Listening — speak now…</span>
                    <button type="button" className="stop-listening-btn" onClick={stopListening}>
                      ■ Stop
                    </button>
                  </div>
                )}

                {/* Live interim transcript */}
                {transcript && (
                  <div className="live-transcript">
                    <span className="transcript-dot" />
                    <em>{transcript}</em>
                  </div>
                )}

                <div className="composer-box">
                  <textarea
                    ref={textareaRef}
                    id="chat-input"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e)
                      }
                    }}
                    placeholder={isListening ? '🎤 Listening… your words will appear here' : 'Type a message, or press the mic to speak…'}
                    rows={1}
                  />

                  <div className="composer-actions">
                    <div className="action-group">
                      {/* Voice input button */}
                      <button
                        type="button"
                        id="voice-input-btn"
                        className={`icon-btn mic-btn ${isListening ? 'mic-active' : ''}`}
                        onClick={startListening}
                        title={isListening ? 'Stop listening' : 'Voice input'}
                      >
                        {isListening
                          ? <div className="mic-wave"><span /><span /><span /></div>
                          : <Icon name="mic" />
                        }
                      </button>

                      {/* Image upload */}
                      <button
                        type="button"
                        id="image-upload-btn"
                        className="icon-btn"
                        onClick={() => imageInputRef.current?.click()}
                        title="Upload image"
                      >
                        <Icon name="image" />
                      </button>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={handleImageSelect}
                        id="image-file-input"
                      />

                      {/* File upload */}
                      <button
                        type="button"
                        id="file-upload-btn"
                        className="icon-btn"
                        onClick={() => fileInputRef.current?.click()}
                        title="Upload file"
                      >
                        <Icon name="paperclip" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        hidden
                        onChange={handleFileSelect}
                        id="file-input"
                      />
                    </div>

                    <div className="action-group">
                      <span className="char-count">{inputValue.length}/1200</span>
                      <button
                        id="send-btn"
                        type="submit"
                        className="send-btn"
                        disabled={isThinking || (!inputValue.trim() && !uploadedImages.length && !uploadedFiles.length)}
                      >
                        {isThinking ? (
                          <><span className="btn-dots"><span /><span /><span /></span> Thinking</>
                        ) : (
                          <><Icon name="send" className="icon-tiny" /> Send</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </section>
          )}

          {statusMessage && (
            <p className="status-text">{statusMessage}</p>
          )}
        </main>
      </div>

      {/* ── Settings Modal ── */}
      {isSettingsOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && setIsSettingsOpen(false)}>
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <p className="eyebrow">Preferences</p>
                <h3>Workspace Settings</h3>
              </div>
              <button type="button" className="icon-btn" onClick={() => setIsSettingsOpen(false)} aria-label="Close settings">
                <Icon name="close" />
              </button>
            </div>

            <div className="settings-grid">
              <label className="setting-item">
                <span>🎨 Theme</span>
                <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </label>

              <label className="setting-item">
                <span>🤖 AI Provider</span>
                <select value={model} onChange={(e) => setModel(e.target.value)}>
                  <option value="ollama">Ollama</option>
                  <option value="grok">Grok</option>
                  <option value="sarvam">Sarvam</option>
                </select>
              </label>

              <div className="setting-item">
                <span>🔊 Voice Replies</span>
                <button
                  type="button"
                  className={`toggle-switch ${voiceEnabled ? 'toggle-on' : ''}`}
                  onClick={() => setVoiceEnabled((v) => !v)}
                >
                  <span className="toggle-thumb" />
                </button>
              </div>

              <div className="setting-item setting-status">
                <span>⚡ Provider Status</span>
                <div className="status-list">
                  {providerStatus.length
                    ? providerStatus.map((item) => (
                        <span key={item.name} className={`status-chip ${item.available ? 'online' : 'offline'}`}>
                          {item.displayName || item.name}: {item.available ? '● ready' : '○ offline'}
                        </span>
                      ))
                    : <span className="status-chip offline">Checking…</span>
                  }
                </div>
              </div>

              <div className="setting-item">
                <span>💬 Chat Sessions</span>
                <button
                  type="button"
                  className="ghost-btn danger"
                  onClick={() => {
                    if (confirm('Clear all chat history?')) {
                      setChatSessions([])
                      setMessages([{ role: 'assistant', content: 'Chat history cleared. Start fresh!' }])
                    }
                  }}
                >
                  Clear all
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} aria-hidden="true" />
      )}
    </div>
  )
}

export default App