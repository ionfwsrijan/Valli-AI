import { useEffect, useRef, useState, type ChangeEvent } from 'react'

import type { SessionSnapshot, VisionAirwayAssessment, VisionAirwayCapture, VisionAirwayMetric } from '../types'

interface AirwayVisionCardProps {
  busy: boolean
  session: SessionSnapshot | null
  visionBusy: boolean
  visionError: string | null
  onAnalyzeCapture: (captureType: 'frontal' | 'profile', imageDataUrl: string) => Promise<void>
}

function percent(value?: number) {
  if (typeof value !== 'number') {
    return 'Pending'
  }
  return `${Math.round(value * 100)}%`
}

function captureInstructions(captureType: 'frontal' | 'profile') {
  if (captureType === 'frontal') {
    return 'Face the camera in even light, include the full face and upper neck, and keep the mouth gently open.'
  }
  return 'Turn to the side, keep the jawline and upper neck visible, and use a plain background if possible.'
}

const CORRECT_LEFT_RIGHT_INVERSION = true

function overallTone(vision?: VisionAirwayAssessment | null) {
  const bucket = vision?.overall?.bucket
  if (bucket === 'High Concern') {
    return 'critical'
  }
  if (bucket === 'Needs Review') {
    return 'caution'
  }
  return 'calm'
}

function displayMetrics(capture?: VisionAirwayCapture) {
  if (capture?.metrics?.length) {
    return capture.metrics
  }

  return (capture?.supporting_cues ?? []).map(
    (cue): VisionAirwayMetric => ({
      key: cue.name.toLowerCase().replace(/\s+/g, '_'),
      label: cue.name,
      value: cue.value,
      finding: `${Math.round(cue.value * 100)}%`,
      interpretation: cue.interpretation,
    }),
  )
}

function CaptureStatusCard({
  label,
  capture,
}: {
  label: string
  capture?: VisionAirwayCapture
}) {
  return (
    <article className="vision-capture-card">
      <div className="vision-capture-head">
        <span>{label}</span>
        <strong>{capture?.status === 'available' ? 'Analyzed' : capture?.status === 'insufficient_quality' ? 'Retake suggested' : 'Not captured'}</strong>
      </div>
      <p>{capture?.summary ?? 'No camera capture has been analyzed for this view yet.'}</p>
      <div className="tag-row">
        <span className="tag">Quality {percent(capture?.quality_score)}</span>
        <span className="tag">Confidence {percent(capture?.confidence)}</span>
      </div>
    </article>
  )
}

function CaptureMetricsCard({
  title,
  capture,
}: {
  title: string
  capture?: VisionAirwayCapture
}) {
  const metrics = displayMetrics(capture)

  return (
    <section className="report-card">
      <h3>{title}</h3>
      <ul className="plain-list">
        {metrics.length
          ? metrics.map((metric) => (
              <li key={metric.key}>
                {metric.label}: {metric.finding}
                {typeof metric.value === 'number' ? ` (${Math.round(metric.value * 100)}%)` : ''}
              </li>
            ))
          : [<li key="pending">Measurements will appear after this view is analyzed.</li>]}
      </ul>
      {capture?.summary ? <p className="helper-text">{capture.summary}</p> : null}
    </section>
  )
}

export function AirwayVisionCard({
  busy,
  session,
  visionBusy,
  visionError,
  onAnalyzeCapture,
}: AirwayVisionCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraSupported, setCameraSupported] = useState(false)
  const [captureType, setCaptureType] = useState<'frontal' | 'profile'>('frontal')
  const [captureNotice, setCaptureNotice] = useState<string | null>(null)

  const vision = session?.risk_snapshot.vision_airway
  const frontalCapture = vision?.captures?.frontal
  const profileCapture = vision?.captures?.profile

  useEffect(() => {
    setCameraSupported(Boolean(navigator.mediaDevices?.getUserMedia))
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => {
    if (session?.status === 'completed') {
      setCaptureNotice('Side profile analyzed successfully. The camera examination is complete.')
    }
  }, [session?.status])

  const attachStream = (stream: MediaStream) => {
    streamRef.current = stream
    if (videoRef.current) {
      videoRef.current.srcObject = stream
      void videoRef.current.play()
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  const startCamera = async () => {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      attachStream(stream)
      setCameraActive(true)
    } catch (error) {
      setCameraError(error instanceof Error ? error.message : 'Unable to access the camera')
    }
  }

  const analyzeDataUrl = async (imageDataUrl: string) => {
    const advancingToProfile = captureType === 'frontal' && !profileCapture
    setCaptureNotice(null)
    await onAnalyzeCapture(captureType, imageDataUrl)
    if (advancingToProfile) {
      setCaptureType('profile')
      setCaptureNotice('Frontal view analyzed successfully. Continue with the side profile view.')
    } else if (captureType === 'profile') {
      setCaptureNotice('Side profile analyzed successfully.')
    } else {
      setCaptureNotice('Frontal view analyzed successfully.')
    }
  }

  const captureCurrentFrame = async () => {
    if (!videoRef.current) {
      return
    }
    const video = videoRef.current
    const width = video.videoWidth
    const height = video.videoHeight
    if (!width || !height) {
      setCameraError('Camera feed is not ready yet.')
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) {
      setCameraError('Canvas capture is not available in this browser.')
      return
    }
    if (CORRECT_LEFT_RIGHT_INVERSION) {
      context.translate(width, 0)
      context.scale(-1, 1)
    }
    context.drawImage(video, 0, 0, width, height)
    await analyzeDataUrl(canvas.toDataURL('image/jpeg', 0.9))
  }

  const handleFileSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        await analyzeDataUrl(reader.result)
      }
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Camera</p>
          <h2>Camera airway examination</h2>
        </div>
        {vision?.overall ? (
          <span className={`risk-pill ${overallTone(vision)}`}>{vision.overall.label}</span>
        ) : (
          <span className="badge soft">Camera assessment pending</span>
        )}
      </div>

      {!session ? (
        <div className="empty-state compact">
          <p>Start and finish the questionnaire first, then capture both the frontal and side-profile airway views to complete the examination.</p>
        </div>
      ) : (
        <div className="vision-shell">
          <div className="vision-live-panel">
            <div className="vision-controls">
              <div className="nav-pills">
                <button
                  className={captureType === 'frontal' ? 'nav-pill active' : 'nav-pill'}
                  type="button"
                  onClick={() => setCaptureType('frontal')}
                >
                  Frontal view
                </button>
                <button
                  className={captureType === 'profile' ? 'nav-pill active' : 'nav-pill'}
                  type="button"
                  onClick={() => setCaptureType('profile')}
                >
                  Side profile
                </button>
              </div>

              <p className="helper-text">{captureInstructions(captureType)}</p>
            </div>

            <div className="vision-preview-shell">
              <video
                autoPlay
                className={CORRECT_LEFT_RIGHT_INVERSION ? 'vision-video corrected-orientation' : 'vision-video'}
                muted
                playsInline
                ref={videoRef}
              />
              {!cameraActive ? (
                <div className="vision-overlay">
                  <p>Open the webcam or upload a photo to analyze the required airway view and complete the camera examination.</p>
                </div>
              ) : null}
            </div>

            <div className="composer-actions">
              {cameraSupported ? (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={cameraActive ? stopCamera : startCamera}
                  disabled={visionBusy}
                >
                  {cameraActive ? 'Stop camera' : 'Start camera'}
                </button>
              ) : null}

              <button
                className="primary-button"
                type="button"
                onClick={captureCurrentFrame}
                disabled={!cameraActive || visionBusy || busy}
              >
                {visionBusy ? 'Analyzing...' : `Analyze ${captureType} frame`}
              </button>

              <button
                className="ghost-button"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={visionBusy || busy}
              >
                Upload photo instead
              </button>
              <input
                accept="image/*"
                capture="user"
                hidden
                onChange={handleFileSelection}
                ref={fileInputRef}
                type="file"
              />
            </div>

            <p className="helper-text">
              Both frontal and side-profile captures are required to finish the assessment.
            </p>
            {captureNotice ? <p className="success-text">{captureNotice}</p> : null}
            {cameraError ? <p className="error-text">{cameraError}</p> : null}
            {visionError ? <p className="error-text">{visionError}</p> : null}
          </div>

          <div className="vision-summary-panel">
            <div className="risk-hero">
              <div className={`risk-pill ${overallTone(vision)}`}>{vision?.overall?.bucket ?? 'Not analyzed'}</div>
              <p>{vision?.overall?.note ?? 'Capture both the frontal and side-profile images to complete the camera assessment.'}</p>
            </div>

            <div className="vision-status-grid">
              <CaptureStatusCard capture={frontalCapture} label="Frontal capture" />
              <CaptureStatusCard capture={profileCapture} label="Profile capture" />
            </div>

            <div className="info-block">
              <h3>Exam findings</h3>
              <div className="tag-row">
                {(vision?.overall?.derived_flags?.length ? vision.overall.derived_flags : ['No vision flags captured yet']).map((item) => (
                  <span className="tag" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <CaptureMetricsCard capture={frontalCapture} title="Frontal measurements" />
            <CaptureMetricsCard capture={profileCapture} title="Side-profile measurements" />
          </div>
        </div>
      )}
    </section>
  )
}
