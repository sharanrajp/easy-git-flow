export interface DashboardData {
  candidates: {
    total: number
    unassigned: number
    activeInterviews: number
    completed: number
  }
  pipeline: {
    r1: number
    r2: number
    r3: number
  }
  performance: {
    hired: number
    offers: number
    rejectionRate: number
    avgTimeToHire: number
  }
  operations: {
    todayInterviews: number
    pendingFeedback: number
    activePanelists: number
    urgentVacancies: number
  }
  recentActivity: Array<{
    message: string
    time: string
    type: string
  }>
}

export interface Position {
  id: string
  position_title: string
  location: string
  job_type: "full_time" | "part-time" | "contract"
  priority: "P3" | "P2" | "P1" | "P0"
  status: "active" | "paused" | "closed"
  hiring_manager_name: string
  recruiter_name: string
  recruiters?: string[]
  panelists?: string[]
  number_of_vacancies: number
  experience_range: string
  skills_required: string[]
  job_desc?: string
  interview_type: "Walk-In" | "Virtual" | "walk-in" | "virtual"
  walkInDetails?: {
    date: string
    location: string
  }
  drive_date?: string
  drive_location?: string
  postedOn: string
  created_at?: string
  assignedPanelists: string[]
  request_type?: string
  projectClientName?: string
  city?: string
  position_approved_by?: string
  category?: string
  plan?: string
}

export interface Candidate {
  id: string
  name: string
  email: string
  phone_number: string
  location: string
  total_experience: string
  notice_period: string
  applied_position: string
  interview_type?: "Walk-In" | "Virtual" | "walk-in" | "virtual"
  job_type: "full_time" | "part-time" | "contract"
  source: string
  other_source?: string
  current_ctc?: string
  expected_ctc?: string
  negotiable_ctc?: boolean
  willing_to_relocate?: boolean
  skills?: string[]
  skill_set?: string[] // alias for skills
  resume?: string
  created_at: string
  offer_released_date?: string
  joined_date?: string
  recruiter_name?: string
  status:
    | "unassigned"
    | "assigned" 
    | "r1-scheduled"
    | "r1-in-progress"
    | "r1-completed"
    | "r2-scheduled"
    | "r2-in-progress"
    | "r2-completed"
    | "r3-scheduled"
    | "r3-in-progress"
    | "r3-completed"
    | "selected"
    | "rejected"
    | "completed"
    | "hired"
  currentRound?: "r1" | "r2" | "r3"
  assignedPanelist?: string
  assignedPanelistId?: string
  interviewDateTime?: string
  waitTime?: string | null
  waitTimeStarted?: string | null
  isCheckedIn?: boolean
  totalWaitTime?: string
  lastUpdated?: number
  jobId?: string
  position?: string
  feedback?: Array<{
    round: "r1" | "r2" | "r3"
    panelist: string
    rating: number
    notes: string
    decision: "selected" | "rejected"
    submittedAt: string
  }>
  // Virtual interview scheduling fields
  scheduled_date?: string
  scheduled_time?: string
  meeting_link?: string
  panel_members?: string[]
  reschedule_reason?: string
}
