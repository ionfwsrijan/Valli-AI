import type { SessionReport, VisionAirwayCapture, VisionAirwayMetric } from '../types'

interface ReportViewProps {
  report: SessionReport | null
  onPrintReport: () => void
  onPrintTranscript: () => void
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return 'Not provided'
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  return String(value)
}

function displayGender(value: unknown) {
  const text = displayValue(value)
  if (text === 'Not provided') {
    return text
  }
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function formatTimestamp(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function initialsFromName(value: unknown) {
  const text = displayValue(value)
  if (text === 'Not provided') {
    return 'PA'
  }
  return text
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function metricPercent(value: unknown) {
  if (typeof value !== 'number') {
    return 'Pending'
  }
  return `${Math.round(value * 100)}%`
}

function captureTitle(captureType: 'frontal' | 'profile') {
  return captureType === 'frontal' ? 'Frontal camera view' : 'Side-profile camera view'
}

function displayMetrics(capture?: VisionAirwayCapture): VisionAirwayMetric[] {
  if (capture?.metrics?.length) {
    return capture.metrics
  }

  return (capture?.supporting_cues ?? []).map((cue) => ({
    key: cue.name.toLowerCase().replace(/\s+/g, '_'),
    label: cue.name,
    value: cue.value,
    finding: `${Math.round(cue.value * 100)}%`,
    interpretation: cue.interpretation,
  }))
}

function CameraCaptureReport({
  captureType,
  capture,
}: {
  captureType: 'frontal' | 'profile'
  capture?: VisionAirwayCapture
}) {
  const metrics = displayMetrics(capture)

  return (
    <section className="report-card camera-report-card">
      <div className="camera-report-head">
        <div>
          <span className="eyebrow">{captureTitle(captureType)}</span>
          <h4>{capture?.status === 'available' ? 'Captured and analyzed' : capture?.status === 'insufficient_quality' ? 'Retake recommended' : 'Pending capture'}</h4>
        </div>
        <div className="report-card-meta">
          <span className="tag">Quality {metricPercent(capture?.quality_score)}</span>
          <span className="tag">Confidence {metricPercent(capture?.confidence)}</span>
          {capture?.accuracy_tracking?.reliability_band ? (
            <span className="tag">Reliability {capture.accuracy_tracking.reliability_band}</span>
          ) : null}
        </div>
      </div>

      <p className="report-subtitle">
        {capture?.summary ?? 'This camera view has not been captured yet.'}
      </p>

      <div className="camera-metric-grid">
        {metrics.length ? (
          metrics.map((metric) => (
            <article className="camera-metric-card" key={`${captureType}-${metric.key}`}>
              <span>{metric.label}</span>
              <strong>{metric.finding}</strong>
              <p>{metricPercent(metric.value)}</p>
            </article>
          ))
        ) : (
          <article className="camera-metric-card camera-metric-card-empty">
            <span>Measurements</span>
            <strong>Pending</strong>
            <p>Capture this view to populate the camera measurements.</p>
          </article>
        )}
      </div>

      <ul className="plain-list">
        {capture?.accuracy_tracking ? (
          <>
            <li>Estimated accuracy: {metricPercent(capture.accuracy_tracking.estimated_accuracy)}</li>
            <li>Reference set size: {capture.accuracy_tracking.reference_dataset_size}</li>
            <li>{capture.accuracy_tracking.accuracy_note}</li>
          </>
        ) : null}
        {metrics.length
          ? metrics.map((metric) => (
              <li key={`note-${captureType}-${metric.key}`}>
                {metric.label}: {metric.interpretation}
              </li>
            ))
          : null}
        {(capture?.derived_flags?.length ? capture.derived_flags : ['No camera flags captured for this view.']).map((item) => (
          <li key={`${captureType}-${item}`}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

export function ReportView({ report, onPrintReport, onPrintTranscript }: ReportViewProps) {
  if (!report) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Report</p>
            <h2>Assessment report</h2>
          </div>
        </div>
        <div className="empty-state compact">
          <p>Complete or open an assessment to view the final report and transcript.</p>
        </div>
      </section>
    )
  }

  const patientCards: Array<[string, unknown]> = [
    ['Age', report.patient_summary.age],
    ['Gender', displayGender(report.patient_summary.sex)],
    ['History From', report.patient_summary.history_source],
    ['Diagnosis', report.patient_summary.preoperative_diagnosis],
    ['Procedure', report.patient_summary.proposed_procedure],
    ['Height', report.patient_summary.height_cm ? `${displayValue(report.patient_summary.height_cm)} cm` : report.patient_summary.height_cm],
    ['Weight', report.patient_summary.weight_kg ? `${displayValue(report.patient_summary.weight_kg)} kg` : report.patient_summary.weight_kg],
  ]

  const presentConditions = report.risk_assessment.present_conditions ?? []
  const riskFlags = report.risk_assessment.risk_flags ?? []
  const vision = report.risk_assessment.vision_airway
  const frontalCapture = vision?.captures?.frontal
  const profileCapture = vision?.captures?.profile

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Report</p>
          <h2>Assessment report</h2>
        </div>
        <div className="print-controls">
          <button className="ghost-button" type="button" onClick={onPrintTranscript}>
            Print transcript PDF
          </button>
          <button className="primary-button" type="button" onClick={onPrintReport}>
            Print report PDF
          </button>
        </div>
      </div>

      <div className="report-sheet">
        <div className="report-masthead">
          <div className="report-identity">
            <div className="report-avatar">{initialsFromName(report.patient_summary.name)}</div>
            <div>
              <p className="eyebrow">Pre-Anesthetic Record</p>
              <h3>{displayValue(report.patient_summary.name)}</h3>
              <p className="report-subtitle">{displayValue(report.patient_summary.proposed_procedure)}</p>
            </div>
          </div>

          <div className="report-status">
            <div className="report-badges">
              <span className="badge">{report.risk_assessment.consolidated_risk ?? 'Pending'}</span>
              <span className="badge soft">{report.risk_assessment.asa_class ?? 'ASA pending'}</span>
            </div>
            <p className="report-subtitle">Updated {formatTimestamp(report.updated_at)}</p>
          </div>
        </div>

        <div className="report-highlight-band print-report-only">
          <article className="report-highlight-card report-highlight-card-primary">
            <span>Overall assessment</span>
            <strong>{report.risk_assessment.consolidated_risk ?? 'Pending'}</strong>
            <p>{report.risk_assessment.clinical_note ?? 'Assessment summary pending.'}</p>
          </article>
          <article className="report-highlight-card">
            <span>Airway</span>
            <strong>{report.risk_assessment.airway_risk ?? 'Pending'}</strong>
            <p>Airway score {report.risk_assessment.airway_score ?? 'Pending'}</p>
          </article>
          <article className="report-highlight-card">
            <span>STOP-Bang</span>
            <strong>{report.risk_assessment.stop_bang_score ?? 0} / 8</strong>
            <p>{report.risk_assessment.stop_bang_risk ?? 'Pending'}</p>
          </article>
          <article className="report-highlight-card">
            <span>Camera</span>
            <strong>{vision?.overall?.bucket ?? 'Not captured'}</strong>
            <p>{vision?.overall?.note ?? 'Capture both required camera views to complete the airway examination.'}</p>
          </article>
        </div>

        <div className="report-section print-report-only">
          <div className="report-section-head">
            <h4>Patient details</h4>
            <p>Clinical identity and surgical context</p>
          </div>
          <div className="report-grid">
            {patientCards.map(([label, value]) => (
              <div className="report-field" key={label}>
                <span>{label}</span>
                <strong>{displayValue(value)}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="report-summary-strip print-report-only">
          <article>
            <span>ASA</span>
            <strong>{report.risk_assessment.asa_class ?? 'Pending'}</strong>
          </article>
          <article>
            <span>BMI</span>
            <strong>{report.risk_assessment.bmi ?? 'Not enough data'}</strong>
          </article>
          <article>
            <span>Flags</span>
            <strong>{riskFlags.length}</strong>
          </article>
        </div>

        <div className="report-columns report-columns-enhanced">
          <div className="transcript-column">
            <div className="report-section-head">
              <h4>Transcript</h4>
              <p>Full patient conversation and camera updates</p>
            </div>
            <div className="report-transcript-card print-transcript-primary">
              <div className="report-transcript">
                {report.transcript.map((entry, index) => (
                  <article className={`report-turn ${entry.speaker}`} key={`${entry.timestamp}-${index}`}>
                    <span className="report-turn-speaker">{entry.speaker === 'ai' ? 'Valli' : 'Patient'}</span>
                    <p>{entry.message}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="print-report-only">
            <div className="report-side-stack">
              <section className="report-card">
                <h4>Assessment notes</h4>
                <ul className="plain-list">
                  <li>{report.risk_assessment.clinical_note ?? 'Clinical summary pending.'}</li>
                  {(report.risk_assessment.asa_rationale ?? []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                  {(riskFlags.length ? riskFlags : ['No active perioperative flags captured.']).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="report-card">
                <h4>Present conditions</h4>
                <div className="tag-row">
                  {(presentConditions.length ? presentConditions : ['No major conditions captured']).map((item) => (
                    <span className="tag" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </section>

              <section className="report-card">
                <h4>Camera airway summary</h4>
                <ul className="plain-list">
                  <li>{vision?.overall?.label ?? 'No camera assessment has been recorded yet.'}</li>
                  <li>{vision?.overall?.note ?? 'Both required camera views need to be captured to complete the airway examination.'}</li>
                  {vision?.overall?.accuracy_tracking ? (
                    <>
                      <li>Estimated accuracy: {metricPercent(vision.overall.accuracy_tracking.estimated_accuracy)}</li>
                      <li>Reliability: {vision.overall.accuracy_tracking.reliability_band}</li>
                      <li>Reference dataset size: {vision.overall.accuracy_tracking.reference_dataset_size}</li>
                      <li>{vision.overall.accuracy_tracking.accuracy_note}</li>
                    </>
                  ) : null}
                  {(vision?.overall?.derived_flags?.length ? vision.overall.derived_flags : ['No camera-derived airway flags were recorded.']).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <div className="camera-report-grid">
                <CameraCaptureReport capture={frontalCapture} captureType="frontal" />
                <CameraCaptureReport capture={profileCapture} captureType="profile" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
