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