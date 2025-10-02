import { 
  fetchUnassignedCandidates, 
  fetchAssignedCandidates,
  fetchPanelistAssignedCandidates,
  fetchOngoingInterviews,
  type BackendCandidate,
  type PanelistCandidate
} from "./candidates-api"
import { fetchVacancies } from "./vacancy-api"

// HR Dashboard Metrics
export interface HRDashboardMetrics {
  total_applications: number
  unassigned_candidates: number
  interviews_scheduled: number
  joined_count: number
  offer_released_count: number
  ongoing_r1: number
  ongoing_r2: number
  ongoing_r3: number
  successful_hires: number
  interview_to_offer_rate: number
  avg_time_to_hire: number
  panelist_rating: number
}

// Panelist Dashboard Metrics
export interface PanelistDashboardMetrics {
  completed_interviews: number
  selected_count: number
  rejected_count: number
  scheduled_interviews: number
}

// Filter options
export interface DashboardFilters {
  vacancy?: string // vacancy ID or "all"
  recruiter?: string // recruiter name or "all"
}

// Calculate HR Dashboard Metrics from actual backend data
export async function fetchHRDashboardMetrics(filters?: DashboardFilters): Promise<HRDashboardMetrics> {
  try {
    // Fetch all relevant data in parallel
    const [unassignedCandidates, assignedCandidates, ongoingInterviews, vacancies] = await Promise.all([
      fetchUnassignedCandidates(),
      fetchAssignedCandidates(),
      fetchOngoingInterviews(),
      fetchVacancies()
    ])

    // Apply filters
    let filteredUnassigned = unassignedCandidates
    let filteredAssigned = assignedCandidates

    if (filters?.vacancy && filters.vacancy !== "all") {
      // Find the vacancy to get its position_title
      const vacancy = vacancies.find(v => v.id === filters.vacancy)
      if (vacancy) {
        filteredUnassigned = filteredUnassigned.filter(c => c.applied_position === vacancy.position_title)
        filteredAssigned = filteredAssigned.filter(c => c.applied_position === vacancy.position_title)
      }
    }

    if (filters?.recruiter && filters.recruiter !== "all") {
      filteredUnassigned = filteredUnassigned.filter(c => c.recruiter_name === filters.recruiter)
      filteredAssigned = filteredAssigned.filter(c => c.recruiter_name === filters.recruiter)
    }

    // Calculate metrics
    const total_applications = filteredUnassigned.length + filteredAssigned.length
    const unassigned_candidates = filteredUnassigned.length
    const interviews_scheduled = filteredAssigned.length

    // Count by status
    const joined_count = filteredAssigned.filter(c => c.checked_in === true).length
    const offer_released_count = filteredAssigned.filter(c => 
      c.status === "offer_released" || c.status === "selected"
    ).length

    // Count ongoing rounds
    const ongoing_r1 = filteredAssigned.filter(c => c.currentRound === "r1").length
    const ongoing_r2 = filteredAssigned.filter(c => c.currentRound === "r2").length
    const ongoing_r3 = filteredAssigned.filter(c => c.currentRound === "r3").length

    const successful_hires = filteredAssigned.filter(c => 
      c.status === "hired" || c.status === "joined"
    ).length

    // Calculate conversion rate
    const interview_to_offer_rate = interviews_scheduled > 0 
      ? Math.round((offer_released_count / interviews_scheduled) * 100) 
      : 0

    // Average time to hire (placeholder - would need created_at and hired_at dates)
    const avg_time_to_hire = 21 // days

    // Panelist rating (placeholder - would need feedback data)
    const panelist_rating = 4.2

    return {
      total_applications,
      unassigned_candidates,
      interviews_scheduled,
      joined_count,
      offer_released_count,
      ongoing_r1,
      ongoing_r2,
      ongoing_r3,
      successful_hires,
      interview_to_offer_rate,
      avg_time_to_hire,
      panelist_rating
    }
  } catch (error) {
    console.error("Error calculating HR dashboard metrics:", error)
    throw new Error("Failed to calculate HR dashboard metrics")
  }
}

// Calculate Panelist Dashboard Metrics from actual backend data
export async function fetchPanelistDashboardMetrics(): Promise<PanelistDashboardMetrics> {
  try {
    // Fetch panelist's assigned candidates
    const candidates = await fetchPanelistAssignedCandidates()

    // Calculate completed interviews (candidates with feedback submitted)
    const completed_interviews = candidates.filter(candidate => {
      if (!candidate.previous_rounds || candidate.previous_rounds.length === 0) return false
      // Check if the latest round has feedback submitted
      const latestRound = candidate.previous_rounds[candidate.previous_rounds.length - 1]
      return latestRound?.feedback_submitted === true
    }).length

    // Calculate selected count across all rounds
    let selected_count = 0
    candidates.forEach(candidate => {
      if (candidate.previous_rounds) {
        selected_count += candidate.previous_rounds.filter(round => 
          round.status === "selected"
        ).length
      }
    })

    // Calculate rejected count across all rounds
    let rejected_count = 0
    candidates.forEach(candidate => {
      if (candidate.previous_rounds) {
        rejected_count += candidate.previous_rounds.filter(round => 
          round.status === "rejected"
        ).length
      }
    })

    // Calculate scheduled interviews (candidates assigned but feedback not yet submitted)
    const scheduled_interviews = candidates.filter(candidate => {
      if (!candidate.previous_rounds || candidate.previous_rounds.length === 0) return true
      // Check if the latest round doesn't have feedback submitted
      const latestRound = candidate.previous_rounds[candidate.previous_rounds.length - 1]
      return latestRound?.feedback_submitted !== true
    }).length

    return {
      completed_interviews,
      selected_count,
      rejected_count,
      scheduled_interviews
    }
  } catch (error) {
    console.error("Error calculating panelist dashboard metrics:", error)
    throw new Error("Failed to calculate panelist dashboard metrics")
  }
}
