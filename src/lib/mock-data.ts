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
      total: 285,
      unassigned: 34,
      activeInterviews: 18,
      completed: 167,
    },
    pipeline: {
      r1: 28,
      r2: 19,
      r3: 12,
    },
    performance: {
      hired: 24,
      offers: 15,
      rejectionRate: 28,
      avgTimeToHire: 16,
    },
    operations: {
      todayInterviews: 9,
      pendingFeedback: 7,
      activePanelists: 12,
      urgentVacancies: 5,
    },
    recentActivity: [
      {
        message: "New candidate Christopher Lee applied for Senior Product Manager position",
        time: "3 minutes ago",
        type: "Application",
      },
      {
        message: "Interview completed for Maria Santos - QA Engineer",
        time: "8 minutes ago",
        type: "Interview",
      },
      {
        message: "Candidate Amanda Foster hired for Senior Backend Developer role",
        time: "25 minutes ago",
        type: "Hire",
      },
      {
        message: "Feedback received from Lisa Wang for candidate Thomas Anderson",
        time: "35 minutes ago",
        type: "Feedback",
      },
      {
        message: "Interview scheduled for Kevin Liu - Junior Frontend Developer",
        time: "1 hour ago",
        type: "Interview",
      },
      {
        message: "Offer accepted by Emily Davis for UX Designer position",
        time: "2 hours ago",
        type: "Offer",
      },
      {
        message: "New vacancy created: Security Engineer - Washington DC",
        time: "3 hours ago",
        type: "Vacancy",
      },
      {
        message: "Candidate Rachel Green started r2 interview",
        time: "4 hours ago",
        type: "Interview",
      },
      {
        message: "Bulk upload completed: 15 new candidates added",
        time: "5 hours ago",
        type: "System",
      },
      {
        message: "Panelist Alex Rodriguez completed interview with David Park",
        time: "6 hours ago",
        type: "Feedback",
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
  other_source?: string
  current_ctc?: string
  expected_ctc?: string
  negotiable?: boolean
  willing_to_relocate?: boolean
  skills?: string[]
  skill_set?: string[] // alias for skills
  resume?: string
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
