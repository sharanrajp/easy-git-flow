import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, UserCheck, Briefcase, FileText, Menu, X } from "lucide-react"
import type { User } from "@/lib/auth"

interface SidebarProps {
  user: User
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<any>
}

const getNavigationItems = (role: string): NavigationItem[] => {
  const items: Record<string, NavigationItem[]> = {
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
  
  return items[role] || []
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = useLocation().pathname
  const [isCollapsed, setIsCollapsed] = useState(false)

  const items = getNavigationItems(user.role)

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsCollapsed(true)} />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-white border-r transition-all duration-300 lg:relative lg:translate-x-0",
          isCollapsed ? "-translate-x-full lg:w-16" : "w-64",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <img src="/vuedata-blue.webp" alt="vueDataImage" draggable="false" height={25} width={200}/>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ATS</span>
              </div>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="lg:hidden">
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {items.map((item: NavigationItem) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.name} to={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-blue-600 text-white hover:bg-blue-700",
                    isCollapsed && "px-2",
                  )}
                >
                  <Icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                  {!isCollapsed && item.name}
                </Button>
              </Link>
            )
          })}
        </nav>

        {!isCollapsed && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900">{user.name}</div>
              <div className="text-xs text-blue-700 capitalize">{user.role}</div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}