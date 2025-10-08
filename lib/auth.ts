import { API_BASE_URL } from './api-config'

export interface User {
  privileges: any
  _id: string
  name: string
  email: string
  role: "hr" | "panelist" | "manager" | "admin"
  panelist_type?: "panel_member" | "manager"
  skill_set?: string[]
  available_rounds?: string[]
  current_status?: "free" | "in_interview" | "break" | "unavailable" | "interview-assigned"
}

// Token management functions
export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("refresh_token")
}

export function setToken(access_token: string, refresh_token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", access_token)
    localStorage.setItem("refresh_token", refresh_token) // Store refresh token as well
  }
}

export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token")
  }
}

// Refresh token function
export async function refreshToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  try {
    const response = await fetch(`${API_BASE_URL}/auth/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: refreshToken
      })
    })

    if (!response.ok) {
      removeToken()
      return null
    }

    const data = await response.json()
    const { access_token, refresh_token } = data
    
    if (access_token && refresh_token) {
      setToken(access_token, refresh_token)
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

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem("ats_user")
  return stored ? JSON.parse(stored) : null
}

async function fetchUsers(): Promise<User[]> {
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/panels/with-status`)
    
    if (!response.ok) {
      throw new Error("Failed to fetch users")
    }
    
    return await response.json() || []
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export function getAllUsers(): Promise<User[]> {
  return fetchUsers()
}

export function logout(): void {
  removeToken()
  localStorage.removeItem("ats_user")
}

// Legacy functions for compatibility - now deprecated
export function authenticateUser(email: string, password: string): User | null {
  console.log("[v0] Legacy authenticateUser called - use login API instead")
  return null
}

export function updateUsersList(users: User[]): void {
  console.log("[v0] Legacy updateUsersList called - no longer supported")
}

export function addUser(user: User): void {
  console.log("[v0] Legacy addUser called - use API instead")
}

export function updateUser(updatedUser: User): void {
  console.log("[v0] Legacy updateUser called - use API instead")
}

export function deleteUser(userId: string): void {
  console.log("[v0] Legacy deleteUser called - use API instead")
}

export function updateUserStatus(userId: string, current_status: User["current_status"]): void {
  console.log("[v0] Legacy updateUserStatus called - use API instead")
}

export function getCurrentUser(): User | null {
  return getStoredUser()
}