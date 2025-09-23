export interface User {
  id: string
  name: string
  email: string
  role: "hr" | "panelist" | "manager"
  panelistType?: "panel-member" | "manager"
  skills?: string[]
  interviewRounds?: string[]
  status?: "available" | "in-interview" | "break" | "on-break" | "unavailable"
}

// Users will be fetched from API, no initial data needed

async function fetchUsers(): Promise<User[]> {
  const response = await fetch("http://127.0.0.1:8000/panels/with-status")
  if (!response.ok) throw new Error("Failed to fetch users")
  const users = await response.json() || []
  localStorage.setItem("ats_users", JSON.stringify(users))
  return users
}

export async function getAllUsers(): Promise<User[]> {
  return fetchUsers()
}

export function logout(): void {
  // No localStorage to clear, just navigation handled by components
}

// Note: User management functions would need to be updated to use API endpoints
// For now, keeping basic structure but these should make API calls

export async function addUser(user: User): Promise<void> {
  // TODO: Implement POST request to backend
  throw new Error("Not implemented - should POST to backend")
}

export async function updateUser(updatedUser: User): Promise<void> {
  // TODO: Implement PUT request to backend
  throw new Error("Not implemented - should PUT to backend")
}

export async function deleteUser(userId: string): Promise<void> {
  // TODO: Implement DELETE request to backend
  throw new Error("Not implemented - should DELETE to backend")
}

export async function updateUserStatus(userId: string, status: User["status"]): Promise<void> {
  // TODO: Implement PATCH request to backend
  throw new Error("Not implemented - should PATCH to backend")
}

export function getCurrentUser(): User | null {
  // Since we removed localStorage, return null for now
  // This will need to be replaced with proper user state management
  return null
}
