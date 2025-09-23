import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Users, FileText, Download, Briefcase, Clock, Building2, Target, MapIcon } from "lucide-react"
import type { Vacancy } from "@/lib/mock-data"
import { getAllUsers } from "@/lib/auth"

interface VacancyDetailsProps {
  vacancy: Vacancy
}

export function VacancyDetails({ vacancy }: VacancyDetailsProps) {
  const allUsers = getAllUsers()
  const assignedPanelists = allUsers.filter((user) => vacancy.assignedPanelists.includes(user.id))

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P0":
        return "bg-red-100 text-red-700 border-red-200"
      case "P1":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "P2":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "P3":
        return "bg-gray-100 text-gray-700 border-gray-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
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
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Briefcase className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{vacancy.title}</h1>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Priority:</span>
                  <Badge className={getPriorityColor(vacancy.priority)}>{vacancy.priority}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Location:</span>
                  <span className="text-sm font-medium">{vacancy.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Interview Type:</span>
                  <span className="text-sm font-medium">Walk-in</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Job Type:</span>
                  <span className="text-sm font-medium capitalize">{vacancy.jobType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={getStatusColor(vacancy.status)}>{vacancy.status}</Badge>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600 mb-2 block">Required Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {vacancy.skills.slice(0, 6).map((skill) => (
                    <Badge key={skill} variant="secondary" className="px-2 py-1 text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {vacancy.skills.length > 6 && (
                    <Badge variant="outline" className="px-2 py-1 text-xs">
                      +{vacancy.skills.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="h-5 w-5 text-blue-600" />
            Job Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Experience Required</label>
                <p className="text-sm font-semibold text-gray-900 mt-1">{vacancy.experienceRange}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Number of Positions</label>
                <p className="text-sm font-semibold text-gray-900 mt-1">{vacancy.numberOfVacancies}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hiring Manager</label>
                <p className="text-sm font-semibold text-gray-900 mt-1">{vacancy.hiringManager}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Recruiter</label>
                <p className="text-sm font-semibold text-gray-900 mt-1">{vacancy.recruiterName}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Posted On</label>
                <p className="text-sm font-semibold text-gray-900 mt-1">{vacancy.postedOn}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Job ID</label>
                <p className="text-sm font-semibold text-gray-900 mt-1 font-mono">#{vacancy.id}</p>
              </div>
            </div>
          </div>

          {/* Job Description */}
          {vacancy.jobDescription && (
            <div className="mt-6 pt-6 border-t">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                Job Description
              </label>
              {vacancy.jobDescription.startsWith("File uploaded:") ? (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {vacancy.jobDescription.replace("File uploaded: ", "")}
                      </p>
                      <p className="text-xs text-blue-600">Click to view document</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{vacancy.jobDescription}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-green-600" />
            Application Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{vacancy.applications}</div>
              <div className="text-sm font-medium text-blue-700">Total Applications</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{vacancy.shortlisted}</div>
              <div className="text-sm font-medium text-orange-700">Selected</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{vacancy.interviewed}</div>
              <div className="text-sm font-medium text-purple-700">Interviewed</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{vacancy.selected}</div>
              <div className="text-sm font-medium text-green-700">Selected</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-purple-600" />
            Interview Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Interview Type
              </label>
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Walk-in Interview</span>
              </div>
            </div>
            {vacancy.walkInDetails && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Drive Date
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">{vacancy.walkInDetails.date}</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Interview Location
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                    <MapIcon className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">{vacancy.walkInDetails.location}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Assigned Panelists
            </div>
            <Badge variant="outline" className="px-3 py-1">
              {assignedPanelists.length} assigned
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignedPanelists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignedPanelists.map((panelist) => (
                <div
                  key={panelist.id}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {panelist.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{panelist.name}</p>
                    <p className="text-xs text-gray-600 truncate">{panelist.email}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {panelist.role}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No panelists assigned yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
