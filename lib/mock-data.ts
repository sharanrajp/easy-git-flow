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

export function getMockDashboardData(): DashboardData {
  return {
    candidates: {
      total: 156,
      unassigned: 23,
      activeInterviews: 12,
      completed: 89,
    },
    pipeline: {
      r1: 18,
      r2: 12,
      r3: 7,
    },
    performance: {
      hired: 15,
      offers: 8,
      rejectionRate: 35,
      avgTimeToHire: 18,
    },
    operations: {
      todayInterviews: 6,
      pendingFeedback: 4,
      activePanelists: 8,
      urgentVacancies: 3,
    },
    recentActivity: [
      {
        message: "New candidate John Smith applied for Senior Developer position",
        time: "2 minutes ago",
        type: "Application",
      },
      {
        message: "Interview scheduled for Sarah Johnson - Frontend Developer",
        time: "15 minutes ago",
        type: "Interview",
      },
      {
        message: "Feedback received from Mike Chen for candidate Alex Rodriguez",
        time: "1 hour ago",
        type: "Feedback",
      },
      {
        message: "Offer sent to Emily Davis for Product Manager role",
        time: "2 hours ago",
        type: "Offer",
      },
      {
        message: "New vacancy created: Backend Developer - Remote",
        time: "3 hours ago",
        type: "Vacancy",
      },
    ],
  }
}

export interface Vacancy {
  id: string
  position_title: string
  department: string
  location: string
  job_type: "full_time" | "part-time" | "contract"
  priority: "P3" | "P2" | "P1" | "P0"
  status: "active" | "paused" | "closed"
  hiring_manager_name: string
  recruiter_name: string
  recruiters?: string[]
  panelists?: string[]
  number_of_vacancies: number
  experienceRange: string
  skills_required: string[]
  job_desc?: string
  interview_type: "Walk-In"
  walkInDetails?: {
    date: string
    location: string
  }
  deadline: string
  postedOn: string
  assignedPanelists: string[]
  applications: number
  shortlisted: number
  interviewed: number
  selected: number
  request_type?: string
  projectClientName?: string
  city?: string
  about_position?: string
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
  interview_type: "Walk-In"
  job_type: "full_time" | "part-time" | "contract"
  source: string
  current_ctc?: string
  expected_ctc?: string
  negotiable?: boolean
  willing_to_relocate?: boolean
  skill_set?: string[]
  resumeUrl?: string
  created_at: string
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
}
