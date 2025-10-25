import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { X, Plus, Upload, Building, MapPin, Calendar, User as UserIcon, Target, FileText } from "lucide-react"
import type { Vacancy } from "@/lib/schema-data"
import { getAllUsers, type User } from "@/lib/auth"
import { PanelistSelector } from "@/components/vacancies/panelist-selector"

interface VacancyFormProps {
  vacancy?: Vacancy | null
  onSubmit: (data: any) => void
  onCancel: () => void
  currentUser?: any
}

export function VacancyForm({ vacancy, onSubmit, onCancel, currentUser }: VacancyFormProps) {
  const [formData, setFormData] = useState({
    position_title: vacancy?.position_title || "",
    location: vacancy?.location || "",
    job_type: vacancy?.job_type || "full_time",
    priority: vacancy?.priority || "P3",
    status: vacancy?.status || "active",
    hiring_manager_name: vacancy?.hiring_manager_name || "",
    recruiter_name: vacancy?.recruiter_name || currentUser?.name || "",
    number_of_vacancies: vacancy?.number_of_vacancies || 1,
    experienceFrom: vacancy?.experience_range?.split("-")[0]?.trim() || "",
    experienceTo: vacancy?.experience_range?.split("-")[1]?.replace(/[^\d]/g, "") || "",
    skills_required: vacancy?.skills_required || [],
    job_desc: vacancy?.job_desc || "",
    drive_date: vacancy?.walkInDetails?.date || vacancy?.drive_date || "",
    drive_location: vacancy?.walkInDetails?.location || vacancy?.drive_location || "",
    assignedPanelists: vacancy?.assignedPanelists || [],
    request_type: vacancy?.request_type || "",
    city: vacancy?.city || "",
    projectClientName: vacancy?.projectClientName || "",
  })

  const [newSkill, setNewSkill] = useState("")
  const [panelistSearch, setPanelistSearch] = useState("")
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [hrUsers, setHrUsers] = useState<User[]>([])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllUsers()
        setAllUsers(users)
        setHrUsers(users.filter((user) => user.role === "hr"))
      } catch (error) {
        console.error("Failed to fetch users:", error)
        setAllUsers([])
        setHrUsers([])
      }
    }
    fetchUsers()
  }, [])

  useEffect(() => {
    if (!vacancy && currentUser?.role === "hr" && !formData.recruiter_name) {
      setFormData((prev) => ({ ...prev, recruiter_name: currentUser.name }))
    }
  }, [currentUser, vacancy, formData.recruiter_name])

  const filteredUsers = allUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(panelistSearch.toLowerCase()) ||
      (user.skill_set && user.skill_set.some((skill: string) => skill.toLowerCase().includes(panelistSearch.toLowerCase()))),
  )

  const selectedUsers = filteredUsers.filter((u) => formData.assignedPanelists.includes(u._id))
  const unselectedUsers = filteredUsers.filter((u) => !formData.assignedPanelists.includes(u._id))
  const sortedUsers = [...selectedUsers, ...unselectedUsers]

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills_required.includes(newSkill.trim())) {
      handleInputChange("skills_required", [...formData.skills_required, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    handleInputChange("skills_required", formData.skills_required.filter((skill: string) => skill !== skillToRemove))
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const submissionData = {
      ...formData,
      experience_range: `${formData.experienceFrom}-${formData.experienceTo}`,
      walkInDetails: formData.drive_date && formData.drive_location ? {
        date: formData.drive_date,
        location: formData.drive_location
      } : undefined,
      interview_type: "Walk-In" as const,
      id: vacancy?.id || `${Date.now()}`,
      postedOn: vacancy?.postedOn || new Date().toISOString().split('T')[0],
    }

    try {
      await onSubmit(submissionData)
    } catch (error) {
      console.error('Error submitting vacancy:', error)
    }
  }

  const departments = [
    "Engineering",
    "Product",
    "Design", 
    "Marketing",
    "Sales",
    "Data Science",
    "Security",
    "Operations",
    "HR",
    "Finance"
  ]

  const locations = [
    "San Francisco, CA",
    "New York, NY",
    "Austin, TX", 
    "Seattle, WA",
    "Chicago, IL",
    "Denver, CO",
    "Los Angeles, CA",
    "Remote",
    "Boston, MA",
    "Washington, DC"
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {vacancy ? "Edit Vacancy" : "Create New Vacancy"}
          </h1>
          <p className="text-gray-600 mt-2">
            Fill in the details below to {vacancy ? "update the" : "create a new"} job vacancy.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {vacancy ? "Update Vacancy" : "Create Vacancy"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form - Left 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="position_title">Position Title *</Label>
                  <Input
                    id="position_title"
                    value={formData.position_title}
                    onChange={(e) => handleInputChange("position_title", e.target.value)}
                    placeholder="e.g., Senior Frontend Developer"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="job_type">Job Type *</Label>
                  <Select value={formData.job_type} onValueChange={(value) => handleInputChange("job_type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="number_of_vacancies">Number of Positions *</Label>
                  <Input
                    id="number_of_vacancies"
                    type="number"
                    min="1"
                    value={formData.number_of_vacancies}
                    onChange={(e) => handleInputChange("number_of_vacancies", parseInt(e.target.value) || 1)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="priority">Priority *</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="P0">P0 - Critical</SelectItem>
                      <SelectItem value="P1">P1 - High</SelectItem>
                      <SelectItem value="P2">P2 - Medium</SelectItem>
                      <SelectItem value="P3">P3 - Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Experience and Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Experience & Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experienceFrom">Experience From (Years) *</Label>
                  <Input
                    id="experienceFrom"
                    type="number"
                    min="0"
                    value={formData.experienceFrom}
                    onChange={(e) => handleInputChange("experienceFrom", e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="experienceTo">Experience To (Years) *</Label>
                  <Input
                    id="experienceTo"
                    type="number"
                    min="0"
                    value={formData.experienceTo}
                    onChange={(e) => handleInputChange("experienceTo", e.target.value)}
                    placeholder="5"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="skills_required">Required Skills *</Label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill} variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills_required.map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="flex items-center space-x-1">
                      <span>{skill}</span>
                      <button type="button" onClick={() => removeSkill(skill)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="job_desc">Job Description *</Label>
                <Textarea
                  id="job_desc"
                  value={formData.job_desc}
                  onChange={(e) => handleInputChange("job_desc", e.target.value)}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  rows={8}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Walk-in Drive Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Walk-in Drive Details (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="drive_date">Drive Date</Label>
                  <Input
                    id="drive_date"
                    type="date"
                    value={formData.drive_date}
                    onChange={(e) => handleInputChange("drive_date", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="drive_location">Drive Location</Label>
                  <Input
                    id="drive_location"
                    value={formData.drive_location}
                    onChange={(e) => handleInputChange("drive_location", e.target.value)}
                    placeholder="e.g., Main Office, Conference Room A"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right column */}
        <div className="space-y-6">
          {/* Team Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Team Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hiring_manager_name">Hiring Manager *</Label>
                <Select value={formData.hiring_manager_name} onValueChange={(value) => handleInputChange("hiring_manager_name", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hiring manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {hrUsers.map((user) => (
                      <SelectItem key={user._id} value={user.name}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="recruiter_name">Recruiter Name *</Label>
                <Select value={formData.recruiter_name} onValueChange={(value) => handleInputChange("recruiter_name", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recruiter" />
                  </SelectTrigger>
                  <SelectContent>
                    {hrUsers.map((user) => (
                      <SelectItem key={user._id} value={user.name}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Panelist Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Assign Panelists</CardTitle>
            </CardHeader>
            <CardContent>
              <PanelistSelector
                selectedPanelists={formData.assignedPanelists}
                onUpdate={(panelists) => handleInputChange("assignedPanelists", panelists)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}