export interface InterviewSession {
  id: string
  candidateId: string
  candidateName: string
  panelistId: string
  panelistName: string
  position: string
  round: string
  scheduledTime: string
  status: "scheduled" | "in-progress" | "paused" | "completed"
  startTime?: string
  endTime?: string
  elapsedTime?: number
  pausedTime?: number
  feedback?: {
    rating: number
    notes: string
    decision: "selected" | "rejected"
    submittedAt: string
    detailedRatings?: {
      problem_solving: number
      communication: number
      code_quality: number
      technical_knowledge: number
      teamwork: number
    }
  }
}

export function getInterviewSessions(): InterviewSession[] {
  if (typeof window === "undefined") return []
  const sessions = localStorage.getItem("interview_sessions")
  return sessions ? JSON.parse(sessions) : []
}

export function saveInterviewSession(session: InterviewSession) {
  if (typeof window === "undefined") return
  
  const sessions = getInterviewSessions()
  const existingIndex = sessions.findIndex(s => s.id === session.id)
  
  if (existingIndex >= 0) {
    sessions[existingIndex] = session
  } else {
    sessions.push(session)
  }
  
  localStorage.setItem("interview_sessions", JSON.stringify(sessions))
  
  // Dispatch custom event for real-time updates
  window.dispatchEvent(new CustomEvent("interviewSessionUpdated", { detail: session }))
}

export function getInterviewSessionsForPanelist(panelistName: string): InterviewSession[] {
  return getInterviewSessions().filter((session) => session.panelistName === panelistName)
}

export function getInterviewSessionForCandidate(candidateId: string): InterviewSession | null {
  const sessions = getInterviewSessions()
  return sessions.find((session) => session.candidateId === candidateId) || null
}

export function updatePanelistStatus(panelistName: string, current_status: "free" | "in_interview") {
  // Update user status in localStorage
  const users = JSON.parse(localStorage.getItem("users") || "[]")
  const userIndex = users.findIndex((u: any) => u.name === panelistName)

  if (userIndex >= 0) {
    users[userIndex].accountStatus = current_status
    localStorage.setItem("users", JSON.stringify(users))

    // Also update current user if it's the same person
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
    if (currentUser.name === panelistName) {
      currentUser.accountStatus = current_status
      localStorage.setItem("currentUser", JSON.stringify(currentUser))
    }
  }
}

export function startInterview(sessionId: string) {
  const sessions = getInterviewSessions()
  const session = sessions.find((s) => s.id === sessionId)

  if (session) {
    session.status = "in-progress"
    session.startTime = new Date().toISOString()
    updatePanelistStatus(session.panelistName, "in_interview")
    saveInterviewSession(session)

    updateCandidateStatusToInProgress(session.candidateId, session.round)
  }
}

export function updateCandidateStatusToInProgress(candidateId: string, round: string) {
  if (typeof window === "undefined") return

  // Dispatch event to notify other components
  window.dispatchEvent(new CustomEvent("candidateUpdated"))
}

export function completeInterview(sessionId: string, feedback: InterviewSession["feedback"]) {
  const sessions = getInterviewSessions()
  const session = sessions.find((s) => s.id === sessionId)

  if (session) {
    session.status = "completed"
    session.endTime = new Date().toISOString()
    session.feedback = feedback
    updatePanelistStatus(session.panelistName, "free")

    if (session.startTime) {
      const now = new Date().getTime()
      const start = new Date(session.startTime).getTime()
      session.elapsedTime = (session.elapsedTime || 0) + Math.floor((now - start) / 1000)
    }

    saveInterviewSession(session)

    updateCandidateStatusAfterInterview(session.candidateId, feedback, session.round)
  }
}

export function updateCandidateStatusAfterInterview(
  candidateId: string,
  feedback: InterviewSession["feedback"],
  currentRound: string,
) {
  if (typeof window === "undefined") return

  // Dispatch event to notify other components
  window.dispatchEvent(new CustomEvent("candidateUpdated"))
}

export function pauseInterview(sessionId: string) {
  const sessions = getInterviewSessions()
  const session = sessions.find((s) => s.id === sessionId)

  if (session && session.startTime) {
    session.status = "paused"
    const now = new Date().getTime()
    const start = new Date(session.startTime).getTime()
    session.elapsedTime = (session.elapsedTime || 0) + Math.floor((now - start) / 1000)
    saveInterviewSession(session)
  }
}

export function getCandidateDetails(candidateId: string) {
  return null
}
