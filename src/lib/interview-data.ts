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
  // Removed localStorage usage - return empty array
  return []
}

export function saveInterviewSession(session: InterviewSession) {
  // Removed localStorage usage - no-op
  return
}

export function getInterviewSessionsForPanelist(panelistName: string): InterviewSession[] {
  return getInterviewSessions().filter((session) => session.panelistName === panelistName)
}

export function getInterviewSessionForCandidate(candidateId: string): InterviewSession | null {
  const sessions = getInterviewSessions()
  return sessions.find((session) => session.candidateId === candidateId) || null
}

export function updatePanelistStatus(panelistName: string, current_status: "free" | "in_interview") {
  // Removed localStorage usage for users - should be managed via API
  return
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
  // Removed localStorage usage - candidates should be managed via API
  return
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
  // Removed localStorage usage - candidates should be managed via API
  return
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
  // Removed localStorage usage - candidates should be fetched via API
  return null
}
