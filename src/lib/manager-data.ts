export interface ManagerDashboardData {
  interviews: {
    totalR3Interviews: number
    candidatesSelected: number
    candidatesRejected: number
    pendingDecisions: number
  }
  offers: {
    offersSent: number
    offersAccepted: number
    offersDeclined: number
    hiredThisMonth: number
  }
  analytics: {
    avgTimeToDecision: number
    avgSalaryOffered: number
    teamCapacity: number
    pipelineHealth: number
  }
  pendingR3Candidates: Array<{
    id: string
    name: string
    position: string
    interviewDate: string
    expected_ctc: string
    daysPending: number
  }>
  recentR3History: Array<{
    id: string
    candidateName: string
    position: string
    rating: number
    notes: string
    decision: "selected" | "rejected" | "on-hold"
    completedAt: string
  }>
  teamHiringStatus: Array<{
    department: string
    filled: number
    total: number
  }>
  salaryBudget: {
    totalBudget: number
    allocated: number
    remaining: number
  }
}

export function getManagerDashboardData(): ManagerDashboardData {
  return {
    interviews: {
      totalR3Interviews: 42,
      candidatesSelected: 28,
      candidatesRejected: 11,
      pendingDecisions: 3,
    },
    offers: {
      offersSent: 25,
      offersAccepted: 18,
      offersDeclined: 5,
      hiredThisMonth: 12,
    },
    analytics: {
      avgTimeToDecision: 2.5,
      avgSalaryOffered: 132000,
      teamCapacity: 89,
      pipelineHealth: 94,
    },
    pendingR3Candidates: [
      {
        id: "1",
        name: "Michael Brown",
        position: "Product Manager",
        interviewDate: "2024-01-12",
        expected_ctc: "$140,000",
        daysPending: 3,
      },
      {
        id: "2",
        name: "Sarah Chen",
        position: "Senior Frontend Developer",
        interviewDate: "2024-01-10",
        expected_ctc: "$115,000",
        daysPending: 5,
      },
      {
        id: "3",
        name: "David Rodriguez",
        position: "DevOps Engineer",
        interviewDate: "2024-01-14",
        expected_ctc: "$130,000",
        daysPending: 1,
      },
    ],
    recentR3History: [
      {
        id: "1",
        candidateName: "Emily Davis",
        position: "UX Designer",
        rating: 5,
        notes:
          "Exceptional design thinking and leadership potential. Strong cultural fit and innovative approach to problem-solving.",
        decision: "selected",
        completedAt: "2024-01-13",
      },
      {
        id: "2",
        candidateName: "Amanda Foster",
        position: "Senior Backend Developer",
        rating: 5,
        notes:
          "Outstanding technical expertise and system architecture skills. Perfect fit for senior role.",
        decision: "selected",
        completedAt: "2024-01-16",
      },
      {
        id: "3",
        candidateName: "Christopher Lee",
        position: "Senior Product Manager",
        rating: 5,
        notes:
          "Exceptional product vision and strategic thinking. Strong leadership and stakeholder management skills.",
        decision: "selected",
        completedAt: "2024-01-15",
      },
      {
        id: "4",
        candidateName: "Thomas Anderson",
        position: "Engineering Manager",
        rating: 4,
        notes:
          "Good technical leadership skills but needs improvement in people management. Strong technical background.",
        decision: "on-hold",
        completedAt: "2024-01-14",
      },
      {
        id: "5",
        candidateName: "John Wilson",
        position: "Backend Developer",
        rating: 3,
        notes:
          "Good technical skills but lacks the senior-level total_experience we need for this role. Communication could be improved.",
        decision: "rejected",
        completedAt: "2024-01-11",
      },
      {
        id: "6",
        candidateName: "Robert Chen",
        position: "Backend Developer",
        rating: 5,
        notes:
          "Outstanding performance in final round. Strong leadership potential and technical expertise.",
        decision: "selected",
        completedAt: "2024-01-17",
      },
    ],
    teamHiringStatus: [
      {
        department: "Engineering",
        filled: 18,
        total: 22,
      },
      {
        department: "Product",
        filled: 6,
        total: 8,
      },
      {
        department: "Design",
        filled: 4,
        total: 5,
      },
      {
        department: "Marketing",
        filled: 8,
        total: 10,
      },
      {
        department: "Data Science",
        filled: 3,
        total: 6,
      },
      {
        department: "Security",
        filled: 2,
        total: 4,
      },
    ],
    salaryBudget: {
      totalBudget: 3200000,
      allocated: 2640000,
      remaining: 560000,
    },
  }
}

export function getManagerCandidates() {
  return [
    {
      id: "1",
      name: "Michael Brown",
      email: "michael.brown@email.com",
      phone: "+1-555-0103",
      location: "Austin, TX",
      total_experience: "6 years",
      notice_period: "3 weeks",
      applied_position: "Product Manager",
      interview_type: "Walk-In",
      job_type: "full_time",
      source: "Referral",
      current_ctc: "$120,000",
      expected_ctc: "$140,000",
      negotiable: true,
      willing_to_relocate: false,
      skills: ["Product Strategy", "Analytics", "Agile", "User Research"],
      appliedDate: "2024-01-05",
      status: "r3-scheduled",
      r3Status: "pending-decision",
      r3InterviewDate: "2024-01-12T14:00:00",
      daysPending: 3,
      feedback: [
        {
          round: "R1",
          panelist: "Mike Chen",
          rating: 4,
          notes: "Strong technical background and good communication skills.",
          decision: "selected",
          submittedAt: "2024-01-12T14:30:00",
        },
        {
          round: "R2",
          panelist: "Alex Rodriguez",
          rating: 5,
          notes: "Excellent product thinking and leadership total_experience.",
          decision: "selected",
          submittedAt: "2024-01-14T16:00:00",
        },
      ],
    },
    {
      id: "2",
      name: "Sarah Chen",
      email: "sarah.chen@email.com",
      phone: "+1-555-0105",
      location: "San Francisco, CA",
      total_experience: "5 years",
      notice_period: "2 weeks",
      applied_position: "Senior Frontend Developer",
      interview_type: "Walk-In",
      job_type: "full_time",
      source: "LinkedIn",
      current_ctc: "$100,000",
      expected_ctc: "$115,000",
      negotiable: true,
      willing_to_relocate: false,
      skills: ["React", "TypeScript", "Next.js", "GraphQL"],
      appliedDate: "2024-01-08",
      status: "r3-scheduled",
      r3Status: "pending-decision",
      r3InterviewDate: "2024-01-10T10:00:00",
      daysPending: 5,
      feedback: [
        {
          round: "R1",
          panelist: "Lisa Wang",
          rating: 5,
          notes: "Outstanding technical skills and problem-solving ability.",
          decision: "selected",
          submittedAt: "2024-01-09T11:00:00",
        },
        {
          round: "R2",
          panelist: "Mike Chen",
          rating: 4,
          notes: "Great technical depth and team collaboration skills.",
          decision: "selected",
          submittedAt: "2024-01-11T15:30:00",
        },
      ],
    },
    {
      id: "3",
      name: "David Rodriguez",
      email: "david.rodriguez@email.com",
      phone: "+1-555-0106",
      location: "Seattle, WA",
      total_experience: "7 years",
      notice_period: "1 month",
      applied_position: "DevOps Engineer",
      interview_type: "Walk-In",
      job_type: "full_time",
      source: "Company Website",
      current_ctc: "$115,000",
      expected_ctc: "$130,000",
      negotiable: false,
      willing_to_relocate: true,
      skills: ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD"],
      appliedDate: "2024-01-12",
      status: "r3-scheduled",
      r3Status: "scheduled",
      r3InterviewDate: "2024-01-16T11:00:00",
      daysPending: 0,
      feedback: [
        {
          round: "R1",
          panelist: "Alex Rodriguez",
          rating: 4,
          notes: "Solid DevOps total_experience with strong automation skills.",
          decision: "selected",
          submittedAt: "2024-01-13T10:00:00",
        },
        {
          round: "R2",
          panelist: "David Kim",
          rating: 5,
          notes: "Excellent infrastructure knowledge and scalability mindset.",
          decision: "selected",
          submittedAt: "2024-01-15T14:00:00",
        },
      ],
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily.davis@email.com",
      phone: "+1-555-0104",
      location: "Seattle, WA",
      total_experience: "4 years",
      notice_period: "2 weeks",
      applied_position: "UX Designer",
      interview_type: "Walk-In",
      job_type: "full_time",
      source: "Job Board",
      current_ctc: "$85,000",
      expected_ctc: "$100,000",
      negotiable: true,
      willing_to_relocate: false,
      skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
      appliedDate: "2024-01-09",
      status: "selected",
      r3Status: "selected",
      r3InterviewDate: "2024-01-13T15:00:00",
      daysPending: 0,
      feedback: [
        {
          round: "R1",
          panelist: "Lisa Wang",
          rating: 4,
          notes: "Creative design approach with good user empathy.",
          decision: "selected",
          submittedAt: "2024-01-10T16:00:00",
        },
        {
          round: "R2",
          panelist: "Mike Chen",
          rating: 5,
          notes: "Exceptional design thinking and portfolio quality.",
          decision: "selected",
          submittedAt: "2024-01-12T11:30:00",
        },
      ],
    },
  ]
}

export const offers = [
  {
    id: "1",
    candidateName: "Emily Davis",
    email: "emily.davis@email.com",
    position: "UX Designer",
    salary: "$100,000",
    joiningDate: "2024-02-01",
    createdDate: "2024-01-15",
    validUntil: "2024-01-29",
    status: "accepted",
    benefits:
      "Health insurance, dental coverage, stock options, flexible working hours, professional development budget",
    terms: "Full-time employment, 3-month probation period, 30-day notice period, remote work flexibility",
    notes: "Candidate accepted offer immediately. Very enthusiastic about joining the team.",
  },
  {
    id: "2",
    candidateName: "Michael Brown",
    email: "michael.brown@email.com",
    position: "Product Manager",
    salary: "$140,000",
    joiningDate: "2024-02-15",
    createdDate: "2024-01-16",
    validUntil: "2024-01-30",
    status: "negotiating",
    benefits:
      "Health insurance, dental coverage, stock options, flexible working hours, professional development budget, gym membership",
    terms: "Full-time employment, 6-month probation period, 30-day notice period, hybrid work model",
    notes: "Candidate requested salary increase and additional vacation days. Currently in negotiation.",
  },
  {
    id: "3",
    candidateName: "Sarah Chen",
    email: "sarah.chen@email.com",
    position: "Senior Frontend Developer",
    salary: "$115,000",
    joiningDate: "2024-02-05",
    createdDate: "2024-01-14",
    validUntil: "2024-01-28",
    status: "sent",
    benefits:
      "Health insurance, dental coverage, stock options, flexible working hours, professional development budget",
    terms: "Full-time employment, 3-month probation period, 30-day notice period, remote work flexibility",
    notes: "Offer sent via email. Awaiting candidate response.",
  },
  {
    id: "4",
    candidateName: "David Rodriguez",
    email: "david.rodriguez@email.com",
    position: "DevOps Engineer",
    salary: "$130,000",
    joiningDate: "2024-02-10",
    createdDate: "2024-01-17",
    validUntil: "2024-01-31",
    status: "pending",
    benefits:
      "Health insurance, dental coverage, stock options, flexible working hours, professional development budget, willing_to_relocate assistance",
    terms: "Full-time employment, 3-month probation period, 30-day notice period, hybrid work model",
    notes: "Offer being prepared for final approval before sending.",
  },
  {
    id: "5",
    candidateName: "John Wilson",
    email: "john.wilson@email.com",
    position: "Backend Developer",
    salary: "$95,000",
    joiningDate: "2024-01-25",
    createdDate: "2024-01-10",
    validUntil: "2024-01-24",
    status: "rejected",
    benefits: "Health insurance, dental coverage, flexible working hours, professional development budget",
    terms: "Full-time employment, 3-month probation period, 30-day notice period, remote work flexibility",
    notes: "Candidate declined offer citing better opportunity elsewhere.",
  },
]

export const candidates = getManagerCandidates()
