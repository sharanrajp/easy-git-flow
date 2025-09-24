import { InterviewSession } from './interview-data'

export const mockInterviewSessions: InterviewSession[] = [
  {
    id: "session-1",
    candidateId: "1",
    candidateName: "John Smith",
    panelistId: "2",
    panelistName: "Mike Chen",
    position: "Senior Frontend Developer",
    round: "R1",
    scheduledTime: "2024-01-15T09:00:00",
    status: "completed",
    startTime: "2024-01-15T09:05:00",
    endTime: "2024-01-15T10:15:00",
    elapsedTime: 4200, // 70 minutes in seconds
    feedback: {
      rating: 4,
      notes: "Strong technical skills and good problem-solving approach. Communication is clear and concise. Demonstrated good understanding of React concepts and modern frontend practices.",
      decision: "selected",
      submittedAt: "2024-01-15T10:30:00",
      detailedRatings: {
        problemSolving: 4,
        communication: 5,
        codeQuality: 4,
        technicalKnowledge: 4,
        teamwork: 4,
      },
    },
  },
  {
    id: "session-2",
    candidateId: "2",
    candidateName: "Sarah Wilson",
    panelistId: "4",
    panelistName: "Alex Rodriguez",
    position: "Backend Developer",
    round: "R1",
    scheduledTime: "2024-01-15T11:00:00",
    status: "completed",
    startTime: "2024-01-15T11:00:00",
    endTime: "2024-01-15T12:05:00",
    elapsedTime: 3900, // 65 minutes in seconds
    feedback: {
      rating: 4,
      notes: "Excellent backend development knowledge. Good understanding of system architecture and database design. Strong Python skills.",
      decision: "selected",
      submittedAt: "2024-01-15T12:15:00",
      detailedRatings: {
        problemSolving: 4,
        communication: 4,
        codeQuality: 5,
        technicalKnowledge: 4,
        teamwork: 3,
      },
    },
  },
  {
    id: "session-3",
    candidateId: "3",
    candidateName: "Michael Thompson",
    panelistId: "2",
    panelistName: "Mike Chen",
    position: "Full Stack Developer",
    round: "R1",
    scheduledTime: "2024-01-15T13:00:00",
    status: "in-progress",
    startTime: "2024-01-15T13:05:00",
    elapsedTime: 1800, // 30 minutes so far
  },
  {
    id: "session-4",
    candidateId: "9",
    candidateName: "Kevin Liu",
    panelistId: "5",
    panelistName: "Lisa Wang",
    position: "Junior Frontend Developer",
    round: "R1",
    scheduledTime: "2024-01-15T16:00:00",
    status: "scheduled",
  },
  {
    id: "session-5",
    candidateId: "10",
    candidateName: "Rachel Green",
    panelistId: "3",
    panelistName: "Emily Davis",
    position: "Product Manager",
    round: "R2",
    scheduledTime: "2024-01-15T11:00:00",
    status: "in-progress",
    startTime: "2024-01-15T11:10:00",
    elapsedTime: 2700, // 45 minutes so far
  },
  {
    id: "session-6",
    candidateId: "14",
    candidateName: "Maria Santos",
    panelistId: "2",
    panelistName: "Mike Chen",
    position: "QA Engineer",
    round: "R1",
    scheduledTime: "2024-01-15T14:30:00",
    status: "completed",
    startTime: "2024-01-15T14:35:00",
    endTime: "2024-01-15T15:20:00",
    elapsedTime: 2700, // 45 minutes
    feedback: {
      rating: 3,
      notes: "Good QA knowledge and testing fundamentals. Needs improvement in test automation frameworks and modern testing tools.",
      decision: "selected",
      submittedAt: "2024-01-15T15:30:00",
      detailedRatings: {
        problemSolving: 3,
        communication: 4,
        codeQuality: 3,
        technicalKnowledge: 3,
        teamwork: 4,
      },
    },
  },
  {
    id: "session-7",
    candidateId: "12",
    candidateName: "Sophia Rodriguez",
    panelistId: "5",
    panelistName: "Lisa Wang",
    position: "UI/UX Designer",
    round: "R1",
    scheduledTime: "2024-01-15T17:30:00",
    status: "scheduled",
  },
  {
    id: "session-8",
    candidateId: "5",
    candidateName: "David Park",
    panelistId: "6",
    panelistName: "David Kim",
    position: "DevOps Engineer",
    round: "R3",
    scheduledTime: "2024-01-17T10:00:00",
    status: "scheduled",
  },
  {
    id: "session-9",
    candidateId: "6",
    candidateName: "Jessica Martinez",
    panelistId: "5",
    panelistName: "Lisa Wang",
    position: "Frontend Developer",
    round: "R2",
    scheduledTime: "2024-01-15T15:45:00",
    status: "completed",
    startTime: "2024-01-15T15:50:00",
    endTime: "2024-01-15T16:35:00",
    elapsedTime: 2700, // 45 minutes
    feedback: {
      rating: 2,
      notes: "Struggled with advanced React concepts and system design questions. Basic JavaScript knowledge is good but needs more total_experience with modern frameworks.",
      decision: "rejected",
      submittedAt: "2024-01-15T16:45:00",
      detailedRatings: {
        problemSolving: 2,
        communication: 3,
        codeQuality: 2,
        technicalKnowledge: 2,
        teamwork: 4,
      },
    },
  },
  {
    id: "session-10",
    candidateId: "7",
    candidateName: "Robert Chen",
    panelistId: "6",
    panelistName: "David Kim",
    position: "Backend Developer",
    round: "R3",
    scheduledTime: "2024-01-17T11:15:00",
    status: "completed",
    startTime: "2024-01-17T11:20:00",
    endTime: "2024-01-17T12:10:00",
    elapsedTime: 3000, // 50 minutes
    feedback: {
      rating: 5,
      notes: "Outstanding performance in final round. Strong leadership potential and technical expertise. Excellent system design skills and mentoring capabilities.",
      decision: "selected",
      submittedAt: "2024-01-17T12:30:00",
      detailedRatings: {
        problemSolving: 5,
        communication: 5,
        codeQuality: 5,
        technicalKnowledge: 5,
        teamwork: 5,
      },
    },
  },
  {
    id: "session-11",
    candidateId: "8",
    candidateName: "Amanda Foster",
    panelistId: "6",
    panelistName: "David Kim",
    position: "Senior Backend Developer",
    round: "R3",
    scheduledTime: "2024-01-16T16:00:00",
    status: "completed",
    startTime: "2024-01-16T16:05:00",
    endTime: "2024-01-16T17:00:00",
    elapsedTime: 3300, // 55 minutes
    feedback: {
      rating: 5,
      notes: "Perfect fit for senior role. Strong leadership and mentoring capabilities. Exceptional system architecture knowledge and team collaboration skills.",
      decision: "selected",
      submittedAt: "2024-01-16T17:15:00",
      detailedRatings: {
        problemSolving: 5,
        communication: 5,
        codeQuality: 5,
        technicalKnowledge: 5,
        teamwork: 5,
      },
    },
  },
  {
    id: "session-12",
    candidateId: "15",
    candidateName: "Christopher Lee",
    panelistId: "6",
    panelistName: "David Kim",
    position: "Senior Product Manager",
    round: "R3",
    scheduledTime: "2024-01-15T10:00:00",
    status: "completed",
    startTime: "2024-01-15T10:05:00",
    endTime: "2024-01-15T11:15:00",
    elapsedTime: 4200, // 70 minutes
    feedback: {
      rating: 5,
      notes: "Perfect fit for senior PM role. Excellent stakeholder management skills and strategic thinking. Outstanding product vision and data-driven approach.",
      decision: "selected",
      submittedAt: "2024-01-15T11:30:00",
      detailedRatings: {
        problemSolving: 5,
        communication: 5,
        codeQuality: 5, // N/A for PM but kept for consistency
        technicalKnowledge: 4,
        teamwork: 5,
      },
    },
  },
]

export function getMockInterviewSessions(): InterviewSession[] {
  return mockInterviewSessions
}

export function getMockInterviewSessionsForPanelist(panelistName: string): InterviewSession[] {
  return mockInterviewSessions.filter(session => session.panelistName === panelistName)
}

export function getMockInterviewSessionForCandidate(candidateId: string): InterviewSession | null {
  return mockInterviewSessions.find(session => session.candidateId === candidateId) || null
}