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
        notes: "Lacks total_experience with required technologies. Needs improvement in coding practices.",
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
      skill_set: ["Product Strategy", "Analytics", "Agile", "User Research"],
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
      appliedDate: "2024-01-12",
      status: "r1-scheduled",
      round: "R1",
      scheduledTime: "2024-01-15T16:00:00",
      interviewStatus: "scheduled",
    },
  ]
}
