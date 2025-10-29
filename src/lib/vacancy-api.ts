import { getToken } from './auth';
import type { Position } from './schema-data';
import { API_BASE_URL } from './api-config';

// Backend vacancy interface (what we receive from API)
interface BackendVacancy {
  _id: string;
  position_title: string;
  hiring_manager_name: string;
  recruiter_name: string;
  employment_type: string;
  priority: string;
  number_of_openings: number;
  status: string;
  experience_range: string;
  skills_required: string[];
  interview_type: string;
  drive_date: string;
  drive_location: string;
  created_at: string;
  job_desc?: string;
  // Optional fields that might not be in backend
  location?: string;
  assignedPanelists?: string[];
  request_type?: string;
  city?: string;
  projectClientName?: string;
  category?: string;
  position_approved_by?: string;
  reason_for_hiring?: string;
}

// Frontend vacancy interface for posting/updating (what we send to API)
interface VacancyCreateRequest {
  position_title: string;
  hiring_manager_name: string;
  recruiter_name: string;
  employment_type: string;
  priority: string;
  number_of_openings: number;
  status: string;
  experience_range: string;
  skills_required: string[];
  interview_type: string;
  drive_date?: string | null; // Optional - null if not applicable
  drive_location?: string; // Optional - empty or actual location
  job_desc?: string;
  request_type?: string;
  assignedPanelists?: string[];
  city?: string;
  projectClientName?: string;
  category?: string;
  position_approved_by?: string;
  reason_for_hiring?: string | null;
}

// Transform backend vacancy to frontend format
function transformBackendToFrontend(backendVacancy: BackendVacancy): Position {
  return {
    id: backendVacancy._id || "",
    position_title: backendVacancy.position_title || "",
    hiring_manager_name: backendVacancy.hiring_manager_name || "",
    recruiter_name: backendVacancy.recruiter_name || "",
    job_type: (backendVacancy.employment_type as "full_time" | "part-time" | "contract") || "full_time",
    priority: (backendVacancy.priority as "P3" | "P2" | "P1" | "P0") || "P3",
    number_of_vacancies: backendVacancy.number_of_openings || 1,
    request_type: backendVacancy.request_type || "new",
    status: (backendVacancy.status as "active" | "paused" | "closed") || "active",
    experience_range: backendVacancy.experience_range || "",
    skills_required: Array.isArray(backendVacancy.skills_required) ? backendVacancy.skills_required : [],
    interview_type: (backendVacancy.interview_type as "Walk-In") || "Walk-In",
    walkInDetails: {
      date: backendVacancy.drive_date
        ? backendVacancy.drive_date.split("T")[0] // Pure date without timezone conversion
        : "",
      location: backendVacancy.drive_location || "",
    },
    postedOn: backendVacancy.created_at || new Date().toISOString(),
    // Default values for missing fields
    location: backendVacancy.location || "",
    job_desc: backendVacancy.job_desc || "",
    assignedPanelists: Array.isArray(backendVacancy.assignedPanelists) ? backendVacancy.assignedPanelists : [],
    city: backendVacancy.city || "",
    projectClientName: backendVacancy.projectClientName || "",
    category: backendVacancy.category || "",
    position_approved_by: backendVacancy.position_approved_by || "",
    plan: backendVacancy.reason_for_hiring || "",
    drive_date: backendVacancy.drive_date || "",
    drive_location: backendVacancy.drive_location || "",
  };
}

// Transform frontend vacancy to backend format for creation/update
export function transformFrontendToBackend(frontendVacancy: Partial<Position>): VacancyCreateRequest {
  // Handle date conversion - convert to ISO string or null
  let driveDate: string | null = null;
  const dateValue = frontendVacancy.walkInDetails?.date || frontendVacancy.drive_date;
  if (dateValue && dateValue.trim() !== "") {
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      driveDate = date.toISOString();
    }
  }

  // Handle location
  const location = frontendVacancy.walkInDetails?.location || frontendVacancy.drive_location || "";

  // Handle reason for hiring
  const reasonForHiring = frontendVacancy.plan?.trim() ? frontendVacancy.plan : null;

  // Build payload with required fields
  const payload: VacancyCreateRequest = {
    position_title: frontendVacancy.position_title || "",
    hiring_manager_name: frontendVacancy.hiring_manager_name || "",
    recruiter_name: frontendVacancy.recruiter_name || "",
    employment_type: frontendVacancy.job_type || "full_time",
    priority: frontendVacancy.priority || "P3",
    number_of_openings: frontendVacancy.number_of_vacancies || 1,
    status: frontendVacancy.status || "active",
    experience_range: frontendVacancy.experience_range || "",
    skills_required: frontendVacancy.skills_required || [],
    interview_type: frontendVacancy.interview_type || "Walk-In",
    job_desc: frontendVacancy.job_desc || "",
    request_type: frontendVacancy.request_type || "new",
    city: frontendVacancy.city || "",
    projectClientName: frontendVacancy.projectClientName || "",
    category: frontendVacancy.category || "",
    position_approved_by: frontendVacancy.position_approved_by || "",
    reason_for_hiring: reasonForHiring,
    drive_date: driveDate,
    drive_location: location,
  };

  // Only include assignedPanelists if array has items
  if (frontendVacancy.assignedPanelists && frontendVacancy.assignedPanelists.length > 0) {
    payload.assignedPanelists = frontendVacancy.assignedPanelists;
  }

  return payload;
}

// Fetch all vacancies from backend
export async function fetchVacancies(): Promise<Position[]> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/Vacancy/get_all_vacancies`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch vacancies: ${response.status} ${response.statusText}`);
    }

    const backendVacancies: BackendVacancy[] = await response.json();
    return backendVacancies.map(transformBackendToFrontend);
  } catch (error) {
    console.error('Error fetching vacancies:', error);
    throw error;
  }
}

// Add a new vacancy to backend
export async function addVacancy(vacancyData: Partial<Position>): Promise<Position> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const backendData = transformFrontendToBackend(vacancyData);

  try {
    const response = await fetch(`${API_BASE_URL}/Vacancy/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(backendData),
    });

    if (!response.ok) {
      throw new Error(`Failed to add vacancy: ${response.status} ${response.statusText}`);
    }

    const backendVacancy: BackendVacancy = await response.json();
    return transformBackendToFrontend(backendVacancy);
  } catch (error) {
    console.error('Error adding vacancy:', error);
    throw error;
  }
}

// Update an existing vacancy
export async function updateVacancy(vacancyId: string, vacancyData: Partial<Position>): Promise<Position> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const backendData = transformFrontendToBackend(vacancyData);

  try {
    const response = await fetch(`${API_BASE_URL}/Vacancy/${vacancyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(backendData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update vacancy: ${response.status} ${response.statusText}`);
    }

    const backendVacancy: BackendVacancy = await response.json();
    return transformBackendToFrontend(backendVacancy);
  } catch (error) {
    console.error('Error updating vacancy:', error);
    throw error;
  }
}