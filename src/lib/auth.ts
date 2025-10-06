export interface User {
  _id: string
  name: string
  email: string
  role: "hr" | "panelist" | "manager" | "admin"
  panelist_type?: "panel_member" | "manager"
  skill_set?: string[]
  available_rounds?: string[]
  current_status?: "free" | "in_interview" | "break"
}

// Token management functions
export function getToken(): string | null {
  if (typeof window === "undefined") return null
  const token = localStorage.getItem("ats_token")
  return token
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("ats_token", token)
  }
}

export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("ats_token")
  }
}

// Refresh token function
export async function refreshToken(): Promise<string | null> {
  const currentToken = getToken()
  if (!currentToken) return null

  try {
    const response = await fetch("http://127.0.0.1:8000/auth/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${currentToken}`
      }
    })

    if (!response.ok) {
      removeToken()
      return null
    }

    const data = await response.json()
    const { access_token } = data
    
    if (access_token) {
      setToken(access_token)
      return access_token
    }
    
    return null
  } catch (error) {
    console.error("Token refresh failed:", error)
    removeToken()
    return null
  }
}

// API Base URL Configuration
const API_BASE_URL = "http://127.0.0.1:8000"

// Authenticated API call helper
export async function makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
  let token = getToken()
  
  if (!token) {
    throw new Error("No authentication token found")
  }

  // Prepend base URL if the URL is relative
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`

  // Check if the body is FormData to avoid setting Content-Type
  const isFormData = options.body instanceof FormData

  const authOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      "Authorization": `Bearer ${token}`,
      // Only set Content-Type for non-FormData requests
      ...(isFormData ? {} : { "Content-Type": "application/json" })
    }
  }

  let response = await fetch(fullUrl, authOptions)

  // If unauthorized, try to refresh token and retry
  if (response.status === 401) {
    const newToken = await refreshToken()
    if (newToken) {
      authOptions.headers = {
        ...authOptions.headers,
        "Authorization": `Bearer ${newToken}`
      }
      response = await fetch(fullUrl, authOptions)
    }
  }

  // Check if response is HTML instead of JSON (common when endpoints don't exist)
  const contentType = response.headers.get('content-type')
  if (!response.ok && contentType?.includes('text/html')) {
    throw new Error(`API endpoint not found: ${fullUrl}. Server returned HTML instead of JSON.`)
  }

  return response
}

// User management functions
function getStoredUsers(): User[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("ats_users")
  return stored ? JSON.parse(stored) : []
}

function saveUsers(users: User[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("ats_users", JSON.stringify(users))
  }
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem("ats_user")
  return stored ? JSON.parse(stored) : null
}

async function fetchUsers(): Promise<User[]> {
  try {
    const response = await makeAuthenticatedRequest("http://127.0.0.1:8000/panels/with-status")
    
    if (!response.ok) {
      throw new Error("Failed to fetch users")
    }
    
    const users = await response.json() || []
    saveUsers(users)
    return users
  } catch (error) {
    console.error("Error fetching users:", error)
    // Return cached users if API fails
    return getStoredUsers()
  }
}

export async function getAllUsers(): Promise<User[]> {
  return fetchUsers()
}

export function logout(): void {
  removeToken()
  localStorage.removeItem("ats_user")
  localStorage.removeItem("ats_users")
}

export async function addUser(user: User): Promise<void> {
  // TODO: Implement POST request to backend with authentication
  throw new Error("Not implemented - should POST to backend with auth")
}

export async function updateUser(updatedUser: User): Promise<void> {
  const response = await makeAuthenticatedRequest(`http://127.0.0.1:8000/admin/edit-user/${updatedUser._id}`, {
    method: "PUT",
    body: JSON.stringify(updatedUser)
  })

  if (!response.ok) {
    throw new Error("Failed to update user")
  }
}

export async function deleteUser(userId: string): Promise<void> {
  const response = await makeAuthenticatedRequest(`http://127.0.0.1:8000/admin/delete-user/${userId}`, {
    method: "DELETE"
  })

  if (!response.ok) {
    throw new Error("Failed to delete user")
  }
}

export async function updateUserStatus(userId: string, current_status: User["current_status"]): Promise<void> {
  // Validate status before API call - only "free" or "break" allowed for API
  const apiStatus = current_status === "free" ? "free" : "break"
  
  const response = await makeAuthenticatedRequest("/privileges/my-status", {
    method: "PUT",
    body: JSON.stringify({ status: apiStatus })
  })

  if (!response.ok) {
    throw new Error("Failed to update status")
  }

  // Update local storage with the validated status
  const currentUser = getStoredUser()
  if (currentUser) {
    currentUser.current_status = apiStatus
    localStorage.setItem("ats_user", JSON.stringify(currentUser))
  }
}

export async function fetchUserProfile(): Promise<User> {
  const response = await makeAuthenticatedRequest("/user/me")
  
  if (!response.ok) {
    throw new Error("Failed to fetch user profile")
  }
  
  return response.json()
}

export function getCurrentUser(): User | null {
  return getStoredUser()
}
