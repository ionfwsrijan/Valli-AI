import type { DashboardItem } from '../types'

interface DashboardViewProps {
  items: DashboardItem[]
  onRefresh: () => void
  onOpenReport: (sessionId: string) => void
}

export function DashboardView({ items, onRefresh, onOpenReport }: DashboardViewProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Records</p>
          <h2>Completed assessment records</h2>
        </div>
        <button className="ghost-button" type="button" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      <div className="dashboard-list">
        {items.length === 0 ? (
          <div className="empty-state compact">
            <p>No completed assessments have been recorded yet.</p>
          </div>
        ) : (
          items.map((item) => (
            <article className="dashboard-card" key={item.session_id}>
              <div>
                <span className="badge soft">Completed</span>
                <h3>{item.patient_name || 'Unnamed patient'}</h3>
                <p>{item.proposed_procedure || 'Procedure not entered yet'}</p>
              </div>
              <div className="dashboard-card-side">
                <span className="badge">{item.consolidated_risk || 'Pending'}</span>
                <span className="meta-text">{item.asa_class || 'ASA pending'}</span>
                <button className="secondary-button" type="button" onClick={() => onOpenReport(item.session_id)}>
                  Open report
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
