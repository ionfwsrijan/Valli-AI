# Source Notes

## Local source material used

### `Bot.docx`

The concept document established the core product requirements:

- Fully conversational, voice-first interaction
- Word-for-word transcript capture with no summarization or paraphrasing
- Single-page conversation report
- Parallel risk stratification with ASA class, airway prediction, contextual flags, and a consolidated risk level
- Clinician-facing dashboard
- Consent-based assistive airway analysis

### `PAC HISTORY.drawio.pdf`

The PAC flowchart provided the interview structure, especially:

- Demographics and surgical context
- Previous surgery and ICU history
- Major comorbidity blocks such as diabetes, hypertension, asthma, seizures, heart disease, kidney disease, liver disease, and stroke
- Allergy, smoking, alcohol, and family history questions
- Cardiovascular and respiratory review
- STOP-Bang sleep apnea screening
- Fasting questions and airway observation prompts

## External clinical references checked

These were used to keep the prototype framed as decision support and to align the risk sections with current ASA-oriented practice language:

- American Society of Anesthesiologists Practice Advisory for Preanesthesia Evaluation:
  https://www.asahq.org/sitecore%20modules/web/~/media/sites/asahq/files/public/resources/standards-guidelines/practice-advisory-for-preanesthesia-evaluation.pdf
- ASA standards and practice parameters portal:
  https://www.asahq.org/standards-and-practice-parameters

## Important implementation note

The app now uses a hybrid AI stack:

- Rule-based clinical logic for transparent baseline grading
- NLP concept extraction from verbatim free-text history
- A machine-learning classifier for perioperative risk scoring
- A neural-network model for parallel risk estimation

These ML and DL components are trained on synthetic demo data generated inside the project so the system genuinely uses ML, DL, and NLP, while still remaining lightweight enough to run locally. They are not validated diagnostic models. ASA, airway, OSA, and fasting outputs should be treated as assistive prompts for clinician review rather than definitive medical conclusions.
