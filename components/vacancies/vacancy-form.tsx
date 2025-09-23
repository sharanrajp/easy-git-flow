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
import type { Vacancy } from "@/lib/mock-data"
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
    title: vacancy?.title || "",
    department: vacancy?.department || "",
    location: vacancy?.location || "",
    jobType: vacancy?.jobType || "full-time",
    priority: vacancy?.priority || "P3",
    status: vacancy?.status || "active",
    hiringManager: vacancy?.hiringManager || "",
    recruiterName: vacancy?.recruiterName || currentUser?.name || "",
    numberOfVacancies: vacancy?.numberOfVacancies || 1,
    experienceFrom: vacancy?.experienceRange?.split("-")[0]?.trim() || "",
    experienceTo: vacancy?.experienceRange?.split("-")[1]?.trim() || "",
    skills: vacancy?.skills || [],
    jobDescriptionFile: null as File | null,
    existingJobDescription: vacancy?.jobDescription || "",
    aboutPosition: vacancy?.aboutPosition || "",
    driveDate: vacancy?.walkInDetails?.date || "",
    driveLocation: vacancy?.walkInDetails?.location || "",
    assignedPanelists: vacancy?.assignedPanelists || [],
    deadline: vacancy?.deadline || "",
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
    if (!vacancy && currentUser?.role === "hr" && !formData.recruiterName) {
      setFormData((prev) => ({ ...prev, recruiterName: currentUser.name }))
    }
  }, [currentUser, vacancy, formData.recruiterName])

  const filteredUsers = allUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(panelistSearch.toLowerCase()) ||
      (user.skills && user.skills.some((skill: string) => skill.toLowerCase().includes(panelistSearch.toLowerCase()))),
  )

  const selectedUsers = filteredUsers.filter((u) => formData.assignedPanelists.includes(u.id))
  const unselectedUsers = filteredUsers.filter((u) => !formData.assignedPanelists.includes(u.id))
  const sortedUsers = [...selectedUsers, ...unselectedUsers]

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      handleInputChange("skills", [...formData.skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    handleInputChange("skills", formData.skills.filter((skill: string) => skill !== skillToRemove))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleInputChange("jobDescriptionFile", file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submissionData = {
      ...formData,
      experienceRange: `${formData.experienceFrom}-${formData.experienceTo}`,
      walkInDetails: formData.driveDate && formData.driveLocation ? {
        date: formData.driveDate,
        location: formData.driveLocation
      } : undefined,
      interviewTypes: ["walk-in"] as const,
      id: vacancy?.id || `${Date.now()}`,
      postedOn: vacancy?.postedOn || new Date().toISOString().split('T')[0],
      applications: vacancy?.applications || 0,
      shortlisted: vacancy?.shortlisted || 0,
      interviewed: vacancy?.interviewed || 0,
      selected: vacancy?.selected || 0,
    }

    onSubmit(submissionData)
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
                  <Label htmlFor="title">Position Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., Senior Frontend Developer"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="jobType">Job Type *</Label>
                  <Select value={formData.jobType} onValueChange={(value) => handleInputChange("jobType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="numberOfVacancies">Number of Positions *</Label>
                  <Input
                    id="numberOfVacancies"
                    type="number"
                    min="1"
                    value={formData.numberOfVacancies}
                    onChange={(e) => handleInputChange("numberOfVacancies", parseInt(e.target.value) || 1)}
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

                <div>
                  <Label htmlFor="deadline">Application Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange("deadline", e.target.value)}
                    required
                  />
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
                <Label htmlFor="skills">Required Skills *</Label>
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
                  {formData.skills.map((skill: string) => (
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
                <Label htmlFor="jobDescription">Job Description</Label>
                <Textarea
                  id="jobDescription"
                  value={formData.existingJobDescription}
                  onChange={(e) => handleInputChange("existingJobDescription", e.target.value)}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="aboutPosition">About Position (Optional)</Label>
                <Textarea
                  id="aboutPosition"
                  value={formData.aboutPosition}
                  onChange={(e) => handleInputChange("aboutPosition", e.target.value)}
                  placeholder="Additional details about the position..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="jobDescriptionFile">Upload Job Description File (Optional)</Label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="jobDescriptionFile" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Upload a file</span>
                        <input
                          id="jobDescriptionFile"
                          type="file"
                          className="sr-only"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOC up to 10MB</p>
                  </div>
                </div>
                {formData.jobDescriptionFile && (
                  <p className="mt-2 text-sm text-gray-500">
                    Selected: {formData.jobDescriptionFile.name}
                  </p>
                )}
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
                  <Label htmlFor="driveDate">Drive Date</Label>
                  <Input
                    id="driveDate"
                    type="date"
                    value={formData.driveDate}
                    onChange={(e) => handleInputChange("driveDate", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="driveLocation">Drive Location</Label>
                  <Input
                    id="driveLocation"
                    value={formData.driveLocation}
                    onChange={(e) => handleInputChange("driveLocation", e.target.value)}
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
                <Label htmlFor="hiringManager">Hiring Manager *</Label>
                <Select value={formData.hiringManager} onValueChange={(value) => handleInputChange("hiringManager", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hiring manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {hrUsers.map((user) => (
                      <SelectItem key={user.id} value={user.name}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="recruiterName">Recruiter Name *</Label>
                <Select value={formData.recruiterName} onValueChange={(value) => handleInputChange("recruiterName", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recruiter" />
                  </SelectTrigger>
                  <SelectContent>
                    {hrUsers.map((user) => (
                      <SelectItem key={user.id} value={user.name}>
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