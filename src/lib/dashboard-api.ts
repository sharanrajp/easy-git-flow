import { makeAuthenticatedRequest } from "./auth"

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

export async function fetchHRDashboardMetrics(): Promise<HRDashboardMetrics> {
  const response = await makeAuthenticatedRequest("/dashboard/hr-metrics")
  
  if (!response.ok) {
    throw new Error("Failed to fetch HR dashboard metrics")
  }
  
  return response.json()
}

export async function fetchPanelistDashboardMetrics(): Promise<PanelistDashboardMetrics> {
  const response = await makeAuthenticatedRequest("/dashboard/panelist-metrics")
  
  if (!response.ok) {
    throw new Error("Failed to fetch panelist dashboard metrics")
  }
  
  return response.json()
}
