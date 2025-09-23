export interface PanelistDashboardData {
  todaySchedule: {
    todayInterviews: number
    completedToday: number
    upcomingInterviews: number
    thisWeekCount: number
  }
  performance: {
    totalInterviews: number
    candidatesSelected: number
    candidatesRejected: number
    selectionRate: number
  }
  todayInterviews: Array<{
    id: string
    candidateName: string
    position: string
    round: string
    time: string
    duration: string
    status: "scheduled" | "in-progress" | "completed"
    elapsedTime?: string
  }>
  upcomingWeek: Array<{
    id: string
    candidateName: string
    position: string
    round: string
    date: string
    time: string
  }>
  recentFeedback: Array<{
    id: string
    candidateName: string
    round: string
    rating: number
    notes: string
    decision: "selected" | "rejected"
    submittedAt: string
  }>
}

export function getPanelistDashboardData(): PanelistDashboardData {
  return {
    todaySchedule: {
      todayInterviews: 4,
      completedToday: 2,
      upcomingInterviews: 2,
      thisWeekCount: 12,
    },
    performance: {
      totalInterviews: 45,
      candidatesSelected: 28,
      candidatesRejected: 17,
      selectionRate: 62,
    },
    todayInterviews: [
      {
        id: "1",
        candidateName: "John Smith",
        position: "Senior Frontend Developer",
        round: "R1",
        time: "09:00 AM",
        duration: "60 min",
        status: "completed",
      },
      {
        id: "2",
        candidateName: "Sarah Wilson",
        position: "Backend Developer",
        round: "R1",
        time: "11:00 AM",
        duration: "60 min",
        status: "in-progress",
        elapsedTime: "32 min",
      },
      {
        id: "3",
        candidateName: "Michael Brown",
        position: "Product Manager",
        round: "R2",
        time: "02:00 PM",
        duration: "45 min",
        status: "scheduled",
      },
      {
        id: "4",
        candidateName: "Emily Davis",
        position: "UX Designer",
        round: "R1",
        time: "04:00 PM",
        duration: "60 min",
        status: "scheduled",
      },
    ],
    upcomingWeek: [
      {
        id: "5",
        candidateName: "David Kim",
        position: "DevOps Engineer",
        round: "R1",
        date: "Tomorrow",
        time: "10:00 AM",
      },
      {
        id: "6",
        candidateName: "Lisa Wang",
        position: "Frontend Developer",
        round: "R2",
        date: "Wednesday",
        time: "02:00 PM",
      },
      {
        id: "7",
        candidateName: "Alex Rodriguez",
        position: "Backend Developer",
        round: "R1",
        date: "Thursday",
        time: "11:00 AM",
      },
    ],
    recentFeedback: [
      {
        id: "1",
        candidateName: "John Smith",
        round: "R1",
        rating: 4,
        notes: "Strong technical skills and good problem-solving approach. Communication is clear and concise.",
        decision: "selected",
        submittedAt: "Today, 10:30 AM",
      },
      {
        id: "2",
        candidateName: "Jane Doe",
        round: "R1",
        rating: 2,
        notes: "Lacks experience with required technologies. Needs improvement in coding practices.",
        decision: "rejected",
        submittedAt: "Yesterday, 03:45 PM",
      },
    ],
  }
}

export function getPanelistCandidates() {
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
      interviewType: "walk-in",
      jobType: "full-time",
      source: "LinkedIn",
      currentCTC: "$95,000",
      expectedCTC: "$110,000",
      negotiable: true,
      relocation: false,
      skills: ["React", "TypeScript", "Next.js", "Node.js"],
      appliedDate: "2024-01-10",
      status: "r1-scheduled",
      round: "R1",
      scheduledTime: "2024-01-15T09:00:00",
      interviewStatus: "completed",
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
      interviewType: "walk-in",
      jobType: "full-time",
      source: "Company Website",
      currentCTC: "$85,000",
      expectedCTC: "$100,000",
      negotiable: false,
      relocation: true,
      skills: ["Python", "Django", "PostgreSQL", "AWS"],
      appliedDate: "2024-01-08",
      status: "r1-scheduled",
      round: "R1",
      scheduledTime: "2024-01-15T11:00:00",
      interviewStatus: "in-progress",
    },
    {
      id: "3",
      name: "Michael Brown",
      email: "michael.brown@email.com",
      phone: "+1-555-0103",
      location: "Austin, TX",
      experience: "6 years",
      noticePeriod: "3 weeks",
      appliedPosition: "Product Manager",
      interviewType: "walk-in",
      jobType: "full-time",
      source: "Referral",
      currentCTC: "$120,000",
      expectedCTC: "$140,000",
      negotiable: true,
      relocation: false,
      skills: ["Product Strategy", "Analytics", "Agile", "User Research"],
      appliedDate: "2024-01-05",
      status: "r2-scheduled",
      round: "R2",
      scheduledTime: "2024-01-15T14:00:00",
      interviewStatus: "scheduled",
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
      interviewType: "walk-in",
      jobType: "contract",
      source: "Job Board",
      currentCTC: "$70,000",
      expectedCTC: "$85,000",
      negotiable: true,
      relocation: false,
      skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
      appliedDate: "2024-01-12",
      status: "r1-scheduled",
      round: "R1",
      scheduledTime: "2024-01-15T16:00:00",
      interviewStatus: "scheduled",
    },
  ]
}
