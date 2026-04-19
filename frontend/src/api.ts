import type { DashboardItem, SessionReport, SessionSnapshot } from './types'

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Request failed with ${response.status}`)
  }

  return response.json() as Promise<T>
}

export function createSession(): Promise<SessionSnapshot> {
  return request<SessionSnapshot>('/api/sessions', {
    method: 'POST',
    body: JSON.stringify({ consent_for_ai: true }),
  })
}

export function warmBackend(): Promise<{ status: string }> {
  return request<{ status: string }>('/api/health')
}

export function submitAnswer(sessionId: string, answerText: string): Promise<SessionSnapshot> {
  return request<SessionSnapshot>(`/api/sessions/${sessionId}/answer`, {
    method: 'POST',
    body: JSON.stringify({ answer_text: answerText }),
  })
}

export function fetchSession(sessionId: string): Promise<SessionSnapshot> {
  return request<SessionSnapshot>(`/api/sessions/${sessionId}`)
}

export function fetchSessions(): Promise<DashboardItem[]> {
  return request<DashboardItem[]>('/api/sessions')
}

export function fetchReport(sessionId: string): Promise<SessionReport> {
  return request<SessionReport>(`/api/sessions/${sessionId}/report`)
}

export function submitVisionAirwayCapture(
  sessionId: string,
  captureType: 'frontal' | 'profile',
  imageDataUrl: string,
): Promise<SessionSnapshot> {
  return request<SessionSnapshot>(`/api/sessions/${sessionId}/vision-airway`, {
    method: 'POST',
    body: JSON.stringify({
      capture_type: captureType,
      image_data_url: imageDataUrl,
      consent_for_image_analysis: true,
    }),
  })
}
