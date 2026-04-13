import type { SessionSnapshot } from '../types'

interface ConversationViewProps {
  busy: boolean
  draftAnswer: string
  error: string | null
  isListening: boolean
  isSpeechSupported: boolean
  session: SessionSnapshot | null
  autoSpeak: boolean
  needsCameraExam: boolean
  onDraftChange: (value: string) => void
  onQuickAnswer: (value: string) => void
  onSubmit: () => void
  onStart: () => void
  onToggleListening: () => void
  onToggleAutoSpeak: () => void
}

function MicGlyph({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg aria-hidden="true" className="icon-glyph" viewBox="0 0 24 24">
        <rect height="10" rx="1.5" width="10" x="7" y="7" />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" className="icon-glyph" viewBox="0 0 24 24">
      <path d="M12 15a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z" fill="currentColor" />
      <path
        d="M6 11.5a1 1 0 1 1 2 0a4 4 0 0 0 8 0a1 1 0 1 1 2 0a6 6 0 0 1-5 5.91V20h2a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2h2v-2.59A6 6 0 0 1 6 11.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function ConversationView({
  busy,
  draftAnswer,
  error,
  isListening,
  isSpeechSupported,
  session,
  autoSpeak,
  needsCameraExam,
  onDraftChange,
  onQuickAnswer,
  onSubmit,
  onStart,
  onToggleListening,
  onToggleAutoSpeak,
}: ConversationViewProps) {
  const progress = session ? `${session.progress_completed}/${session.progress_total}` : '0/0'
  const isComplete = session?.status === 'completed'
  const currentQuestion = session?.current_question
  const currentPrompt = [currentQuestion?.text, currentQuestion?.helper_text].filter(Boolean).join('\n')
  const isBooleanQuestion = currentQuestion?.input_type === 'boolean'
  const isChoiceQuestion = currentQuestion?.input_type === 'choice'
  const usesQuickActions = isBooleanQuestion || isChoiceQuestion

  return (
    <section className="panel panel-conversation">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Patient Interview</p>
          <h2>Patient questionnaire</h2>
        </div>
        <button className="ghost-button" type="button" onClick={onToggleAutoSpeak}>
          {autoSpeak ? 'Voice prompts on' : 'Voice prompts off'}
        </button>
      </div>

      {!session ? (
        <div className="empty-state">
          <p>
            Start a new assessment to begin the patient questionnaire.
          </p>
          <button className="primary-button" type="button" onClick={onStart} disabled={busy}>
            Start assessment
          </button>
        </div>
      ) : (
        <>
          <div className="conversation-meta">
            <span className="badge soft">Session {session.session_id.slice(0, 8)}</span>
            <span className="badge">{session.current_question?.section ?? 'Interview complete'}</span>
            <span className="badge soft">Progress {progress}</span>
          </div>

          <div className="transcript-shell">
            {session.transcript.map((entry, index) => (
              <article className={`bubble ${entry.speaker}`} key={`${entry.timestamp}-${index}`}>
                <span className="bubble-speaker">{entry.speaker === 'ai' ? 'Valli' : 'Patient'}</span>
                <p>{entry.message}</p>
              </article>
            ))}
          </div>

          {!isComplete && session.current_question ? (
            <div className="composer">
              <span className="composer-label">
                Current prompt
              </span>
              <div className="current-question">{currentPrompt}</div>

              {usesQuickActions ? (
                <>
                  {isBooleanQuestion ? (
                    <div className="boolean-grid">
                      <button className="quick-answer-button" type="button" onClick={() => onQuickAnswer('Yes')} disabled={busy}>
                        Yes
                      </button>
                      <button className="quick-answer-button" type="button" onClick={() => onQuickAnswer('No')} disabled={busy}>
                        No
                      </button>
                      {currentQuestion?.optional ? (
                        <button className="quick-answer-button subtle" type="button" onClick={() => onQuickAnswer('skip')} disabled={busy}>
                          Skip
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  {isChoiceQuestion ? (
                    <div className="choice-stack">
                      {currentQuestion?.options.map((option) => (
                        <button
                          className="choice-card"
                          key={option.value}
                          type="button"
                          onClick={() => onQuickAnswer(option.label)}
                          disabled={busy}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {draftAnswer.trim() ? (
                    <div className="voice-preview">
                      <span className="composer-label">Captured response</span>
                      <p>{draftAnswer}</p>
                      <div className="composer-actions">
                        <button className="primary-button" type="button" onClick={() => onSubmit()} disabled={busy}>
                          {busy ? 'Saving...' : 'Submit captured response'}
                        </button>
                        <button className="ghost-button" type="button" onClick={() => onDraftChange('')} disabled={busy}>
                          Clear
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className="composer-actions">
                    <button
                      aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                      className={isListening ? 'icon-button active' : 'icon-button'}
                      type="button"
                      onClick={onToggleListening}
                      disabled={!isSpeechSupported || busy}
                      title={isListening ? 'Stop voice input' : 'Start voice input'}
                    >
                      <MicGlyph active={isListening} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <textarea
                    id="answer-box"
                    value={draftAnswer}
                    onChange={(event) => onDraftChange(event.target.value)}
                    placeholder="Type or dictate the patient's exact response here..."
                    rows={5}
                  />

                  <div className="composer-actions">
                    <button className="primary-button" type="button" onClick={() => onSubmit()} disabled={busy || !draftAnswer.trim()}>
                      {busy ? 'Saving...' : 'Submit response'}
                    </button>
                    {currentQuestion?.optional ? (
                      <button className="ghost-button" type="button" onClick={() => onQuickAnswer('skip')} disabled={busy}>
                        Skip
                      </button>
                    ) : null}
                    <button
                      aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                      className={isListening ? 'icon-button active' : 'icon-button'}
                      type="button"
                      onClick={onToggleListening}
                      disabled={!isSpeechSupported || busy}
                      title={isListening ? 'Stop voice input' : 'Start voice input'}
                    >
                      <MicGlyph active={isListening} />
                    </button>
                  </div>
                </>
              )}

              {!isSpeechSupported ? <p className="helper-text">Speech recognition is not supported in this browser.</p> : null}
              <p className="helper-text">
                You can also ask hospital-policy questions here, such as fasting or ride-home planning. The assistant will answer
                from the configured policy knowledge base and keep the assessment on track.
              </p>
            </div>
          ) : (
            <div className="empty-state compact">
              <p>
                {needsCameraExam
                  ? 'The questionnaire is complete. Continue on the Camera page to finish the airway examination.'
                  : 'The assessment is complete. Open the report tab for the final transcript and report.'}
              </p>
            </div>
          )}
        </>
      )}

      {error ? <p className="error-text">{error}</p> : null}
    </section>
  )
}
