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
  recruiter?: string
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

export function getMockCandidates(): Candidate[] {
  return [
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@email.com",
      phone_number: "+1-555-0101",
      location: "San Francisco, CA",
      total_experience: "4 years",
      notice_period: "2 weeks",
      applied_position: "Senior Frontend Developer",
      interview_type: "Walk-In",
      job_type: "full_time",
      source: "LinkedIn",
      current_ctc: "$95,000",
      expected_ctc: "$110,000",
      negotiable: true,
      willing_to_relocate: false,
      skill_set: ["React", "TypeScript", "Next.js", "Node.js"],
      created_at: "2024-01-10",
      status: "unassigned",
      recruiter: "Sarah Johnson",
    waitTime: "2 days",
    waitTimeStarted: null,
    },
    {
      id: "2",
      name: "Sarah Wilson",
      email: "sarah.wilson@email.com",
      phone_number: "+1-555-0102",
      location: "New York, NY",
      total_experience: "3 years",
      notice_period: "1 month",
      applied_position: "Backend Developer",
      interview_type: "Walk-In",
      job_type: "full_time",
      source: "Company Website",
      current_ctc: "$85,000",
      expected_ctc: "$100,000",
      negotiable: false,
      willing_to_relocate: true,
      skill_set: ["Python", "Django", "PostgreSQL", "AWS"],
      created_at: "2024-01-08",
      status: "r1-scheduled",
      currentRound: "r1",
      assignedPanelist: "Mike Chen",
      interviewDateTime: "2024-01-15T10:00:00",
      recruiter: "Sarah Johnson",
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily.davis@email.com",
      phone_number: "+1-555-0104",
      location: "Seattle, WA",
      total_experience: "2 years",
      notice_period: "2 weeks",
      applied_position: "UX Designer",
      interview_type: "Walk-In",
      job_type: "contract",
      source: "Job Board",
      current_ctc: "$70,000",
      expected_ctc: "$85,000",
      negotiable: true,
      willing_to_relocate: false,
      skill_set: ["Figma", "User Research", "Prototyping", "Design Systems"],
      created_at: "2024-01-12",
      status: "r2-completed",
      currentRound: "r2",
      assignedPanelist: "Lisa Wang",
      interviewDateTime: "2024-01-16T14:00:00",
      recruiter: "Sarah Johnson",
    },
    {
      id: "6",
      name: "Jessica Martinez",
      email: "jessica.martinez@email.com",
      phone_number: "+1-555-0106",
      location: "Chicago, IL",
      total_experience: "3 years",
      notice_period: "2 weeks",
      applied_position: "Frontend Developer",
      interview_type: "Walk-In",
      job_type: "full_time",
      source: "LinkedIn",
      current_ctc: "$75,000",
      expected_ctc: "$90,000",
      negotiable: true,
      willing_to_relocate: false,
      skill_set: ["React", "JavaScript", "CSS", "HTML", "Git"],
      created_at: "2024-01-07",
      status: "rejected",
      currentRound: "r2",
      recruiter: "Sarah Johnson",
      totalWaitTime: "10 days",
      feedback: [
        {
          round: "r1",
          panelist: "Mike Chen",
          rating: 3,
          notes: "Good technical skills but needs improvement in problem-solving approach.",
          decision: "selected",
          submittedAt: "2024-01-11T10:30:00",
        },
        {
          round: "r2",
          panelist: "Lisa Wang",
          rating: 2,
          notes: "Struggled with advanced React concepts and system design questions.",
          decision: "rejected",
          submittedAt: "2024-01-15T15:45:00",
        },
      ],
    },
    {
      id: "7",
      name: "Robert Chen",
      email: "robert.chen@email.com",
      phone_number: "+1-555-0107",
      location: "Boston, MA",
      total_experience: "4 years",
      notice_period: "3 weeks",
      applied_position: "Backend Developer",
      interview_type: "Walk-In",
      job_type: "full_time",
      source: "Company Website",
      current_ctc: "$88,000",
      expected_ctc: "$105,000",
      negotiable: false,
      willing_to_relocate: true,
      skill_set: ["Node.js", "Express", "MongoDB", "Redis", "GraphQL"],
      created_at: "2024-01-06",
      status: "selected",
      currentRound: "r3",
      recruiter: "Sarah Johnson",
      totalWaitTime: "14 days",
      feedback: [
        {
          round: "r1",
          panelist: "Alex Rodriguez",
          rating: 4,
          notes: "Strong backend development skills and good understanding of system architecture.",
          decision: "selected",
          submittedAt: "2024-01-10T14:00:00",
        },
        {
          round: "r2",
          panelist: "Mike Chen",
          rating: 4,
          notes: "Excellent coding skills and problem-solving abilities. Good cultural fit.",
          decision: "selected",
          submittedAt: "2024-01-13T16:30:00",
        },
        {
          round: "r3",
          panelist: "Emily Davis",
          rating: 5,
          notes: "Outstanding performance in final round. Strong leadership potential and technical expertise.",
          decision: "selected",
          submittedAt: "2024-01-17T11:15:00",
        },
      ],
    },
  ]
}
