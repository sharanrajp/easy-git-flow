import { getToken } from './auth';
import { API_BASE_URL } from './api-config';

// Interface for drive insights from /analytics/drive-insights
export interface DriveInsights {
  vacancy_id: string;
  total_candidates: number;
  attended: number;
  not_attended: number;
  cleared_all_rounds: number;
  rejected_count: number;
  joined_count: number;
  joined_per_vacancy: string;
  avg_time_to_hire: number;
  avg_time_to_fill: number;
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
  name: string;
  total_experience: string;
  skill_set: string[];
  recruiter_name: string;
  joined_date?: string;
  time_to_hire?: number;
  time_to_fill?: number;
  status: 'offer_released' | 'joined';
}

// Fetch drive insights for a specific vacancy
export async function fetchDriveInsights(vacancyId?: string, monthYear?: string): Promise<DriveInsights> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const params = new URLSearchParams();
    if (vacancyId) {
      params.append('vacancy_id', vacancyId);
    }
    if (monthYear) {
      params.append('month_year', monthYear);
    }
    const url = `${API_BASE_URL}/analytics/drive-insights${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url, {
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
      vacancy_id: vacancyId || '',
      total_candidates: apiData.metrics.total_candidates,
      attended: apiData.metrics.attended,
      not_attended: apiData.metrics.not_attended,
      cleared_all_rounds: apiData.metrics.cleared_all_rounds,
      rejected_count: apiData.metrics.rejected_count || 0,
      joined_count: apiData.metrics.cleared_all_rounds, // Using cleared_all_rounds as joined
      joined_per_vacancy: `${apiData.metrics.cleared_all_rounds} / ${apiData.vacancy_info.number_of_vacancies}`,
      avg_time_to_hire: apiData.insights.average_time_to_hire_days,
      avg_time_to_fill: apiData.insights.average_time_to_fill_days || 0,
    };
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching drive insights:', error);
    throw error;
  }
}

// Fetch joined candidates with filters
export async function fetchJoinedCandidates(
  exportData: boolean = false
): Promise<JoinedCandidate[] | Blob> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const params = new URLSearchParams();
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

    const responseData = await response.json();
    console.log('Joined candidates API response:', responseData);
    
    // Extract joined_candidates array from response
    const data: JoinedCandidate[] = responseData.joined_candidates || [];
    console.log('Extracted joined candidates:', data);
    
    return data;
  } catch (error) {
    console.error('Error fetching joined candidates:', error);
    throw error;
  }
}
