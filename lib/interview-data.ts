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

const INTERVIEW_STORAGE_KEY = "interview_sessions"

export function getInterviewSessions(): InterviewSession[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(INTERVIEW_STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveInterviewSession(session: InterviewSession) {
  const sessions = getInterviewSessions()
  const existingIndex = sessions.findIndex((s) => s.id === session.id)

  if (existingIndex >= 0) {
    sessions[existingIndex] = session
  } else {
    sessions.push(session)
  }

  localStorage.setItem(INTERVIEW_STORAGE_KEY, JSON.stringify(sessions))

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

export function updatePanelistStatus(panelistName: string, status: "available" | "in_interview") {
  // Update user status in localStorage
  const users = JSON.parse(localStorage.getItem("users") || "[]")
  const userIndex = users.findIndex((u: any) => u.name === panelistName)

  if (userIndex >= 0) {
    users[userIndex].accountStatus = status
    localStorage.setItem("users", JSON.stringify(users))

    // Also update current user if it's the same person
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
    if (currentUser.name === panelistName) {
      currentUser.accountStatus = status
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

  const candidates = JSON.parse(localStorage.getItem("candidates") || "[]")
  const candidateIndex = candidates.findIndex((c: any) => c.id === candidateId)

  if (candidateIndex >= 0) {
    const candidate = candidates[candidateIndex]

    // Update status to show interview in progress
    if (round === "R1") {
      candidate.status = "r1-in-progress"
    } else if (round === "R2") {
      candidate.status = "r2-in-progress"
    } else if (round === "R3") {
      candidate.status = "r3-in-progress"
    }

    candidates[candidateIndex] = candidate
    localStorage.setItem("candidates", JSON.stringify(candidates))

    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent("candidateUpdated"))
  }
}

export function completeInterview(sessionId: string, feedback: InterviewSession["feedback"]) {
  const sessions = getInterviewSessions()
  const session = sessions.find((s) => s.id === sessionId)

  if (session) {
    session.status = "completed"
    session.endTime = new Date().toISOString()
    session.feedback = feedback
    updatePanelistStatus(session.panelistName, "available")

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

  const candidates = JSON.parse(localStorage.getItem("candidates") || "[]")
  const candidateIndex = candidates.findIndex((c: any) => c.id === candidateId)

  if (candidateIndex >= 0 && feedback) {
    const candidate = candidates[candidateIndex]

    if (feedback.decision === "selected") {
      // Move to next round or complete if final round
      if (currentRound === "R1") {
        candidate.status = "r2-scheduled"
        candidate.currentRound = "R2"
      } else if (currentRound === "R2") {
        candidate.status = "r3-scheduled"
        candidate.currentRound = "R3"
      } else if (currentRound === "R3") {
        candidate.status = "hired"
        candidate.currentRound = "Completed"
      }
    } else if (feedback.decision === "rejected") {
      // Move to completed tab with rejected status
      candidate.status = "rejected"
      candidate.currentRound = "Completed"
    }

    // Update completion timestamp
    candidate.completedAt = new Date().toISOString()

    candidates[candidateIndex] = candidate
    localStorage.setItem("candidates", JSON.stringify(candidates))

    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent("candidateUpdated"))
  }
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
  const candidates = JSON.parse(localStorage.getItem("candidates") || "[]")
  return candidates.find((c: any) => c.id === candidateId) || null
}
