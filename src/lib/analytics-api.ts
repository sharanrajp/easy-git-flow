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
    rejected_r1?: number;
    rejected_r2?: number;
    rejected_count?: number;
    onhold_count?: number;
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
    average_time_to_fill_days?: number;
    selection_rate: number;
  };
}

// Interface for joined candidates
export interface JoinedCandidate {
  candidate_name: string;
  experience: string;
  skills: string[];
  drive_title: string;
  date_of_joining?: string;
  time_to_hire?: number;
  time_to_fill?: number;
  status: 'offer_released' | 'joined';
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
      rejected_r1: apiData.metrics.rejected_r1 || 0,
      rejected_r2: apiData.metrics.rejected_r2 || 0,
      rejected_r3: 0, // Not provided in API, defaulting to 0
      total_rejected: apiData.metrics.rejected_count || (apiData.metrics.rejected_r1 || 0) + (apiData.metrics.rejected_r2 || 0),
      selection_rate: apiData.insights.selection_rate,
      avg_time_to_hire: apiData.insights.average_time_to_hire_days,
    };
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching drive insights:', error);
    throw error;
  }
}

// Fetch joined candidates with filters
export async function fetchJoinedCandidates(
  status?: 'offer_released' | 'joined' | 'all',
  exportData: boolean = false
): Promise<JoinedCandidate[] | Blob> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const params = new URLSearchParams();
    if (status && status !== 'all') {
      params.append('status', status);
    }
    if (exportData) {
      params.append('export', 'true');
    }

    const url = `${API_BASE_URL}/analytics/joined-candidates${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch joined candidates: ${response.status} ${response.statusText}`);
    }

    if (exportData) {
      return await response.blob();
    }

    const data: JoinedCandidate[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching joined candidates:', error);
    throw error;
  }
}
