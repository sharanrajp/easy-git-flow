import { getToken, makeAuthenticatedRequest } from './auth';
import { API_BASE_URL } from './api-config';

export interface BackendCandidate {
  location: string;
  last_interview_round: string;
  final_status: string;
  _id: string;
  name: string;
  email: string;
  phone_number?: string;
  applied_position: string;
  status: string;
  total_experience?: string;
  skill_set?: string[];
  source?: string;
  created_at: string;
  updated_at?: string;
  recruiter_name?: string;
  assignedPanelist?: string;
  currentRound?: string;
  interviewDateTime?: string;
  waitTime?: string | null;
  waitTimeStarted?: string | null;
  checked_in?: boolean;
  wait_duration_minutes?: number;
  current_ctc?: string;
  expected_ctc?: string;
  notice_period?: string;
  willing_to_relocate?: boolean;
  negotiable_ctc?: boolean;
  other_source?: string;
  vacancyId?: string;
  resume_link?: string;
  offer_released_date?: string;
  joined_date?: string;
  interview_type?: "walk-in" | "virtual";
  interview_id?: string;
  interview_date?: string;
  interview_time?: string;
  meeting_link?: string;
  panel_members?: string[];
  panel_name?: string;
  previous_rounds?: Array<{
    round: string;
    status: string;
    feedback_submitted?: boolean;
    rating?: number;
    feedback?: string;
  }>;
}

export interface PanelistCandidate {
  _id: string;
  register_number: string;
  name: string;
  email: string;
  phone_number?: string;
  skill_set: string[];
  last_interview_round?: string;
  resume_link?: string;
  interview_type?:string;
  total_experience?:any;
  notice_period?:string;
  expected_ctc?:string;
  current_ctc?:any;
  recruiter_name?:string;
  willing_to_relocate?:boolean;
  created_at?:string;
  applied_position?: string
  final_status?: string;
  feedback_submitted?: boolean;
  job_match?: {
    strengths: string[];
    gaps: string[];
    match_percentage: number;
  };
  resume_summary?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  meeting_link?: string;
  panel_members?: string[];
  previous_rounds: Array<{
    round: string;
    status: string;
    feedback_submitted: boolean;
    rating?: number;
    feedback?: string;
    communication?: number;
    problem_solving?: number;
    logical_thinking?: number;
    code_quality?: number;
    technical_knowledge?: number;
    panel_name?: string
  }>;
}

export interface OngoingInterview {
  candidate_id: string;
  candidate_name: string;
  panel_id: string;
  panel_name: string;
  round: string;
}

// Fetch unassigned candidates from backend
export async function fetchUnassignedCandidates(): Promise<BackendCandidate[]> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/mapping/unassigned-candidates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch unassigned candidates: ${response.status} ${response.statusText}`);
    }

    const candidates: BackendCandidate[] = await response.json();
    return candidates;
  } catch (error) {
    console.error('Error fetching unassigned candidates:', error);
    throw error;
  }
}

// Add a new candidate
export async function addCandidate(candidateData: Partial<BackendCandidate>, resumeFile?: File): Promise<BackendCandidate> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const formData = new FormData()
    formData.append("candidate_data", JSON.stringify(candidateData))
    
    // Append resume file if provided
    if (resumeFile) {
      formData.append("resume", resumeFile)
    }
    
    const response = await fetch(`${API_BASE_URL}/candidates/add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to add candidate: ${response.status} ${response.statusText}`);
    }

    const newCandidate: BackendCandidate = await response.json();
    return newCandidate;
  } catch (error) {
    console.error('Error adding candidate:', error);
    throw error;
  }
}

// Fetch assigned candidates from backend
export async function fetchAssignedCandidates(): Promise<BackendCandidate[]> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/candidates/get-assigned-candidates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch assigned candidates: ${response.status} ${response.statusText}`);
    }

    const candidates: BackendCandidate[] = await response.json();
    return candidates;
  } catch (error) {
    console.error('Error fetching assigned candidates:', error);
    throw error;
  }
}

// Update candidate check-in status
export async function updateCandidateCheckIn(candidateId: string, checked: boolean): Promise<void> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/checked-in`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ checked_in: checked }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update candidate check-in status: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error updating candidate check-in status:', error);
    throw error;
  }
}

// Fetch panelists for a specific candidate and vacancy
export async function fetchPanelistsForCandidate(candidateId: string, vacancyId: string): Promise<any[]> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/Vacancy/getpanelist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        candidateId: candidateId,
        vacancyId: vacancyId
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch panelists: ${response.status} ${response.statusText}`);
    }

    const panelists = await response.json();
    return panelists;
  } catch (error) {
    console.error('Error fetching panelists for candidate:', error);
    throw error;
  }
}

// Fetch available panels (kept for backward compatibility)
export async function fetchAvailablePanels(round: string = 'r1'): Promise<any[]> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/mapping/available-panels?round=${round}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch available panels: ${response.status} ${response.statusText}`);
    }

    const panels = await response.json();
    return panels;
  } catch (error) {
    console.error('Error fetching available panels:', error);
    throw error;
  }
}

// Fetch all panels with status
export async function fetchPanelsWithStatus(): Promise<any[]> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/panels/with-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch panels with status: ${response.status} ${response.statusText}`);
    }

    const panels = await response.json();
    return panels;
  } catch (error) {
    console.error('Error fetching panels with status:', error);
    throw error;
  }
}

// Assign candidate to panel
export async function assignCandidateToPanel(candidateId: string, panelId: string, round: string = 'r1', assignedBy: string): Promise<void> {
  console.log('assignCandidateToPanel called with:', { candidateId, panelId, round, assignedBy }) // Debug log
  
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const requestBody = {
      candidate_id: candidateId,
      panel_id: panelId,
      round: round,
      assigned_by: assignedBy
    }
    
    console.log('Request body for assignment:', requestBody) // Debug log
    
    const response = await fetch(`${API_BASE_URL}/mapping/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Assignment response status:', response.status) // Debug log
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Assignment error response:', errorText) // Debug log
      throw new Error(`Failed to assign candidate to panel: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error assigning candidate to panel:', error);
    throw error;
  }
}

// Undo assignment
export async function undoAssignment(candidateId: string, panelId: string): Promise<void> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/mapping/undo-assignment/${candidateId}/${panelId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to undo assignment: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error undoing assignment:', error);
    throw error;
  }
}

// Fetch ongoing interviews from backend
export async function fetchOngoingInterviews(): Promise<OngoingInterview[]> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/interviews/ongoing`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ongoing interviews: ${response.status} ${response.statusText}`);
    }

    const interviews: OngoingInterview[] = await response.json();
    return interviews;
  } catch (error) {
    console.error('Error fetching ongoing interviews:', error);
    throw error;
  }
}

// Export candidates to Excel/CSV
export async function exportCandidatesExcel(): Promise<Blob> {
  const response = await makeAuthenticatedRequest(`${API_BASE_URL}/export/candidates-excel`);
  
  if (!response.ok) {
    throw new Error(`Failed to export candidates: ${response.status} ${response.statusText}`);
  }
  
  return response.blob();
}

export async function fetchPanelistAssignedCandidates(): Promise<PanelistCandidate[]> {
  const token = getToken();
  
  console.log('fetchPanelistAssignedCandidates - Token:', token ? 'Present' : 'Missing');
  
  if (!token) {
    console.error('fetchPanelistAssignedCandidates - No authentication token found');
    throw new Error('No authentication token found');
  }

  try {
    console.log('fetchPanelistAssignedCandidates - Making authenticated request to:', `${API_BASE_URL}/interviews/my-assigned-candidates`);
    
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/interviews/my-assigned-candidates`, {
      method: 'GET'
    });

    console.log('fetchPanelistAssignedCandidates - Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('fetchPanelistAssignedCandidates - Response not ok:', response.status, response.statusText, errorText);
      throw new Error(`Failed to fetch panelist assigned candidates: ${response.status} ${response.statusText}`);
    }

    const candidates: PanelistCandidate[] = await response.json();
    console.log('fetchPanelistAssignedCandidates - Success:', candidates.length, 'candidates found');
    return candidates;
  } catch (error) {
    console.error('Error fetching panelist assigned candidates:', error);
    throw error;
  }
}

// Update candidate by ID
export async function updateCandidate(candidateId: string, candidateData: Partial<BackendCandidate>, resumeFile?: File): Promise<BackendCandidate> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const formData = new FormData();
    formData.append("candidate_data", JSON.stringify(candidateData));
    
    // Append resume file if provided
    if (resumeFile) {
      formData.append("resume", resumeFile);
    }
    
    const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to update candidate: ${response.status} ${response.statusText}`);
    }

    const updatedCandidate: BackendCandidate = await response.json();
    return updatedCandidate;
  } catch (error) {
    console.error('Error updating candidate:', error);
    throw error;
  }
}

// Delete candidates by IDs (supports single or multiple deletions)
export async function deleteCandidates(candidateIds: string[]): Promise<{ deleted_count: number; message: string }> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/candidates/candidates`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ candidate_ids: candidateIds }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete candidates: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting candidates:', error);
    throw error;
  }
}

// Bulk upload logs interfaces
export interface BulkUploadLog {
  upload_id: string;
  uploaded_by: string;
  upload_type: string;
  applied_position: string;
  total_candidates: number;
  added_count: number;
  skipped_count: number;
  uploaded_date: string;
  uploaded_time: string;
}

// API response interface (what we actually receive)
interface BulkUploadLogApiResponse {
  _id: string;
  upload_id: string;
  uploaded_by: string;
  uploaded_at: string;
  applied_position: string;
  source: string;
  total_candidates: number;
  added_count: number;
  skipped_count: number;
}

export interface BulkUploadLogDetails {
  upload_id: string;
  uploaded_by: string;
  upload_type: string;
  applied_position: string;
  uploaded_date: string;
  uploaded_time: string;
  added_candidates: BackendCandidate[];
  skipped_candidates: Array<{
    name: string;
    email?: string;
    reason: string;
    row_number?: number;
  }>;
}

// Fetch all bulk upload logs
export async function fetchBulkUploadLogs(uploadedBy?: string): Promise<BulkUploadLog[]> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const url = new URL(`${API_BASE_URL}/candidates/bulk-upload-log`);
    if (uploadedBy) {
      url.searchParams.append('uploaded_by', uploadedBy);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bulk upload logs: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // API returns {message: "...", logs: [...]}
    const apiLogs: BulkUploadLogApiResponse[] = data.logs || data;
    
    // Ensure the logs array is valid
    if (!Array.isArray(apiLogs)) {
      console.error('API returned non-array logs:', data);
      return [];
    }
    
    // Transform API response to match our interface
    const logs: BulkUploadLog[] = apiLogs.map(log => {
      // Split uploaded_at into date and time
      const [date, time] = log.uploaded_at.split(' ');
      
      return {
        upload_id: log.upload_id,
        uploaded_by: log.uploaded_by,
        upload_type: 'Bulk', // All entries from this endpoint are bulk uploads
        applied_position: log.applied_position,
        total_candidates: log.total_candidates,
        added_count: log.added_count,
        skipped_count: log.skipped_count,
        uploaded_date: date,
        uploaded_time: time,
      };
    });
    
    return logs;
  } catch (error) {
    console.error('Error fetching bulk upload logs:', error);
    throw error;
  }
}

// Fetch specific bulk upload log details by upload_id
export async function fetchBulkUploadLogDetails(uploadId: string): Promise<BulkUploadLogDetails> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/candidates/bulk-upload-log/${uploadId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bulk upload log details: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // API returns {message: "...", log: {...}}
    const logData = data.log || data;
    
    // Split uploaded_at into date and time
    const [date, time] = logData.uploaded_at.split(' ');
    
    // Transform API response to match our interface
    const details: BulkUploadLogDetails = {
      upload_id: logData.upload_id,
      uploaded_by: logData.uploaded_by,
      upload_type: 'Bulk', // Default value
      applied_position: logData.applied_position,
      uploaded_date: date,
      uploaded_time: time,
      added_candidates: logData.added_candidates || [],
      skipped_candidates: logData.skipped_candidates || [],
    };
    
    return details;
  } catch (error) {
    console.error('Error fetching bulk upload log details:', error);
    throw error;
  }
}

// Fetch candidate details by candidate_id
export async function fetchCandidateDetails(candidateId: string): Promise<BackendCandidate> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/candidates/details/${candidateId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch candidate details: ${response.status} ${response.statusText}`);
    }

    const candidate: BackendCandidate = await response.json();
    return candidate;
  } catch (error) {
    console.error('Error fetching candidate details:', error);
    throw error;
  }
}