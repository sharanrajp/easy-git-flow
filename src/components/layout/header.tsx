import { useState, useEffect } from "react"
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
import { Bell, LogOut, User as UserIcon, Settings, LayoutDashboard, Users, UserCheck, Briefcase, Menu, ChevronDown, Power } from "lucide-react"
import { type User, logout, updateUserStatus } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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
  superadmin: [
    { name: "Dashboard", href: "/dashboard/superadmin", icon: LayoutDashboard },
    { name: "Candidates", href: "/dashboard/hr/candidates", icon: UserCheck },
    { name: "Users", href: "/dashboard/hr/users", icon: Users },
    { name: "Vacancies", href: "/dashboard/hr/vacancies", icon: Briefcase },
  ],
}

export function Header({ user, onUserUpdate }: HeaderProps) {
  const navigate = useNavigate()
  const pathname = useLocation().pathname
  const { toast } = useToast()
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const items = navigationItems[user.role] || []

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleStatusChange = async (current_status: User["privileges"]["status"]) => {
    if (user.role !== "hr" && current_status && !isUpdatingStatus) {
      try {
        setIsUpdatingStatus(true)
        await updateUserStatus(user._id, current_status)
        
        // Update the user object and notify parent component
        const updatedUser = { ...user, privileges: { ...user.privileges, status: current_status } }
        onUserUpdate?.(updatedUser)
        
        toast({
          title: "Status Updated",
          description: `Your status has been changed to ${current_status === "free" ? "available" : current_status}`,
        })
      } catch (error) {
        console.error('Failed to update status:', error)
        toast({
          title: "Error",
          description: "Failed to update status. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsUpdatingStatus(false)
      }
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
      case "interview-assigned":
        return "bg-rose-100 text-rose-800 ring-rose-200"
      default:
        return "bg-slate-100 text-slate-800 ring-slate-200"
    }
  }

  return (
    <header className="bg-gradient-card backdrop-blur-xl border-b border-border/50 shadow-card sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            <img src="/vuedata-blue.webp" alt="vueDataImage" draggable="false" height={25} width={150}/>
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

          {/* Profile Display */}
          <div className="flex items-center space-x-3">
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
              <div className="text-xs text-muted-foreground capitalize">{user.role || "Panelist"}</div>
            </div>
          </div>

          {/* Status Badge with Popover for Panelists */}
          {user.role !== "hr" && user.role !== "admin" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "status-badge px-3 py-1.5 h-auto smooth-transition cursor-pointer hover:opacity-80",
                    getStatusColor(user?.privileges?.status || "free")
                  )}
                >
                  {user?.privileges?.status === "free" ? "available" : user?.privileges?.status || "available"}
                </Button>
              </PopoverTrigger>
              {!["interview-assigned", "in_interview"].includes(user?.privileges?.status || "") && (
              <PopoverContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border-border/50 shadow-elegant p-2 m-2">
                <div className="space-y-1">
                  <div className="px-3 py-2 text-sm font-semibold text-foreground">Change Status</div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start smooth-transition"
                    onClick={() => handleStatusChange("free")}
                    disabled={isUpdatingStatus}
                  >
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3 shadow-sm"></div>
                      Available
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start smooth-transition"
                    onClick={() => handleStatusChange("break")}
                    disabled={isUpdatingStatus}
                  >
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-slate-500 rounded-full mr-3 shadow-sm"></div>
                      Break
                    </div>
                  </Button>
                </div>
              </PopoverContent>)}
            </Popover>
          )}

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive smooth-transition rounded-xl"
            title="Logout"
          >
            <Power className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
