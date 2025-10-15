import { getToken } from './auth';
import { API_BASE_URL } from './api-config';

// Interface for drive insights from /analytics/drive-insights
export interface DriveInsights {
  vacancy_id: string;
  total_candidates: number;
  attended: number;
  not_attended: number;
  cleared_all_rounds: number;
  rejected_r1: number;
  rejected_r2: number;
  rejected_r3: number;
  total_rejected: number;
  selection_rate: number;
  avg_time_to_hire: number;
}

// API Response interface (nested structure from backend)
interface DriveInsightsResponse {
  metrics: {
    total_candidates: number;
    attended: number;
    not_attended: number;
    cleared_all_rounds: number;
    rejected_r1: number;
    rejected_r2: number;
  };
  vacancy_info: {
    position_title: string;
    recruiter_name: string;
    hiring_manager_name: string;
    drive_date: string;
    drive_location: string;
    number_of_vacancies: number;
    status: string;
  };
  insights: {
    average_time_to_hire_days: number;
    selection_rate: number;
  };
}

// Fetch drive insights for a specific vacancy
export async function fetchDriveInsights(vacancyId: string): Promise<DriveInsights> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/analytics/drive-insights?vacancy_id=${vacancyId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch drive insights: ${response.status} ${response.statusText}`);
    }

    const apiData: DriveInsightsResponse = await response.json();
    
    // Transform API response to flat DriveInsights structure
    const transformedData: DriveInsights = {
      vacancy_id: vacancyId,
      total_candidates: apiData.metrics.total_candidates,
      attended: apiData.metrics.attended,
      not_attended: apiData.metrics.not_attended,
      cleared_all_rounds: apiData.metrics.cleared_all_rounds,
      rejected_r1: apiData.metrics.rejected_r1,
      rejected_r2: apiData.metrics.rejected_r2,
      rejected_r3: 0, // Not provided in API, defaulting to 0
      total_rejected: apiData.metrics.rejected_r1 + apiData.metrics.rejected_r2,
      selection_rate: apiData.insights.selection_rate,
      avg_time_to_hire: apiData.insights.average_time_to_hire_days,
    };
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching drive insights:', error);
    throw error;
  }
}
