export interface User {
  _id: string
  name: string
  email: string
  role: "hr" | "panelist" | "manager" | "admin"
  panelist_type?: "panel_member" | "manager"
  skill_set?: string[]
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

export function getAllUsers(): Promise<User[]> {
  return fetchUsers()
}

export function logout(): void {
  removeToken()
  localStorage.removeItem("ats_user")
  localStorage.removeItem("ats_users")
}

// Legacy functions for compatibility
export function authenticateUser(email: string, password: string): User | null {
  console.log("[v0] Legacy authenticateUser called - use login API instead")
  return null
}

export function updateUsersList(users: User[]): void {
  saveUsers(users)
}

export function addUser(user: User): void {
  const users = getStoredUsers()
  users.push(user)
  saveUsers(users)
}

export function updateUser(updatedUser: User): void {
  const users = getStoredUsers()
  const index = users.findIndex((u) => u._id === updatedUser._id)
  if (index !== -1) {
    users[index] = updatedUser
    saveUsers(users)
  }
}

export function deleteUser(userId: string): void {
  const users = getStoredUsers()
  const filteredUsers = users.filter((u) => u._id !== userId)
  saveUsers(filteredUsers)
}

export function updateUserStatus(userId: string, current_status: User["current_status"]): void {
  const users = getStoredUsers()
  const user = users.find((u) => u._id === userId)
  if (user) {
    user.current_status = current_status
    saveUsers(users)
    // Update stored user if it's the current user
    const currentUser = getStoredUser()
    if (currentUser && currentUser._id === userId) {
      localStorage.setItem("ats_user", JSON.stringify({ ...currentUser, current_status }))
    }
  }
}

export function getCurrentUser(): User | null {
  return getStoredUser()
}