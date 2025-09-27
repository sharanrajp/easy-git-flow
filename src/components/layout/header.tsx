import { useState } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell, LogOut, User as UserIcon, Settings, LayoutDashboard, Users, UserCheck, Briefcase, Menu, ChevronDown } from "lucide-react"
import { type User, logout, makeAuthenticatedRequest } from "@/lib/auth"
import { cn } from "@/lib/utils"

interface HeaderProps {
  user: User
  onUserUpdate?: (user: User) => void
}

const navigationItems = {
  hr: [
    { name: "Dashboard", href: "/dashboard/hr", icon: LayoutDashboard },
    { name: "Candidates", href: "/dashboard/hr/candidates", icon: UserCheck },
    { name: "Users", href: "/dashboard/hr/users", icon: Users },
    { name: "Vacancies", href: "/dashboard/hr/vacancies", icon: Briefcase },
  ],
  admin: [
    { name: "Dashboard", href: "/dashboard/hr", icon: LayoutDashboard },
    { name: "Candidates", href: "/dashboard/hr/candidates", icon: UserCheck },
    { name: "Users", href: "/dashboard/hr/users", icon: Users },
    { name: "Vacancies", href: "/dashboard/hr/vacancies", icon: Briefcase },
  ],
  panelist: [
    { name: "Dashboard", href: "/dashboard/panelist", icon: LayoutDashboard },
    { name: "Candidates", href: "/dashboard/panelist/candidates", icon: UserCheck },
  ],
  manager: [
    { name: "Dashboard", href: "/dashboard/manager", icon: LayoutDashboard },
    { name: "Candidates", href: "/dashboard/manager/candidates", icon: UserCheck },
    { name: "Offers", href: "/dashboard/manager/offers", icon: Briefcase },
  ],
}

export function Header({ user, onUserUpdate }: HeaderProps) {
  const navigate = useNavigate()
  const pathname = useLocation().pathname
  const [currentStatus, setCurrentStatus] = useState("free")
  const { toast } = useToast()
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const items = navigationItems[user.role] || []

  const handleLogout = () => {
    logout()
    navigate("/login")
  }
  const handleStatusChange = async (userId: string, current_status: User["current_status"]) => {
    try {
      const response = await makeAuthenticatedRequest(
        `http://127.0.0.1:8000/admin/update-status/${userId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ current_status }),
        }
      )

      if (response.ok) {
        console.log("Status updated successfully")
        setCurrentStatus(current_status || "")
      } else {
        console.error("Failed to update status:", await response.text())
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const getStatusColor = (current_status?: string) => {
    switch (current_status) {
      case "free":
        return "bg-emerald-100 text-emerald-800 ring-emerald-200"
      case "in_interview":
        return "bg-amber-100 text-amber-800 ring-amber-200"
      case "break":
        return "bg-slate-100 text-slate-800 ring-slate-200"
      case "unavailable":
        return "bg-rose-100 text-rose-800 ring-rose-200"
      default:
        return "bg-slate-100 text-slate-800 ring-slate-200"
    }
  }

  return (
    <header className="bg-gradient-card backdrop-blur-xl border-b border-border/50 shadow-card sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <img src="/vuedata-blue.webp" alt="vueDataImage" draggable="false" height={25} width={200}/>
          </div>
          
          {/* Navigation Items */}
          {user.role !== "panelist" && (
            <nav className="hidden md:flex items-center space-x-2">
              {items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link key={item.name} to={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "flex items-center space-x-2 px-6 py-3 rounded-xl smooth-transition font-semibold",
                        isActive 
                          ? "bg-gradient-primary text-white shadow-glow hover:shadow-elegant" 
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                )
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Mobile Navigation Menu for non-panelist users */}
          {user.role !== "panelist" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="md:hidden px-4 py-3 rounded-xl hover:bg-accent/50">
                  <Menu className="h-4 w-4 mr-2" />
                  Menu
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border-border/50 shadow-elegant">
                <DropdownMenuLabel className="font-semibold">Navigation</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link 
                        to={item.href} 
                        className={cn(
                          "flex items-center space-x-3 smooth-transition",
                          isActive && "bg-accent text-accent-foreground font-semibold"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-accent/50 smooth-transition">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-semibold text-foreground">{user.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
                </div>
                {user.role === "panelist" && user.current_status && (
                  <Badge className={cn("status-badge", getStatusColor(currentStatus))}>{currentStatus === "free" ? "available" : currentStatus}</Badge>
                )}
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border-border/50 shadow-elegant">
              <DropdownMenuLabel className="font-semibold">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="smooth-transition">
                <UserIcon className="mr-3 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="smooth-transition">
                <Settings className="mr-3 h-4 w-4" />
                Settings
              </DropdownMenuItem>

              {user.role === "panelist" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="font-semibold">Change Status</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleStatusChange(user._id, "free")} className="smooth-transition">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3 shadow-sm"></div>
                      Available {isUpdatingStatus && user.current_status !== "free" ? "(updating...)" : ""}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange(user._id, "break")} className="smooth-transition">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-slate-500 rounded-full mr-3 shadow-sm"></div>
                      Break {isUpdatingStatus && user.current_status !== "break" ? "(updating...)" : ""}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange(user._id, "unavailable")} className="smooth-transition">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-rose-500 rounded-full mr-3 shadow-sm"></div>
                      Unavailable {isUpdatingStatus && user.current_status !== "unavailable" ? "(updating...)" : ""}
                    </div>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-destructive focus:text-destructive smooth-transition"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
