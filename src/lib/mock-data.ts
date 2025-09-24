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
        message: "Candidate Rachel Green started R2 interview",
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
  skills: string[]
  jobDescription?: string
  interview_type: "Walk-In"[]
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
  aboutPosition?: string
}

export function getMockVacancies(): Vacancy[] {
  return [
    {
      id: "1",
      position_title: "Senior Frontend Developer",
      department: "Engineering",
      location: "San Francisco, CA",
      job_type: "full_time",
      priority: "P1",
      status: "active",
      hiring_manager_name: "Emily Davis",
      recruiter_name: "Sarah Johnson",
      number_of_vacancies: 2,
      experienceRange: "3-5 years",
      skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
      interview_type: ["Walk-In"],
      walkInDetails: {
        date: "2024-01-15",
        location: "Main Office, Floor 3",
      },
      deadline: "2024-01-30",
      postedOn: "2024-01-01",
      assignedPanelists: ["2", "4"],
      applications: 45,
      shortlisted: 12,
      interviewed: 8,
      selected: 2,
    },
    {
      id: "2",
      position_title: "Backend Developer",
      department: "Engineering",
      location: "Remote",
      job_type: "full_time",
      priority: "P2",
      status: "active",
      hiring_manager_name: "David Kim",
      recruiter_name: "Sarah Johnson",
      number_of_vacancies: 1,
      experienceRange: "2-4 years",
      skills: ["Node.js", "Python", "PostgreSQL", "AWS"],
      interview_type: ["Walk-In"],
      deadline: "2024-02-15",
      postedOn: "2024-01-05",
      assignedPanelists: ["4", "5"],
      applications: 32,
      shortlisted: 8,
      interviewed: 5,
      selected: 1,
    },
    {
      id: "3",
      position_title: "Product Manager",
      department: "Product",
      location: "New York, NY",
      job_type: "full_time",
      priority: "P0",
      status: "active",
      hiring_manager_name: "Emily Davis",
      recruiter_name: "Sarah Johnson",
      number_of_vacancies: 1,
      experienceRange: "5-7 years",
      skills: ["Product Strategy", "Analytics", "User Research", "Agile"],
      interview_type: ["Walk-In"],
      deadline: "2024-01-20",
      postedOn: "2023-12-20",
      assignedPanelists: ["3", "6"],
      applications: 28,
      shortlisted: 6,
      interviewed: 4,
      selected: 0,
    },
    {
      id: "4",
      position_title: "UX Designer",
      department: "Design",
      location: "Austin, TX",
      job_type: "contract",
      priority: "P2",
      status: "paused",
      hiring_manager_name: "Lisa Wang",
      recruiter_name: "Sarah Johnson",
      number_of_vacancies: 1,
      experienceRange: "2-4 years",
      skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
      interview_type: ["Walk-In"],
      deadline: "2024-02-28",
      postedOn: "2024-01-10",
      assignedPanelists: ["2"],
      applications: 18,
      shortlisted: 4,
      interviewed: 2,
      selected: 0,
    },
    {
      id: "5",
      position_title: "DevOps Engineer",
      department: "Engineering",
      location: "Seattle, WA",
      job_type: "full_time",
      priority: "P1",
      status: "active",
      hiring_manager_name: "Alex Rodriguez",
      recruiter_name: "Sarah Johnson",
      number_of_vacancies: 1,
      experienceRange: "4-6 years",
      skills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform"],
      interview_type: ["Walk-In"],
      walkInDetails: {
        date: "2024-01-25",
        location: "Seattle Office, Conference Room A",
      },
      deadline: "2024-02-10",
      postedOn: "2024-01-08",
      assignedPanelists: ["4", "5"],
      applications: 22,
      shortlisted: 7,
      interviewed: 3,
      selected: 1,
    },
    {
      id: "6",
      position_title: "Full Stack Developer",
      department: "Engineering",
      location: "Chicago, IL",
      job_type: "full_time",
      priority: "P1",
      status: "active",
      hiring_manager_name: "Mike Chen",
      recruiter_name: "Sarah Johnson",
      number_of_vacancies: 3,
      experienceRange: "3-6 years",
      skills: ["React", "Node.js", "MongoDB", "GraphQL", "AWS"],
      interview_type: ["Walk-In"],
      deadline: "2024-02-20",
      postedOn: "2024-01-12",
      assignedPanelists: ["2", "4", "5"],
      applications: 67,
      shortlisted: 15,
      interviewed: 9,
      selected: 2,
    },
    {
      id: "7",
      position_title: "Data Engineer",
      department: "Data Science",
      location: "Remote",
      job_type: "full_time",
      priority: "P2",
      status: "active",
      hiring_manager_name: "Lisa Wang",
      recruiter_name: "Sarah Johnson",
      number_of_vacancies: 2,
      experienceRange: "4-7 years",
      skills: ["Python", "Apache Spark", "Kafka", "Snowflake", "dbt"],
      interview_type: ["Walk-In"],
      deadline: "2024-03-01",
      postedOn: "2024-01-14",
      assignedPanelists: ["4", "6"],
      applications: 41,
      shortlisted: 10,
      interviewed: 6,
      selected: 1,
    },
    {
      id: "8",
      position_title: "QA Engineer",
      department: "Engineering",
      location: "Denver, CO",
      job_type: "full_time",
      priority: "P3",
      status: "active",
      hiring_manager_name: "Alex Rodriguez",
      recruiter_name: "Sarah Johnson",
      number_of_vacancies: 1,
      experienceRange: "2-5 years",
      skills: ["Selenium", "Cypress", "Jest", "API Testing", "Test Automation"],
      interview_type: ["Walk-In"],
      deadline: "2024-02-25",
      postedOn: "2024-01-11",
      assignedPanelists: ["2", "4"],
      applications: 29,
      shortlisted: 7,
      interviewed: 4,
      selected: 0,
    },
    {
      id: "9",
      position_title: "Engineering Manager",
      department: "Engineering",
      location: "San Francisco, CA",
      job_type: "full_time",
      priority: "P0",
      status: "active",
      hiring_manager_name: "David Kim",
      recruiter_name: "Sarah Johnson",
      number_of_vacancies: 1,
      experienceRange: "7-10 years",
      skills: ["Team Leadership", "System Architecture", "Agile", "Strategic Planning"],
      interview_type: ["Walk-In"],
      deadline: "2024-01-25",
      postedOn: "2023-12-28",
      assignedPanelists: ["3", "6"],
      applications: 35,
      shortlisted: 8,
      interviewed: 5,
      selected: 1,
    },
    {
      id: "10",
      position_title: "Senior Product Manager",
      department: "Product",
      location: "Austin, TX",
      job_type: "full_time",
      priority: "P1",
      status: "active",
      hiring_manager_name: "Emily Davis",
      recruiter_name: "Sarah Johnson",
      number_of_vacancies: 1,
      experienceRange: "6-9 years",
      skills: ["Product Strategy", "Data Analytics", "A/B Testing", "Growth Hacking"],
      interview_type: ["Walk-In"],
      deadline: "2024-02-05",
      postedOn: "2024-01-02",
      assignedPanelists: ["3", "6"],
      applications: 23,
      shortlisted: 5,
      interviewed: 3,
      selected: 1,
    },
    {
      id: "11",
      position_title: "Mobile Developer (iOS)",
      department: "Engineering",
      location: "Los Angeles, CA",
      job_type: "full_time",
      priority: "P2",
      status: "closed",
      hiring_manager_name: "Mike Chen",
      recruiter_name: "Sarah Johnson",
      number_of_vacancies: 1,
      experienceRange: "4-6 years",
      skills: ["Swift", "SwiftUI", "iOS SDK", "Core Data", "Unit Testing"],
      interview_type: ["Walk-In"],
      deadline: "2024-01-15",
      postedOn: "2023-12-15",
      assignedPanelists: ["2", "5"],
      applications: 38,
      shortlisted: 9,
      interviewed: 6,
      selected: 1,
    },
    {
      id: "12",
      position_title: "Security Engineer",
      department: "Security",
      location: "Washington, DC",
      job_type: "full_time",
      priority: "P1",
      status: "active",
      hiring_manager_name: "Alex Rodriguez",
      recruiter_name: "Sarah Johnson",
      number_of_vacancies: 1,
      experienceRange: "5-8 years",
      skills: ["Cybersecurity", "Penetration Testing", "SIEM", "Cloud Security", "Compliance"],
      interview_type: ["Walk-In"],
      deadline: "2024-02-28",
      postedOn: "2024-01-13",
      assignedPanelists: ["4", "6"],
      applications: 19,
      shortlisted: 4,
      interviewed: 2,
      selected: 0,
    },
  ]
}

export interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  location: string
  experience: string
  noticePeriod: string
  appliedPosition: string
  interviewType: "Walk-In"
  job_type: "full_time" | "part-time" | "contract"
  source: string
  currentCTC?: string
  expectedCTC?: string
  negotiable?: boolean
  relocation?: boolean
  skills?: string[]
  resumeUrl?: string
  appliedDate: string
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
  currentRound?: "R1" | "R2" | "R3"
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
    round: "R1" | "R2" | "R3"
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
      phone: "+1-555-0101",
      location: "San Francisco, CA",
      experience: "4 years",
      noticePeriod: "2 weeks",
      appliedPosition: "Senior Frontend Developer",
      interviewType: "Walk-In",
      job_type: "full_time",
      source: "LinkedIn",
      currentCTC: "$95,000",
      expectedCTC: "$110,000",
      negotiable: true,
      relocation: false,
      skills: ["React", "TypeScript", "Next.js", "Node.js"],
      appliedDate: "2024-01-10",
      status: "unassigned",
      recruiter: "Sarah Johnson",
      waitTime: "2 days",
      waitTimeStarted: null,
    },
    {
      id: "2",
      name: "Sarah Wilson",
      email: "sarah.wilson@email.com",
      phone: "+1-555-0102",
      location: "New York, NY",
      experience: "3 years",
      noticePeriod: "1 month",
      appliedPosition: "Backend Developer",
      interviewType: "Walk-In",
      job_type: "full_time",
      source: "Company Website",
      currentCTC: "$85,000",
      expectedCTC: "$100,000",
      negotiable: false,
      relocation: true,
      skills: ["Python", "Django", "PostgreSQL", "AWS"],
      appliedDate: "2024-01-08",
      status: "r1-scheduled",
      currentRound: "R1",
      assignedPanelist: "Mike Chen",
      interviewDateTime: "2024-01-15T10:00:00",
      recruiter: "Sarah Johnson",
    },
    {
      id: "3",
      name: "Michael Thompson",
      email: "michael.thompson@email.com",
      phone: "+1-555-0103",
      location: "Austin, TX",
      experience: "5 years",
      noticePeriod: "3 weeks",
      appliedPosition: "Full Stack Developer",
      interviewType: "Walk-In",
      job_type: "full_time",
      source: "Referral",
      currentCTC: "$105,000",
      expectedCTC: "$125,000",
      negotiable: true,
      relocation: false,
      skills: ["React", "Node.js", "MongoDB", "GraphQL"],
      appliedDate: "2024-01-09",
      status: "r1-in-progress",
      currentRound: "R1",
      assignedPanelist: "Alex Rodriguez",
      interviewDateTime: "2024-01-15T14:00:00",
      recruiter: "Sarah Johnson",
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily.davis@email.com",
      phone: "+1-555-0104",
      location: "Seattle, WA",
      experience: "2 years",
      noticePeriod: "2 weeks",
      appliedPosition: "UX Designer",
      interviewType: "Walk-In",
      job_type: "contract",
      source: "Job Board",
      currentCTC: "$70,000",
      expectedCTC: "$85,000",
      negotiable: true,
      relocation: false,
      skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
      appliedDate: "2024-01-12",
      status: "r2-completed",
      currentRound: "R2",
      assignedPanelist: "Lisa Wang",
      interviewDateTime: "2024-01-16T14:00:00",
      recruiter: "Sarah Johnson",
    },
    {
      id: "5",
      name: "David Park",
      email: "david.park@email.com",
      phone: "+1-555-0105",
      location: "Los Angeles, CA",
      experience: "6 years",
      noticePeriod: "1 month",
      appliedPosition: "DevOps Engineer",
      interviewType: "Walk-In",
      job_type: "full_time",
      source: "LinkedIn",
      currentCTC: "$120,000",
      expectedCTC: "$140,000",
      negotiable: false,
      relocation: true,
      skills: ["Docker", "Kubernetes", "AWS", "Terraform", "Jenkins"],
      appliedDate: "2024-01-06",
      status: "r3-scheduled",
      currentRound: "R3",
      assignedPanelist: "David Kim",
      interviewDateTime: "2024-01-17T10:00:00",
      recruiter: "Sarah Johnson",
    },
    {
      id: "6",
      name: "Jessica Martinez",
      email: "jessica.martinez@email.com",
      phone: "+1-555-0106",
      location: "Chicago, IL",
      experience: "3 years",
      noticePeriod: "2 weeks",
      appliedPosition: "Frontend Developer",
      interviewType: "Walk-In",
      job_type: "full_time",
      source: "LinkedIn",
      currentCTC: "$75,000",
      expectedCTC: "$90,000",
      negotiable: true,
      relocation: false,
      skills: ["React", "JavaScript", "CSS", "HTML", "Git"],
      appliedDate: "2024-01-07",
      status: "rejected",
      currentRound: "R2",
      recruiter: "Sarah Johnson",
      totalWaitTime: "10 days",
      feedback: [
        {
          round: "R1",
          panelist: "Mike Chen",
          rating: 3,
          notes: "Good technical skills but needs improvement in problem-solving approach.",
          decision: "selected",
          submittedAt: "2024-01-11T10:30:00",
        },
        {
          round: "R2",
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
      phone: "+1-555-0107",
      location: "Boston, MA",
      experience: "4 years",
      noticePeriod: "3 weeks",
      appliedPosition: "Backend Developer",
      interviewType: "Walk-In",
      job_type: "full_time",
      source: "Company Website",
      currentCTC: "$88,000",
      expectedCTC: "$105,000",
      negotiable: false,
      relocation: true,
      skills: ["Node.js", "Express", "MongoDB", "Redis", "GraphQL"],
      appliedDate: "2024-01-06",
      status: "selected",
      currentRound: "R3",
      recruiter: "Sarah Johnson",
      totalWaitTime: "14 days",
      feedback: [
        {
          round: "R1",
          panelist: "Alex Rodriguez",
          rating: 4,
          notes: "Strong backend development skills and good understanding of system architecture.",
          decision: "selected",
          submittedAt: "2024-01-10T14:00:00",
        },
        {
          round: "R2",
          panelist: "Mike Chen",
          rating: 4,
          notes: "Excellent coding skills and problem-solving abilities. Good cultural fit.",
          decision: "selected",
          submittedAt: "2024-01-13T16:30:00",
        },
        {
          round: "R3",
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
      phone: "+1-555-0108",
      location: "Denver, CO",
      experience: "7 years",
      noticePeriod: "1 month",
      appliedPosition: "Senior Backend Developer",
      interviewType: "Walk-In",
      job_type: "full_time",
      source: "Referral",
      currentCTC: "$130,000",
      expectedCTC: "$150,000",
      negotiable: true,
      relocation: false,
      skills: ["Java", "Spring Boot", "Microservices", "Kafka", "Redis"],
      appliedDate: "2024-01-05",
      status: "hired",
      currentRound: "R3",
      recruiter: "Sarah Johnson",
      totalWaitTime: "16 days",
      feedback: [
        {
          round: "R1",
          panelist: "Lisa Wang",
          rating: 5,
          notes: "Exceptional technical knowledge and system design skills.",
          decision: "selected",
          submittedAt: "2024-01-09T09:00:00",
        },
        {
          round: "R2",
          panelist: "Alex Rodriguez",
          rating: 5,
          notes: "Outstanding problem-solving and architecture understanding.",
          decision: "selected",
          submittedAt: "2024-01-12T14:00:00",
        },
        {
          round: "R3",
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
      phone: "+1-555-0109",
      location: "Portland, OR",
      experience: "2 years",
      noticePeriod: "2 weeks",
      appliedPosition: "Junior Frontend Developer",
      interviewType: "Walk-In",
      job_type: "full_time",
      source: "University Career Fair",
      currentCTC: "$65,000",
      expectedCTC: "$75,000",
      negotiable: true,
      relocation: true,
      skills: ["React", "JavaScript", "HTML", "CSS", "Git"],
      appliedDate: "2024-01-11",
      status: "assigned",
      recruiter: "Sarah Johnson",
      waitTime: "4 days",
      waitTimeStarted: "2024-01-11T09:00:00",
    },
    {
      id: "10",
      name: "Rachel Green",
      email: "rachel.green@email.com",
      phone: "+1-555-0110",
      location: "Miami, FL",
      experience: "5 years",
      noticePeriod: "3 weeks",
      appliedPosition: "Product Manager",
      interviewType: "Walk-In",
      job_type: "full_time",
      source: "LinkedIn",
      currentCTC: "$115,000",
      expectedCTC: "$135,000",
      negotiable: false,
      relocation: false,
      skills: ["Product Strategy", "Analytics", "Agile", "Roadmapping", "Stakeholder Management"],
      appliedDate: "2024-01-04",
      status: "r2-in-progress",
      currentRound: "R2",
      assignedPanelist: "Emily Davis",
      interviewDateTime: "2024-01-15T11:00:00",
      recruiter: "Sarah Johnson",
    },
    {
      id: "11",
      name: "Thomas Anderson",
      email: "thomas.anderson@email.com",
      phone: "+1-555-0111",
      location: "Atlanta, GA",
      experience: "8 years",
      noticePeriod: "1 month",
      appliedPosition: "Engineering Manager",
      interviewType: "Walk-In",
      job_type: "full_time",
      source: "Company Website",
      currentCTC: "$155,000",
      expectedCTC: "$175,000",
      negotiable: true,
      relocation: true,
      skills: ["Team Leadership", "System Architecture", "Node.js", "AWS", "DevOps"],
      appliedDate: "2024-01-03",
      status: "r3-completed",
      currentRound: "R3",
      assignedPanelist: "David Kim",
      interviewDateTime: "2024-01-14T15:00:00",
      recruiter: "Sarah Johnson",
    },
    {
      id: "12",
      name: "Sophia Rodriguez",
      email: "sophia.rodriguez@email.com",
      phone: "+1-555-0112",
      location: "Phoenix, AZ",
      experience: "3 years",
      noticePeriod: "2 weeks",
      appliedPosition: "UI/UX Designer",
      interviewType: "Walk-In",
      job_type: "contract",
      source: "Design Portfolio Site",
      currentCTC: "$72,000",
      expectedCTC: "$85,000",
      negotiable: true,
      relocation: false,
      skills: ["Figma", "Sketch", "Adobe Creative Suite", "User Research", "Wireframing"],
      appliedDate: "2024-01-13",
      status: "unassigned",
      recruiter: "Sarah Johnson",
      waitTime: "1 day",
      waitTimeStarted: null,
    },
    {
      id: "13",
      name: "James Wilson",
      email: "james.wilson@email.com",
      phone: "+1-555-0113",
      location: "Dallas, TX",
      experience: "6 years",
      noticePeriod: "3 weeks",
      appliedPosition: "Data Engineer",
      interviewType: "Walk-In",
      job_type: "full_time",
      source: "Tech Meetup",
      currentCTC: "$110,000",
      expectedCTC: "$130,000",
      negotiable: false,
      relocation: false,
      skills: ["Python", "Apache Spark", "Kafka", "Snowflake", "dbt"],
      appliedDate: "2024-01-02",
      status: "completed",
      currentRound: "R2",
      recruiter: "Sarah Johnson",
      totalWaitTime: "12 days",
      feedback: [
        {
          round: "R1",
          panelist: "Alex Rodriguez",
          rating: 4,
          notes: "Strong data engineering background with good pipeline design skills.",
          decision: "selected",
          submittedAt: "2024-01-08T10:00:00",
        },
        {
          round: "R2",
          panelist: "Lisa Wang",
          rating: 3,
          notes: "Good technical skills but limited experience with our tech stack.",
          decision: "rejected",
          submittedAt: "2024-01-11T14:00:00",
        },
      ],
    },
    {
      id: "14",
      name: "Maria Santos",
      email: "maria.santos@email.com",
      phone: "+1-555-0114",
      location: "San Diego, CA",
      experience: "4 years",
      noticePeriod: "2 weeks",
      appliedPosition: "QA Engineer",
      interviewType: "Walk-In",
      job_type: "full_time",
      source: "Job Board",
      currentCTC: "$80,000",
      expectedCTC: "$95,000",
      negotiable: true,
      relocation: true,
      skills: ["Selenium", "Cypress", "Jest", "API Testing", "Test Automation"],
      appliedDate: "2024-01-14",
      status: "r1-completed",
      currentRound: "R1",
      assignedPanelist: "Mike Chen",
      interviewDateTime: "2024-01-15T09:00:00",
      recruiter: "Sarah Johnson",
    },
    {
      id: "15",
      name: "Christopher Lee",
      email: "christopher.lee@email.com",
      phone: "+1-555-0115",
      location: "Nashville, TN",
      experience: "9 years",
      noticePeriod: "1 month",
      appliedPosition: "Senior Product Manager",
      interviewType: "Walk-In",
      job_type: "full_time",
      source: "Executive Recruiter",
      currentCTC: "$140,000",
      expectedCTC: "$165,000",
      negotiable: false,
      relocation: false,
      skills: ["Product Strategy", "Data Analytics", "A/B Testing", "Growth Hacking", "Team Leadership"],
      appliedDate: "2024-01-01",
      status: "selected",
      currentRound: "R3",
      recruiter: "Sarah Johnson",
      totalWaitTime: "18 days",
      feedback: [
        {
          round: "R1",
          panelist: "Mike Chen",
          rating: 5,
          notes: "Exceptional product vision and strategic thinking capabilities.",
          decision: "selected",
          submittedAt: "2024-01-07T11:00:00",
        },
        {
          round: "R2",
          panelist: "Emily Davis",
          rating: 5,
          notes: "Outstanding leadership skills and data-driven approach.",
          decision: "selected",
          submittedAt: "2024-01-10T15:00:00",
        },
        {
          round: "R3",
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
