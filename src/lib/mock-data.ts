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
      skills: ["React", "TypeScript", "Next.js", "Node.js"],
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
      skills: ["Python", "Django", "PostgreSQL", "AWS"],
      created_at: "2024-01-08",
      status: "r1-scheduled",
      currentRound: "r1",
      assignedPanelist: "Mike Chen",
      interviewDateTime: "2024-01-15T10:00:00",
      recruiter: "Sarah Johnson",
    },
    {
      id: "3",
      name: "Michael Thompson",
      email: "michael.thompson@email.com",
      phone_number: "+1-555-0103",
      location: "Austin, TX",
      total_experience: "5 years",
      notice_period: "3 weeks",
      applied_position: "Full Stack Developer",
      interview_type: "Walk-In",
      job_type: "full_time",
      source: "Referral",
      current_ctc: "$105,000",
      expected_ctc: "$125,000",
      negotiable: true,
      willing_to_relocate: false,
      skills: ["React", "Node.js", "MongoDB", "GraphQL"],
      created_at: "2024-01-09",
      status: "r1-in-progress",
      currentRound: "r1",
      assignedPanelist: "Alex Rodriguez",
      interviewDateTime: "2024-01-15T14:00:00",
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
      skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
      created_at: "2024-01-12",
      status: "r2-completed",
      currentRound: "r2",
      assignedPanelist: "Lisa Wang",
      interviewDateTime: "2024-01-16T14:00:00",
      recruiter: "Sarah Johnson",
    },
    {
      id: "5",
      name: "David Park",
      email: "david.park@email.com",
      phone_number: "+1-555-0105",
      location: "Los Angeles, CA",
      total_experience: "6 years",
      notice_period: "1 month",
      applied_position: "DevOps Engineer",
      interview_type: "Walk-In",
      job_type: "full_time",
      source: "LinkedIn",
      current_ctc: "$120,000",
      expected_ctc: "$140,000",
      negotiable: false,
      willing_to_relocate: true,
      skills: ["Docker", "Kubernetes", "AWS", "Terraform", "Jenkins"],
      created_at: "2024-01-06",
      status: "r3-scheduled",
      currentRound: "r3",
      assignedPanelist: "David Kim",
      interviewDateTime: "2024-01-17T10:00:00",
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
      skills: ["React", "JavaScript", "CSS", "HTML", "Git"],
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
      skills: ["Node.js", "Express", "MongoDB", "Redis", "GraphQL"],
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
    {
      id: "8",
      name: "Amanda Foster",
      email: "amanda.foster@email.com",
      phone_number: "+1-555-0108",
      location: "Denver, CO",
      total_experience: "7 years",
      notice_period: "1 month",
      applied_position: "Senior Backend Developer",
      interview_type: "Walk-In",
      job_type: "full_time",
      source: "Referral",
      current_ctc: "$130,000",
      expected_ctc: "$150,000",
      negotiable: true,
      willing_to_relocate: false,
      skills: ["Java", "Spring Boot", "Microservices", "Kafka", "Redis"],
      created_at: "2024-01-05",
      status: "hired",
      currentRound: "r3",
      recruiter: "Sarah Johnson",
      totalWaitTime: "16 days",
      feedback: [
        {
          round: "r1",
          panelist: "Lisa Wang",
          rating: 5,
          notes: "Exceptional technical knowledge and system design skills.",
          decision: "selected",
          submittedAt: "2024-01-09T09:00:00",
        },
        {
          round: "r2",
          panelist: "Alex Rodriguez",
          rating: 5,
          notes: "Outstanding problem-solving and architecture understanding.",
          decision: "selected",
          submittedAt: "2024-01-12T14:00:00",
        },
        {
          round: "r3",
          panelist: "David Kim",
          rating: 5,
          notes: "Perfect fit for senior role. Strong leadership and mentoring capabilities.",
          decision: "selected",
          submittedAt: "2024-01-16T16:00:00",
        },
      ],
    },
    {
      id: "9",
      name: "Kevin Liu",
      email: "kevin.liu@email.com",
      phone_number: "+1-555-0109",
      location: "Portland, OR",
      total_experience: "2 years",
      notice_period: "2 weeks",
      applied_position: "Junior Frontend Developer",
      interview_type: "Walk-In",
      job_type: "full_time",
      source: "University Career Fair",
      current_ctc: "$65,000",
      expected_ctc: "$75,000",
      negotiable: true,
      willing_to_relocate: true,
      skills: ["React", "JavaScript", "HTML", "CSS", "Git"],
      created_at: "2024-01-11",
      status: "assigned",
      recruiter: "Sarah Johnson",
      waitTime: "4 days",
      waitTimeStarted: "2024-01-11T09:00:00",
    },
    {
      id: "10",
      name: "Rachel Green",
      email: "rachel.green@email.com",
      phone_number: "+1-555-0110",
      location: "Miami, FL",
      total_experience: "5 years",
      notice_period: "3 weeks",
      applied_position: "Product Manager",
      interview_type: "Walk-In",
      job_type: "full_time",
      source: "LinkedIn",
      current_ctc: "$115,000",
      expected_ctc: "$135,000",
      negotiable: false,
      willing_to_relocate: false,
      skills: ["Product Strategy", "Analytics", "Agile", "Roadmapping", "Stakeholder Management"],
      created_at: "2024-01-04",
      status: "r2-in-progress",
      currentRound: "r2",
      assignedPanelist: "Emily Davis",
      interviewDateTime: "2024-01-15T11:00:00",
      recruiter: "Sarah Johnson",
    },
    {
      id: "11",
      name: "Thomas Anderson",
      email: "thomas.anderson@email.com",
      phone_number: "+1-555-0111",
      location: "Atlanta, GA",
      total_experience: "8 years",
      notice_period: "1 month",
      applied_position: "Engineering Manager",
      interview_type: "Walk-In",
      job_type: "full_time",
      source: "Company Website",
      current_ctc: "$155,000",
      expected_ctc: "$175,000",
      negotiable: true,
      willing_to_relocate: true,
      skills: ["Team Leadership", "System Architecture", "Node.js", "AWS", "DevOps"],
      created_at: "2024-01-03",
      status: "r3-completed",
      currentRound: "r3",
      assignedPanelist: "David Kim",
      interviewDateTime: "2024-01-14T15:00:00",
      recruiter: "Sarah Johnson",
    },
    {
      id: "12",
      name: "Sophia Rodriguez",
      email: "sophia.rodriguez@email.com",
      phone_number: "+1-555-0112",
      location: "Phoenix, AZ",
      total_experience: "3 years",
      notice_period: "2 weeks",
      applied_position: "UI/UX Designer",
      interview_type: "Walk-In",
      job_type: "contract",
      source: "Design Portfolio Site",
      current_ctc: "$72,000",
      expected_ctc: "$85,000",
      negotiable: true,
      willing_to_relocate: false,
      skills: ["Figma", "Sketch", "Adobe Creative Suite", "User Research", "Wireframing"],
      created_at: "2024-01-13",
      status: "unassigned",
      recruiter: "Sarah Johnson",
      waitTime: "1 day",
      waitTimeStarted: null,
    },
    {
      id: "13",
      name: "James Wilson",
      email: "james.wilson@email.com",
      phone_number: "+1-555-0113",
      location: "Dallas, TX",
      total_experience: "6 years",
      notice_period: "3 weeks",
      applied_position: "Data Engineer",
      interview_type: "Walk-In",
      job_type: "full_time",
      source: "Tech Meetup",
      current_ctc: "$110,000",
      expected_ctc: "$130,000",
      negotiable: false,
      willing_to_relocate: false,
      skills: ["Python", "Apache Spark", "Kafka", "Snowflake", "dbt"],
      created_at: "2024-01-02",
      status: "completed",
      currentRound: "r2",
      recruiter: "Sarah Johnson",
      totalWaitTime: "12 days",
      feedback: [
        {
          round: "r1",
          panelist: "Alex Rodriguez",
          rating: 4,
          notes: "Strong data engineering background with good pipeline design skills.",
          decision: "selected",
          submittedAt: "2024-01-08T10:00:00",
        },
        {
          round: "r2",
          panelist: "Lisa Wang",
          rating: 3,
          notes: "Good technical skills but limited total_experience with our tech stack.",
          decision: "rejected",
          submittedAt: "2024-01-11T14:00:00",
        },
      ],
    },
    {
      id: "14",
      name: "Maria Santos",
      email: "maria.santos@email.com",
      phone_number: "+1-555-0114",
      location: "San Diego, CA",
      total_experience: "4 years",
      notice_period: "2 weeks",
      applied_position: "QA Engineer",
      interview_type: "Walk-In",
      job_type: "full_time",
      source: "Job Board",
      current_ctc: "$80,000",
      expected_ctc: "$95,000",
      negotiable: true,
      willing_to_relocate: true,
      skills: ["Selenium", "Cypress", "Jest", "API Testing", "Test Automation"],
      created_at: "2024-01-14",
      status: "r1-completed",
      currentRound: "r1",
      assignedPanelist: "Mike Chen",
      interviewDateTime: "2024-01-15T09:00:00",
      recruiter: "Sarah Johnson",
    },
    {
      id: "15",
      name: "Christopher Lee",
      email: "christopher.lee@email.com",
      phone_number: "+1-555-0115",
      location: "Nashville, TN",
      total_experience: "9 years",
      notice_period: "1 month",
      applied_position: "Senior Product Manager",
      interview_type: "Walk-In",
      job_type: "full_time",
      source: "Executive Recruiter",
      current_ctc: "$140,000",
      expected_ctc: "$165,000",
      negotiable: false,
      willing_to_relocate: false,
      skills: ["Product Strategy", "Data Analytics", "A/B Testing", "Growth Hacking", "Team Leadership"],
      created_at: "2024-01-01",
      status: "selected",
      currentRound: "r3",
      recruiter: "Sarah Johnson",
      totalWaitTime: "18 days",
      feedback: [
        {
          round: "r1",
          panelist: "Mike Chen",
          rating: 5,
          notes: "Exceptional product vision and strategic thinking capabilities.",
          decision: "selected",
          submittedAt: "2024-01-07T11:00:00",
        },
        {
          round: "r2",
          panelist: "Emily Davis",
          rating: 5,
          notes: "Outstanding leadership skills and data-driven approach.",
          decision: "selected",
          submittedAt: "2024-01-10T15:00:00",
        },
        {
          round: "r3",
          panelist: "David Kim",
          rating: 5,
          notes: "Perfect fit for senior PM role. Excellent stakeholder management skills.",
          decision: "selected",
          submittedAt: "2024-01-15T10:00:00",
        },
      ],
    },
  ]
}
