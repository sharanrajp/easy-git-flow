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

// Initial mock user data
const initialUsers: User[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "hr@company.com",
    role: "hr",
  },
  {
    id: "2",
    name: "Mike Chen",
    email: "panelist@company.com",
    role: "panelist",
    panelistType: "panel-member",
    skills: ["React", "Node.js", "TypeScript"],
    interviewRounds: ["R1", "R2"],
    status: "available",
  },
  {
    id: "3",
    name: "Emily Davis",
    email: "manager@company.com",
    role: "panelist",
    panelistType: "manager",
    interviewRounds: ["R1", "R2", "R3"],
    status: "available",
  },
  {
    id: "4",
    name: "Alex Rodriguez",
    email: "panelist2@company.com",
    role: "panelist",
    panelistType: "panel-member",
    skills: ["Python", "Django", "PostgreSQL"],
    interviewRounds: ["R1", "R2"],
    status: "available",
  },
  {
    id: "5",
    name: "Lisa Wang",
    email: "panelist3@company.com",
    role: "panelist",
    panelistType: "panel-member",
    skills: ["Java", "Spring Boot", "AWS"],
    interviewRounds: ["R1", "R2"],
    status: "available",
  },
  {
    id: "6",
    name: "David Kim",
    email: "manager2@company.com",
    role: "panelist",
    panelistType: "manager",
    interviewRounds: ["R1", "R2", "R3"],
    status: "available",
  },
  {
    id: "7",
    name: "Jennifer Taylor",
    email: "hr2@company.com",
    role: "hr",
  },
  {
    id: "8",
    name: "Robert Zhang",
    email: "panelist4@company.com",
    role: "panelist",
    panelistType: "panel-member",
    skills: ["Vue.js", "PHP", "MySQL"],
    interviewRounds: ["R1", "R2"],
    status: "available",
  },
  {
    id: "9",
    name: "Karen Foster",
    email: "panelist5@company.com",
    role: "panelist",
    panelistType: "panel-member",
    skills: ["Angular", "C#", ".NET"],
    interviewRounds: ["R1", "R2"],
    status: "in-interview",
  },
  {
    id: "10",
    name: "Michael Brown",
    email: "manager3@company.com",
    role: "panelist",
    panelistType: "manager",
    interviewRounds: ["R1", "R2", "R3"],
    status: "available",
  },
  {
    id: "11",
    name: "Amanda Wilson",
    email: "panelist6@company.com",
    role: "panelist",
    panelistType: "panel-member",
    skills: ["Go", "Docker", "Kubernetes"],
    interviewRounds: ["R1", "R2"],
    status: "on-break",
  },
  {
    id: "12",
    name: "Daniel Martinez",
    email: "panelist7@company.com",
    role: "panelist",
    panelistType: "panel-member",
    skills: ["Rust", "GraphQL", "PostgreSQL"],
    interviewRounds: ["R1", "R2"],
    status: "available",
  },
  {
    id: "13",
    name: "Nicole Thompson",
    email: "hr3@company.com",
    role: "hr",
  },
  {
    id: "14",
    name: "Steven Lee",
    email: "manager4@company.com",
    role: "panelist",
    panelistType: "manager",
    interviewRounds: ["R1", "R2", "R3"],
    status: "available",
  },
  {
    id: "15",
    name: "Jessica Garcia",
    email: "panelist8@company.com",
    role: "panelist",
    panelistType: "panel-member",
    skills: ["Swift", "iOS", "Mobile Development"],
    interviewRounds: ["R1", "R2"],
    status: "available",
  },
]

function getStoredUsers(): User[] {
  if (typeof window === "undefined") return initialUsers
  localStorage.setItem("ats_users", JSON.stringify(initialUsers))
  return initialUsers
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
