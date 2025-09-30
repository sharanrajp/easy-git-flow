import { getToken, makeAuthenticatedRequest } from './auth';

const API_BASE_URL = 'http://127.0.0.1:8000';

export interface BackendCandidate {
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
  recruiter?: string;
  assignedPanelist?: string;
  currentRound?: string;
  interviewDateTime?: string;
  waitTime?: string | null;
  waitTimeStarted?: string | null;
  isCheckedIn?: boolean;
  final_status?: string;
  last_interview_round?: string;
  panel_name?: string;
  current_ctc?: string;
  expected_ctc?: string;
  notice_period?: string;
  willing_to_relocate?: boolean;
  negotiable_ctc?: boolean;
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
  total_experience?:any;
  notice_period?:string;
  current_ctc?:any;
  interview_type?:string;
  willing_to_relocate?:boolean;
  applied_position?:string;
  created_at?:string;
  expected_ctc?:string;
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
export async function addCandidate(candidateData: Partial<BackendCandidate>): Promise<BackendCandidate> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const formData = new FormData()
    formData.append("candidate_data", JSON.stringify(candidateData))
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

// Fetch assigned candidates for panelist from backend
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