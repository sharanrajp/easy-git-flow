import { getToken } from './auth';

const API_BASE_URL = 'http://127.0.0.1:8000';

export interface BackendCandidate {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  appliedPosition: string;
  status: string;
  total_experience?: string;
  skill_set?: string[];
  source?: string;
  appliedDate: string;
  recruiter?: string;
  assignedPanelist?: string;
  currentRound?: string;
  interviewDateTime?: string;
  waitTime?: string | null;
  waitTimeStarted?: string | null;
  isCheckedIn?: boolean;
}

export interface PanelistCandidate {
  _id: string;
  register_number: string;
  name: string;
  email: string;
  phone_number?: string;
  skill_set: string;
  last_interview_round?: string;
  resume_link?: string;
  previous_rounds: Array<{
    round: string;
    status: string;
    feedback_submitted: boolean;
    rating?: number;
    feedback?: string;
    scores?: {
      communication?: number;
      problem_solving?: number;
      logical_thinking?: number;
      code_quality?: number;
      technical_knowledge?: number;
    };
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
    const response = await fetch(`http://localhost:8000/candidates/get-assigned-candidates`, {
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
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/interviews/my-assigned-candidates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch panelist assigned candidates: ${response.status} ${response.statusText}`);
    }

    const candidates: PanelistCandidate[] = await response.json();
    return candidates;
  } catch (error) {
    console.error('Error fetching panelist assigned candidates:', error);
    throw error;
  }
}