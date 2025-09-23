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

function getStoredUsers(): User[] {
  const stored = localStorage.getItem("ats_users")
  if (!stored) return []
  return JSON.parse(stored)
}

function saveUsers(users: User[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("ats_users", JSON.stringify(users))
  }
}

export function authenticateUser(email: string, password: string): User | null {
  console.log("[v0] Login attempt:", { email, password: password ? "***" : "empty" })

  if (password !== "1234") {
    console.log("[v0] Password mismatch - expected '1234', got:", password)
    return null
  }

  const users = getStoredUsers()
  const user = users.find((u) => u.email === email)
  if (user) {
    console.log("[v0] User found:", user.name, user.role)
    localStorage.setItem("ats_user", JSON.stringify(user))
    return user
  } else {
    console.log("[v0] No user found for email:", email)
  }
  return null
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem("ats_user")
  return stored ? JSON.parse(stored) : null
}

export function logout(): void {
  localStorage.removeItem("ats_user")
}

export function getAllUsers(): User[] {
  return getStoredUsers()
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
  const index = users.findIndex((u) => u.id === updatedUser.id)
  if (index !== -1) {
    users[index] = updatedUser
    saveUsers(users)
  }
}

export function deleteUser(userId: string): void {
  const users = getStoredUsers()
  const filteredUsers = users.filter((u) => u.id !== userId)
  saveUsers(filteredUsers)
}

export function updateUserStatus(userId: string, status: User["status"]): void {
  const users = getStoredUsers()
  const user = users.find((u) => u.id === userId)
  if (user) {
    user.status = status
    saveUsers(users)
    // Update stored user if it's the current user
    const currentUser = getStoredUser()
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem("ats_user", JSON.stringify({ ...currentUser, status }))
    }
  }
}

export function getCurrentUser(): User | null {
  return getStoredUser()
}
