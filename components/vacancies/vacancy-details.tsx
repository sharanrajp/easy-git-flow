import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Users, FileText, Download, Briefcase, Clock, Building2, Target } from "lucide-react"
import type { Vacancy } from "@/lib/schema-data"
import { getAllUsers, type User } from "@/lib/auth"
import { formatDate } from "../../src/lib/utils"
import { SkillsDisplay } from "../../src/components/ui/skills-display"

interface VacancyDetailsProps {
  vacancy: Vacancy
}

export function VacancyDetails({ vacancy }: VacancyDetailsProps) {
  const [allUsers, setAllUsers] = useState<User[]>([])
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllUsers()
        setAllUsers(users)
      } catch (error) {
        console.error("Failed to fetch users:", error)
        setAllUsers([])
      }
    }
    fetchUsers()
  }, [])
  
  const assignedPanelists = allUsers.filter((user: User) => vacancy.assignedPanelists.includes(user._id))

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P0":
        return "bg-red-100 text-red-800 border-red-200"
      case "P1":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "P2":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "P3":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "paused":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{vacancy.position_title}</h1>
          <div className="flex items-center space-x-4 mt-2">
            <Badge className={getStatusColor(vacancy.status)} variant="outline">
              {vacancy.status}
            </Badge>
            <Badge className={getPriorityColor(vacancy.priority)} variant="outline">
              {vacancy.priority}
            </Badge>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download JD
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Position Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Experience Range</label>
                  <p className="text-gray-900">{vacancy.experience_range}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-gray-900 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {vacancy.location}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Job Type</label>
                  <p className="text-gray-900 capitalize">{vacancy.job_type}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          {vacancy.job_desc && (
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700">
                    {vacancy.job_desc}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills Required */}
          <Card>
            <CardHeader>
              <CardTitle>Required Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {vacancy.skills_required.map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="bg-blue-50 text-blue-700">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interview Details */}
          <Card>
            <CardHeader>
              <CardTitle>Interview Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vacancy.interview_type}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Additional Info */}
        <div className="space-y-6">
          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Key Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Open Positions</label>
                <p className="text-2xl font-bold text-gray-900">{vacancy.number_of_vacancies}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Posted Date</label>
                <p className="text-gray-900 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(vacancy.postedOn)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Team/Management Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Team Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Hiring Manager</label>
                <p className="text-gray-900">{vacancy.hiring_manager_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Recruiter</label>
                <p className="text-gray-900">{vacancy.recruiter_name}</p>
              </div>
              {vacancy.projectClientName && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Client</label>
                  <p className="text-gray-900">{vacancy.projectClientName}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Walk-in Details (if applicable) */}
          {vacancy.walkInDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Walk-in Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(vacancy.walkInDetails.date)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-gray-900 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {vacancy.walkInDetails.location}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assigned Panelists */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Assigned Panelists ({assignedPanelists.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignedPanelists.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {assignedPanelists.map((panelist: User) => (
                    <div
                      key={panelist._id}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {panelist.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{panelist.name}</h4>
                        <p className="text-sm text-gray-600">{panelist.email}</p>
                        {panelist.skill_set && (
                          <div className="mt-1">
                            <SkillsDisplay skills={panelist.skill_set} maxVisible={2} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No panelists assigned yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}