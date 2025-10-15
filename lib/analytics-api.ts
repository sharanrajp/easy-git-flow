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

    const data: DriveInsights = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching drive insights:', error);
    throw error;
  }
}
