import type { SessionSnapshot } from '../types'

interface RiskPanelProps {
  session: SessionSnapshot | null
}

function riskTone(label?: string) {
  if (label === 'High Risk' || label === 'High-Risk Airway') {
    return 'critical'
  }
  if (label === 'Moderate Risk' || label === 'Potentially Difficult Airway' || label === 'Intermediate Risk') {
    return 'caution'
  }
  return 'calm'
}

export function RiskPanel({ session }: RiskPanelProps) {
  const risk = session?.risk_snapshot
  const vision = risk?.vision_airway?.overall

  return (
    <aside className="panel panel-risk">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Decision Support</p>
          <h2>Live anesthetic triage</h2>
        </div>
      </div>

      {!session ? (
        <div className="empty-state compact">
          <p>Risk outputs will appear here as the interview progresses.</p>
        </div>
      ) : (
        <>
          <div className="risk-hero">
            <div className={`risk-pill ${riskTone(risk?.consolidated_risk)}`}>{risk?.consolidated_risk ?? 'Pending'}</div>
            <p>{risk?.clinical_note}</p>
          </div>

          <div className="metric-grid">
            <article className="metric-card">
              <span>ASA Class</span>
              <strong>{risk?.asa_class ?? 'Pending'}</strong>
            </article>
            <article className="metric-card">
              <span>Airway</span>
              <strong>{risk?.airway_risk ?? 'Pending'}</strong>
            </article>
            <article className="metric-card">
              <span>STOP-Bang</span>
              <strong>
                {risk?.stop_bang_score ?? 0} / 8
                {risk?.stop_bang_risk ? ` • ${risk.stop_bang_risk}` : ''}
              </strong>
            </article>
            <article className="metric-card">
              <span>BMI</span>
              <strong>{risk?.bmi ?? 'Not enough data'}</strong>
            </article>
            <article className="metric-card">
              <span>Vision airway</span>
              <strong>{vision?.bucket ?? 'Not captured'}</strong>
            </article>
          </div>

          <div className="info-block">
            <h3>Present conditions</h3>
            <div className="tag-row">
              {(risk?.present_conditions?.length ? risk.present_conditions : ['No conditions captured yet']).map((item) => (
                <span className="tag" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="info-block">
            <h3>Risk flags</h3>
            <ul className="plain-list">
              {(risk?.risk_flags?.length ? risk.risk_flags : ['No critical flags triggered yet.']).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="info-block">
            <h3>Hybrid AI engine</h3>
            <div className="metric-grid">
              <article className="metric-card">
                <span>Rule baseline</span>
                <strong>{risk?.baseline_rule_risk ?? 'Pending'}</strong>
              </article>
              <article className="metric-card">
                <span>ML classifier</span>
                <strong>
                  {risk?.ml_prediction?.label ?? 'Pending'}
                  {risk?.ml_prediction ? ` • ${Math.round(risk.ml_prediction.confidence * 100)}%` : ''}
                </strong>
              </article>
              <article className="metric-card">
                <span>DL neural net</span>
                <strong>
                  {risk?.dl_prediction?.label ?? 'Pending'}
                  {risk?.dl_prediction ? ` • ${Math.round(risk.dl_prediction.confidence * 100)}%` : ''}
                </strong>
              </article>
              <article className="metric-card">
                <span>AI consensus</span>
                <strong>
                  {risk?.ai_consensus?.label ?? 'Pending'}
                  {risk?.ai_consensus ? ` • ${Math.round(risk.ai_consensus.confidence * 100)}%` : ''}
                </strong>
              </article>
            </div>
          </div>

          <div className="info-block">
            <h3>Prototype vision screen</h3>
            <ul className="plain-list">
              <li>{vision?.label ?? 'No airway image has been analyzed yet.'}</li>
              <li>{vision?.note ?? 'Capture both the frontal and side-profile airway views to add vision cues to the airway summary.'}</li>
              {(vision?.derived_flags?.length ? vision.derived_flags : []).map((item) => (
                <li key={item}>Vision flag: {item}</li>
              ))}
            </ul>
          </div>

          <div className="info-block">
            <h3>NLP findings</h3>
            <div className="tag-row">
              {(risk?.nlp_insights?.detected_concepts?.length
                ? risk.nlp_insights.detected_concepts
                : ['No free-text concepts detected yet']).map((item) => (
                <span className="tag" key={item}>
                  {item}
                </span>
              ))}
            </div>
            {risk?.nlp_insights?.red_flag_terms?.length ? (
              <ul className="plain-list">
                {risk.nlp_insights.red_flag_terms.map((item) => (
                  <li key={item}>Red-flag phrase: {item}</li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="info-block">
            <h3>Features driving the models</h3>
            <ul className="plain-list">
              {(risk?.ai_feature_highlights?.length
                ? risk.ai_feature_highlights
                : ['The AI layer needs more answers before it can highlight strong features.']).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="info-block">
            <h3>Why the ASA class changed</h3>
            <ul className="plain-list">
              {(risk?.asa_rationale?.length ? risk.asa_rationale : ['The system needs more clinical answers to grade accurately.']).map(
                (item) => (
                  <li key={item}>{item}</li>
                ),
              )}
            </ul>
          </div>
        </>
      )}
    </aside>
  )
}
