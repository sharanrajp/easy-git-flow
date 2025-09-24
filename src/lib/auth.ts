export interface User {
  _id: string
  name: string
  email: string
  role: "hr" | "panelist" | "manager" | "admin"
  panelist_type?: "panel_member" | "manager"
  skills?: string[]
  available_rounds?: string[]
  current_status?: "free" | "in_interview" | "break" | "unavailable"
}

// Token management functions
export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("ats_token")
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

// Authenticated API call helper
export async function makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
  let token = getToken()
  
  if (!token) {
    throw new Error("No authentication token available")
  }

  const authOptions = {
    ...options,
    headers: {
      ...options.headers,
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  }

  let response = await fetch(url, authOptions)

  // If unauthorized, try to refresh token and retry
  if (response.status === 401) {
    const newToken = await refreshToken()
    if (newToken) {
      authOptions.headers = {
        ...authOptions.headers,
        "Authorization": `Bearer ${newToken}`
      }
      response = await fetch(url, authOptions)
    }
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
  // TODO: Implement PATCH request to backend with authentication
  throw new Error("Not implemented - should PATCH to backend with auth")
}

export function getCurrentUser(): User | null {
  return getStoredUser()
}
