 

import { useState } from "react"
import { useNavigate } from "react-router-dom"
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
import { Bell, LogOut, UserIcon } from "lucide-react"
import { type User, logout, updateUserStatus } from "@/lib/auth"

interface HeaderProps {
  user: User
  onUserUpdate?: (user: User) => void
}

export function Header({ user, onUserUpdate }: HeaderProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleStatusChange = async (current_status: User["current_status"]) => {
    if (user.role === "panelist" && current_status && !isUpdatingStatus) {
      try {
        setIsUpdatingStatus(true)
        await updateUserStatus(user._id, current_status)
        
        // Update the user object and notify parent component
        const updatedUser = { ...user, current_status }
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
        return "bg-green-100 text-green-800"
      case "in_interview":
        return "bg-orange-100 text-orange-800"
      case "break":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <header className="border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">ATS Dashboard</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                </div>
                {user.role === "panelist" && user.current_status && (
                  <Badge className={getStatusColor(user.current_status)}>{user.current_status === "free" ? "available" : user.current_status}</Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>

              {user.role === "panelist" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={() => handleStatusChange("free")}
                    disabled={isUpdatingStatus}
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Available {isUpdatingStatus && user.current_status !== "free" ? "(updating...)" : ""}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleStatusChange("break")}
                    disabled={isUpdatingStatus}
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                      Break {isUpdatingStatus && user.current_status !== "break" ? "(updating...)" : ""}
                    </div>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
