import { useEffect, useRef, useState } from 'react'

type BrowserSpeechRecognitionEvent = {
  resultIndex: number
  results: SpeechRecognitionResultList
}

type BrowserSpeechRecognitionErrorEvent = {
  error: string
}

type BrowserSpeechRecognition = EventTarget & {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition

declare global {
  interface Window {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor
  }
}

export function useSpeechRecognition(language = 'en-IN') {
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null)
  const acceptResultsRef = useRef(false)
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) {
      setIsSupported(false)
      return
    }

    const recognition = new Recognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = language

    recognition.onresult = (event) => {
      if (!acceptResultsRef.current) {
        return
      }

      let combined = ''
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        combined += event.results[index][0].transcript
      }
      setTranscript(combined.trim())
    }

    recognition.onerror = (event) => {
      setError(event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      acceptResultsRef.current = false
      setIsListening(false)
    }

    recognitionRef.current = recognition
    setIsSupported(true)

    return () => {
      acceptResultsRef.current = false
      recognition.stop()
      recognitionRef.current = null
    }
  }, [language])

  const startListening = () => {
    if (!recognitionRef.current) {
      return
    }
    recognitionRef.current.lang = language
    acceptResultsRef.current = true
    setTranscript('')
    setError(null)
    setIsListening(true)
    recognitionRef.current.start()
  }

  const stopListening = () => {
    acceptResultsRef.current = false
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  const resetTranscript = () => {
    acceptResultsRef.current = false
    setTranscript('')
  }

  return {
    error,
    isListening,
    isSupported,
    transcript,
    resetTranscript,
    startListening,
    stopListening,
  }
}
