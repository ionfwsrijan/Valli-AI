export type AssessmentView = 'home' | 'assessment' | 'camera' | 'report' | 'records'

export interface QuestionOption {
  value: string
  label: string
}

export interface QuestionPayload {
  id: string
  field: string
  text: string
  prompt_text: string
  section: string
  input_type: string
  placeholder?: string | null
  helper_text?: string | null
  optional?: boolean
  options: QuestionOption[]
}

export interface TranscriptEntry {
  speaker: 'ai' | 'patient'
  message: string
  timestamp: string
  question_id?: string | null
}

export interface SessionSnapshot {
  session_id: string
  status: string
  current_question: QuestionPayload | null
  progress_completed: number
  progress_total: number
  transcript: TranscriptEntry[]
  answers: Record<string, unknown>
  risk_snapshot: {
    bmi?: number | null
    asa_class?: string
    asa_rationale?: string[]
    airway_risk?: string
    airway_score?: number
    airway_reasons?: string[]
    stop_bang_score?: number
    stop_bang_risk?: string
    stop_bang_positive_items?: string[]
    risk_flags?: string[]
    baseline_rule_risk?: string
    consolidated_risk?: string
    present_conditions?: string[]
    ml_prediction?: {
      label: string
      confidence: number
      probabilities: Array<{
        label: string
        probability: number
      }>
    }
    dl_prediction?: {
      label: string
      confidence: number
      probabilities: Array<{
        label: string
        probability: number
      }>
    }
    ai_consensus?: {
      label: string
      confidence: number
      elevated_rule_risk?: boolean
      probabilities: Array<{
        label: string
        probability: number
      }>
    }
    nlp_insights?: {
      source_text_length: number
      category_counts: Record<string, number>
      detected_concepts: string[]
      red_flag_terms: string[]
      medication_mentions: string[]
    }
    vision_airway?: VisionAirwayAssessment | null
    ai_feature_highlights?: string[]
    clinical_note?: string
  }
}

export interface DashboardItem {
  session_id: string
  patient_name?: string | null
  proposed_procedure?: string | null
  updated_at: string
  consolidated_risk?: string | null
  asa_class?: string | null
  status: string
}

export interface SessionReport {
  session_id: string
  status: string
  patient_summary: Record<string, unknown>
  answers: Record<string, unknown>
  transcript: TranscriptEntry[]
  risk_assessment: SessionSnapshot['risk_snapshot']
  created_at: string
  updated_at: string
}

export interface VisionAirwayCue {
  name: string
  value: number
  interpretation: string
}

export interface VisionAirwayMetric {
  key: string
  label: string
  value: number
  finding: string
  interpretation: string
}

export interface VisionAirwayCapture {
  capture_type: 'frontal' | 'profile'
  status: string
  quality_score: number
  quality_grade: string
  quality_components: Record<string, number>
  confidence: number
  derived_flags: string[]
  metrics?: VisionAirwayMetric[]
  supporting_cues: VisionAirwayCue[]
  summary: string
}

export interface VisionAirwayAssessment {
  model_name: string
  status: string
  analyzed_at: string
  images_persisted: boolean
  disclaimer: string
  captures: Partial<Record<'frontal' | 'profile', VisionAirwayCapture>>
  overall: {
    status: string
    label: string
    bucket: string
    confidence: number
    quality_score: number
    derived_flags: string[]
    supporting_cues: VisionAirwayCue[]
    note: string
  }
}
