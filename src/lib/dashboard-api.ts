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
  offer_acceptance_rate: number
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

// Calculate metrics from provided candidate data (no API calls)
export function calculateHRMetrics(
  unassignedCandidates: BackendCandidate[],
  assignedCandidates: BackendCandidate[],
  ongoingInterviews: any[],
  filters?: DashboardFilters,
  vacancies?: any[]
): HRDashboardMetrics {
  // Apply filters
  let filteredUnassigned = unassignedCandidates
  let filteredAssigned = assignedCandidates

  if (filters?.vacancy && filters.vacancy !== "all" && vacancies) {
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

  const allCandidates = [...filteredUnassigned, ...filteredAssigned]
  
  const total_applications = allCandidates.length
  const unassigned_candidates = allCandidates.filter(c => c.final_status === "Yet to Attend").length
  const interviews_scheduled = filteredAssigned.length

  const joined_count = filteredAssigned.filter(c => c.final_status === "joined").length
  const offer_released_count = filteredAssigned.filter(c => 
    c.final_status === "offerReleased"
  ).length

  // Filter ongoing interviews to match the filtered candidates
  const filteredCandidateIds = new Set(allCandidates.map(c => c._id))
  const filteredOngoingInterviews = ongoingInterviews.filter(interview => 
    filteredCandidateIds.has(interview.candidate_id)
  )

  // Calculate ongoing interviews by round from the filtered ongoing interviews
  const ongoing_r1 = filteredOngoingInterviews.filter(i => i.round === "r1" || i.round === "R1").length
  const ongoing_r2 = filteredOngoingInterviews.filter(i => i.round === "r2" || i.round === "R2").length
  const ongoing_r3 = filteredOngoingInterviews.filter(i => i.round === "r3" || i.round === "R3").length

  // 1. Successful Hires: Count candidates with final_status = "selected", "offerReleased", or "joined"
  const successful_hires = filteredAssigned.filter(c => 
    c.final_status === "hired"
  ).length

  // 2. Interview-to-Offer Rate: (Offers Made / Candidates Interviewed) × 100
  // Candidates Interviewed: those with any previous_rounds with status "selected" or "rejected"
  const candidates_interviewed = filteredAssigned.filter(c => 
    c.previous_rounds && c.previous_rounds.length > 0 && 
    c.previous_rounds.some(round => round.status === "selected" || round.status === "rejected")
  ).length
  
  const interview_to_offer_rate = candidates_interviewed > 0 
    ? Math.round((offer_released_count / candidates_interviewed) * 100) 
    : 0

  // 3. Average Time to Hire: Average(updated_at - created_at) for candidates with offerReleased
  const candidatesWithOffer = filteredAssigned.filter(c => 
    c.final_status === "offerReleased" && c.created_at && c.updated_at
  )
  
  let avg_time_to_hire = 0
  if (candidatesWithOffer.length > 0) {
    const totalDays = candidatesWithOffer.reduce((sum, candidate) => {
      const applicationDate = new Date(candidate.created_at)
      const offerDate = new Date(candidate.updated_at!)
      const diffTime = Math.abs(offerDate.getTime() - applicationDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return sum + diffDays
    }, 0)
    avg_time_to_hire = Math.round(totalDays / candidatesWithOffer.length)
  }

  // 4. Offer Acceptance Rate: (Offers Accepted / Offers Made) × 100
  // Offers Made: final_status = "offerReleased"
  // Offers Accepted: final_status = "hired" or "joined"
  const offers_accepted = filteredAssigned.filter(c => 
    c.final_status === "hired" || c.final_status === "joined"
  ).length
  
  const offer_acceptance_rate = offer_released_count > 0
    ? Math.round((offers_accepted / offer_released_count) * 100)
    : 0

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
    offer_acceptance_rate
  }
}

// Fetch all data and calculate HR Dashboard Metrics
export async function fetchHRDashboardMetrics(filters?: DashboardFilters): Promise<HRDashboardMetrics> {
  try {
    const [unassignedCandidates, assignedCandidates, ongoingInterviews, vacancies] = await Promise.all([
      fetchUnassignedCandidates(),
      fetchAssignedCandidates(),
      fetchOngoingInterviews(),
      fetchVacancies()
    ])

    return calculateHRMetrics(unassignedCandidates, assignedCandidates, ongoingInterviews, filters, vacancies)
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
