import { useEffect, useState } from 'react'

import type { LocalizedQuestion } from '../localization'
import type { SessionSnapshot } from '../types'

interface ConversationViewProps {
  busy: boolean
  draftAnswer: string
  error: string | null
  isListening: boolean
  isSpeechSupported: boolean
  labels: {
    patientInterview: string
    patientQuestionnaire: string
    voicePromptsOn: string
    voicePromptsOff: string
    startAssessment: string
    startingAssessment: string
    startingAssessmentHelper: string
    resumeAssessment: string
    resumeHelper: string
    nextQuestion: string
    resumeCameraExam: string
    startNewAssessmentPrompt: string
    currentPrompt: string
    whyAsked: string
    hideWhy: string
    repeatPrompt: string
    rephrasePrompt: string
    slowDownPrompt: string
    capturedResponse: string
    submitCapturedResponse: string
    submitResponse: string
    clear: string
    saving: string
    yes: string
    no: string
    skip: string
    typeOrDictate: string
    speechUnsupported: string
    policyHelper: string
  }
  localizedQuestion: LocalizedQuestion | null
  session: SessionSnapshot | null
  autoSpeak: boolean
  needsCameraExam: boolean
  resumablePrompt: string | null
  resumableHeading: string | null
  onDraftChange: (value: string) => void
  onQuickAnswer: (value: string) => void
  onSubmit: () => void
  onStart: () => void
  onResume: () => void
  onRepeatPrompt: () => void
  onRephrasePrompt: () => void
  onSlowDownPrompt: () => void
  onToggleListening: () => void
  onToggleAutoSpeak: () => void
  translateAiMessage: (message: string) => string
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
  labels,
  localizedQuestion,
  session,
  autoSpeak,
  needsCameraExam,
  resumablePrompt,
  resumableHeading,
  onDraftChange,
  onQuickAnswer,
  onSubmit,
  onStart,
  onResume,
  onRepeatPrompt,
  onRephrasePrompt,
  onSlowDownPrompt,
  onToggleListening,
  onToggleAutoSpeak,
  translateAiMessage,
}: ConversationViewProps) {
  const [showWhyHelper, setShowWhyHelper] = useState(false)
  const progress = session ? `${session.progress_completed}/${session.progress_total}` : '0/0'
  const isComplete = session?.status === 'completed'
  const currentQuestion = session?.current_question
  const currentPrompt = [localizedQuestion?.text, localizedQuestion?.helperText].filter(Boolean).join('\n')
  const isBooleanQuestion = currentQuestion?.input_type === 'boolean'
  const isChoiceQuestion = currentQuestion?.input_type === 'choice'
  const usesQuickActions = isBooleanQuestion || isChoiceQuestion

  useEffect(() => {
    setShowWhyHelper(false)
  }, [currentQuestion?.id])

  return (
    <section className="panel panel-conversation">
      <div className="panel-header">
        <div>
          <p className="eyebrow">{labels.patientInterview}</p>
          <h2>{labels.patientQuestionnaire}</h2>
        </div>
        <button className="ghost-button" type="button" onClick={onToggleAutoSpeak}>
          {autoSpeak ? labels.voicePromptsOn : labels.voicePromptsOff}
        </button>
      </div>

      {!session ? (
        <div className="empty-state">
          {resumablePrompt ? (
            <div className="resume-callout">
              <p>{labels.resumeHelper}</p>
              <div className="resume-callout-card">
                <span className="composer-label">
                  {resumableHeading ?? labels.nextQuestion}
                </span>
                <strong>{resumablePrompt}</strong>
              </div>
              <div className="composer-actions">
                <button className="primary-button" type="button" onClick={onResume} disabled={busy}>
                  {labels.resumeAssessment}
                </button>
                <button className="ghost-button" type="button" onClick={onStart} disabled={busy}>
                  {labels.startAssessment}
                </button>
              </div>
            </div>
          ) : (
            <>
              <p>
                {busy ? labels.startingAssessmentHelper : labels.startNewAssessmentPrompt}
              </p>
              <button className="primary-button" type="button" onClick={onStart} disabled={busy}>
                {busy ? labels.startingAssessment : labels.startAssessment}
              </button>
            </>
          )}
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
                <p>{entry.speaker === 'ai' ? translateAiMessage(entry.message) : entry.message}</p>
              </article>
            ))}
          </div>

          {!isComplete && session.current_question ? (
            <div className="composer">
              <span className="composer-label">
                {labels.currentPrompt}
              </span>
              <div className="current-question">{currentPrompt}</div>
              {localizedQuestion?.whyText ? (
                <div className="trust-helper-shell">
                  <button
                    className="ghost-button trust-helper-button"
                    type="button"
                    onClick={() => setShowWhyHelper((current) => !current)}
                    disabled={busy}
                  >
                    {showWhyHelper ? labels.hideWhy : labels.whyAsked}
                  </button>
                  {showWhyHelper ? (
                    <div className="trust-helper-card">
                      <p>{localizedQuestion.whyText}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <div className="voice-aid-row">
                <button
                  className="secondary-button voice-aid-button"
                  type="button"
                  onClick={onRepeatPrompt}
                  disabled={busy}
                >
                  {labels.repeatPrompt}
                </button>
                <button
                  className="secondary-button voice-aid-button"
                  type="button"
                  onClick={onRephrasePrompt}
                  disabled={busy}
                >
                  {labels.rephrasePrompt}
                </button>
                <button
                  className="secondary-button voice-aid-button"
                  type="button"
                  onClick={onSlowDownPrompt}
                  disabled={busy}
                >
                  {labels.slowDownPrompt}
                </button>
              </div>

              {usesQuickActions ? (
                <>
                  {isBooleanQuestion ? (
                    <div className="boolean-grid">
                      <button className="quick-answer-button" type="button" onClick={() => onQuickAnswer('Yes')} disabled={busy}>
                        {labels.yes}
                      </button>
                      <button className="quick-answer-button" type="button" onClick={() => onQuickAnswer('No')} disabled={busy}>
                        {labels.no}
                      </button>
                      {currentQuestion?.optional ? (
                        <button className="quick-answer-button subtle" type="button" onClick={() => onQuickAnswer('skip')} disabled={busy}>
                          {labels.skip}
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  {isChoiceQuestion ? (
                    <div className="choice-stack">
                      {localizedQuestion?.options.map((option) => (
                        <button
                          className="choice-card"
                          key={option.value}
                          type="button"
                          onClick={() => onQuickAnswer(option.canonicalLabel)}
                          disabled={busy}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {draftAnswer.trim() ? (
                    <div className="voice-preview">
                      <span className="composer-label">{labels.capturedResponse}</span>
                      <p>{draftAnswer}</p>
                      <div className="composer-actions">
                        <button className="primary-button" type="button" onClick={() => onSubmit()} disabled={busy}>
                          {busy ? labels.saving : labels.submitCapturedResponse}
                        </button>
                        <button className="ghost-button" type="button" onClick={() => onDraftChange('')} disabled={busy}>
                          {labels.clear}
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
                    placeholder={labels.typeOrDictate}
                    rows={5}
                  />

                  <div className="composer-actions">
                    <button className="primary-button" type="button" onClick={() => onSubmit()} disabled={busy || !draftAnswer.trim()}>
                      {busy ? labels.saving : labels.submitResponse}
                    </button>
                    {currentQuestion?.optional ? (
                      <button className="ghost-button" type="button" onClick={() => onQuickAnswer('skip')} disabled={busy}>
                        {labels.skip}
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

              {!isSpeechSupported ? <p className="helper-text">{labels.speechUnsupported}</p> : null}
              <p className="helper-text">
                {labels.policyHelper}
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
