import { getToken } from './auth';
import type { Vacancy } from './mock-data';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Backend vacancy interface (what we receive from API)
interface BackendVacancy {
  _id: string;
  position_title: string;
  hiring_manager_name: string;
  recruiter_name: string;
  job_type: string;
  priority: string;
  number_of_vacancies: number;
  status: string;
  experience_range: string;
  skills_required: string[];
  interview_type: string;
  drive_date: string;
  drive_location: string;
  created_at: string;
  job_desc?: string;
  // Optional fields that might not be in backend
  department?: string;
  location?: string;
  deadline?: string;
  assignedPanelists?: string[];
}

// Frontend vacancy interface for posting (what we send to API)
interface VacancyCreateRequest {
  position_title: string;
  hiring_manager_name: string;
  recruiter_name: string;
  job_type: string;
  priority: string;
  number_of_vacancies: number;
  status: string;
  experience_range: string;
  skills_required: string[];
  interview_type: string;
  drive_date: string;
  drive_location: string;
  job_desc?: string;
  request_type?:string;
}

// Transform backend vacancy to frontend format
function transformBackendToFrontend(backendVacancy: BackendVacancy): Vacancy {
  return {
    id: backendVacancy._id,
    position_title: backendVacancy.position_title,
    hiring_manager_name: backendVacancy.hiring_manager_name,
    recruiter_name: backendVacancy.recruiter_name,
    job_type: backendVacancy.job_type as "full_time" | "part-time" | "contract",
    priority: backendVacancy.priority as "P3" | "P2" | "P1" | "P0",
    number_of_vacancies: backendVacancy.number_of_vacancies,
    status: backendVacancy.status as "active" | "paused" | "closed",
    experienceRange: backendVacancy.experience_range,
    skills: backendVacancy.skills_required,
    interview_type: [backendVacancy.interview_type] as "Walk-In"[],
    walkInDetails: {
      date: backendVacancy.drive_date
        ? new Date(backendVacancy.drive_date).toISOString().split("T")[0] // ✅ "YYYY-MM-DD"
        : "",
      location: backendVacancy.drive_location,
    },
    postedOn: backendVacancy.created_at,
    // Default values for missing fields
    department: backendVacancy.department || "",
    location: backendVacancy.location || "",
    jobDescription: backendVacancy.job_desc || "",
    deadline: backendVacancy.deadline || "",
    assignedPanelists: backendVacancy.assignedPanelists || [],
    applications: 0,
    shortlisted: 0,
    interviewed: 0,
    selected: 0,
  };
}

// Transform frontend vacancy to backend format for creation
function transformFrontendToBackend(frontendVacancy: Partial<Vacancy>): VacancyCreateRequest {
  return {
    position_title: frontendVacancy.position_title || "",
    hiring_manager_name: frontendVacancy.hiring_manager_name || "",
    recruiter_name: frontendVacancy.recruiter_name || "",
    job_type: frontendVacancy.job_type || "full_time",
    priority: frontendVacancy.priority || "P3",
    number_of_vacancies: frontendVacancy.number_of_vacancies || 1,
    status: frontendVacancy.status || "active",
    experience_range: frontendVacancy.experienceRange || "",
    skills_required: frontendVacancy.skills || [],
    interview_type: frontendVacancy.interview_type?.[0] || "Walk-In",
    drive_date: new Date(frontendVacancy.walkInDetails?.date || "").toISOString() || "",
    drive_location: frontendVacancy.walkInDetails?.location || "",
    job_desc: frontendVacancy.jobDescription || "",
    request_type: frontendVacancy.request_type || "new",
  };
}

// Fetch all vacancies from backend
export async function fetchVacancies(): Promise<Vacancy[]> {
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
export async function addVacancy(vacancyData: Partial<Vacancy>): Promise<Vacancy> {
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