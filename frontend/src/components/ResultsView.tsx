import type { SessionReport } from '../types'

interface ResultsViewProps {
  report: SessionReport | null
}

function resultTone(label?: string) {
  if (label === 'High Risk' || label === 'High Concern' || label === 'High-Risk Airway') {
    return 'critical'
  }
  if (label === 'Moderate Risk' || label === 'Needs Review' || label === 'Potentially Difficult Airway' || label === 'Intermediate Risk') {
    return 'caution'
  }
  return 'calm'
}

export function ResultsView({ report }: ResultsViewProps) {
  if (!report) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Results</p>
            <h2>Final assessment outcome</h2>
          </div>
        </div>
        <div className="empty-state compact">
          <p>Complete an assessment to review the final airway, AI, and perioperative result summary.</p>
        </div>
      </section>
    )
  }

  const risk = report.risk_assessment
  const vision = risk.vision_airway?.overall
  const flags = risk.risk_flags?.length ? risk.risk_flags : ['No active perioperative flags were captured.']
  const rationale = risk.asa_rationale?.length ? risk.asa_rationale : ['ASA rationale will appear after the assessment is graded.']
  const conditions = risk.present_conditions?.length ? risk.present_conditions : ['No major conditions captured']

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Results</p>
          <h2>Final assessment outcome</h2>
        </div>
      </div>

      <div className="results-grid">
        <article className="result-hero-card">
          <div className={`risk-pill ${resultTone(risk.consolidated_risk)}`}>{risk.consolidated_risk ?? 'Pending'}</div>
          <h3>{risk.ai_consensus?.label ?? risk.consolidated_risk ?? 'Assessment pending'}</h3>
          <p>{risk.clinical_note ?? 'The case summary will appear after all required intake and camera steps are completed.'}</p>
        </article>

        <article className="metric-card">
          <span>ASA Class</span>
          <strong>{risk.asa_class ?? 'Pending'}</strong>
        </article>
        <article className="metric-card">
          <span>Airway</span>
          <strong>{risk.airway_risk ?? 'Pending'}</strong>
        </article>
        <article className="metric-card">
          <span>STOP-Bang</span>
          <strong>
            {risk.stop_bang_score ?? 0} / 8
            {risk.stop_bang_risk ? ` • ${risk.stop_bang_risk}` : ''}
          </strong>
        </article>
        <article className="metric-card">
          <span>Vision airway</span>
          <strong>{vision?.bucket ?? 'Not captured'}</strong>
        </article>
        <article className="metric-card">
          <span>ML score</span>
          <strong>
            {risk.ml_prediction?.label ?? 'Pending'}
            {risk.ml_prediction ? ` • ${Math.round(risk.ml_prediction.confidence * 100)}%` : ''}
          </strong>
        </article>
        <article className="metric-card">
          <span>DL score</span>
          <strong>
            {risk.dl_prediction?.label ?? 'Pending'}
            {risk.dl_prediction ? ` • ${Math.round(risk.dl_prediction.confidence * 100)}%` : ''}
          </strong>
        </article>

        <section className="report-card">
          <h4>Triggered findings</h4>
          <ul className="plain-list">
            {flags.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="report-card">
          <h4>Conditions captured</h4>
          <div className="tag-row">
            {conditions.map((item) => (
              <span className="tag" key={item}>
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="report-card">
          <h4>ASA rationale</h4>
          <ul className="plain-list">
            {rationale.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="report-card">
          <h4>Prototype vision outcome</h4>
          <ul className="plain-list">
            <li>{vision?.label ?? 'The airway vision module has not been completed yet.'}</li>
            <li>{vision?.note ?? 'Complete the airway capture stage to add the vision outcome to the final assessment.'}</li>
          </ul>
        </section>
      </div>
    </section>
  )
}
