import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { X, Upload, Search, UserPlus, UserMinus } from "lucide-react"
import type { Vacancy } from "@/lib/mock-data"
import { getAllUsers } from "@/lib/auth"

interface VacancyFormProps {
  vacancy?: Vacancy
  onSubmit: (data: Partial<Vacancy>) => void
}

export function VacancyForm({ vacancy, onSubmit }: VacancyFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  // No stored user available since we removed localStorage
  const currentUser = null

  const [formData, setFormData] = useState({
    position_title: vacancy?.position_title || "",
    request_type: vacancy?.request_type || "new",
    job_type: vacancy?.job_type || "full_time",
    priority: vacancy?.priority || "P2",
    projectClientName: vacancy?.projectClientName || "",
    city: vacancy?.city || "Perungudi, Chennai", // default city value
    status: vacancy?.status || "active",
    hiring_manager_name: vacancy?.hiring_manager_name || "",
    recruiter_name: vacancy?.recruiter_name || "",
    number_of_vacancies: vacancy?.number_of_vacancies || 1,
    experienceFrom: vacancy?.experienceRange?.split("-")[0]?.trim() || "",
    experienceTo: vacancy?.experienceRange?.split("-")[1]?.trim() || "",
    skills_required: ((vacancy as any)?.skills || []) as string[],
    jobDescription: vacancy?.jobDescription || "",
    about_position: vacancy?.about_position || "",
    driveDate: vacancy?.walkInDetails?.date || "",
    driveLocation: vacancy?.walkInDetails?.location || "",
    assignedPanelists: vacancy?.assignedPanelists || [],
  })

  const [newSkill, setNewSkill] = useState("")
  const [panelistSearch, setPanelistSearch] = useState("")
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [hrUsers, setHrUsers] = useState<any[]>([])

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
    // No user data available since localStorage was removed
    // This effect is now a no-op
  }, [])

  const filteredUsers = allUsers.filter(
    (user) =>
      (user.name?.toLowerCase().includes(panelistSearch.toLowerCase()) || false) ||
      (Array.isArray(user.skill_set) && user.skill_set.some((skill: string) => skill?.toLowerCase().includes(panelistSearch.toLowerCase()))),
  )

  const selectedUsers = filteredUsers.filter((u) => formData.assignedPanelists.includes(u._id))
  const unselectedUsers = filteredUsers.filter((u) => !formData.assignedPanelists.includes(u._id))
  const sortedUsers = [...selectedUsers, ...unselectedUsers]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const submitData: Partial<Vacancy> = {
      ...formData,
      experienceRange: `${formData.experienceFrom}-${formData.experienceTo} years`,
      interview_type: "Walk-In", // Only Walk-In interviews for this version
      walkInDetails: {
        date: formData.driveDate,
        location: formData.driveLocation,
      },
    }

    onSubmit(submitData)
  }

  const handleCancel = () => {
    // Reset form data to initial state
    setFormData({
      position_title: vacancy?.position_title || "",
      request_type: vacancy?.request_type || "new",
      job_type: vacancy?.job_type || "full_time",
      priority: vacancy?.priority || "P2",
      projectClientName: vacancy?.projectClientName || "",
      city: vacancy?.city || "Perungudi, Chennai",
      status: vacancy?.status || "active",
      hiring_manager_name: vacancy?.hiring_manager_name || "",
      recruiter_name: vacancy?.recruiter_name || "",
      number_of_vacancies: vacancy?.number_of_vacancies || 1,
      experienceFrom: vacancy?.experienceRange?.split("-")[0]?.trim() || "",
      experienceTo: vacancy?.experienceRange?.split("-")[1]?.trim() || "",
      skills_required: vacancy?.skills_required || [],
      jobDescription: vacancy?.jobDescription || "",
      about_position: vacancy?.about_position || "",
      driveDate: vacancy?.walkInDetails?.date || "",
      driveLocation: vacancy?.walkInDetails?.location || "",
      assignedPanelists: vacancy?.assignedPanelists || [],
    })
    setCurrentStep(1)
    setNewSkill("")
    setPanelistSearch("")

    // Close the dialog by triggering parent component
    if (typeof window !== "undefined") {
      const event = new CustomEvent("closeVacancyDialog")
      window.dispatchEvent(event)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills_required.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills_required: [...formData.skills_required, newSkill.trim()],
      })
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills_required: formData.skills_required.filter((s: string) => s !== skill),
    })
  }

  const handlePanelistChange = (panelistId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        assignedPanelists: [...formData.assignedPanelists, panelistId],
      })
    } else {
      setFormData({
        ...formData,
        assignedPanelists: formData.assignedPanelists.filter((id) => id !== panelistId),
      })
    }
  }

  const canProceedToStep2 = () => {
    return (
      formData.position_title &&
      formData.request_type &&
      formData.job_type &&
      formData.priority &&
      formData.city &&
      formData.hiring_manager_name &&
      formData.recruiter_name &&
      formData.number_of_vacancies &&
      formData.experienceFrom &&
      formData.experienceTo &&
      formData.driveDate &&
      formData.driveLocation &&
      formData.jobDescription.trim() &&
      formData.about_position.trim() // Make about position required
    )
  }

  const canSubmit = () => {
    return canProceedToStep2() && formData.assignedPanelists.length >= 1 // Minimum 1 panelist required
  }

  const progress = currentStep === 1 ? 50 : 100

  return (
    <div className="space-y-6">
      {!vacancy && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Step {currentStep} of 2</span>
            <span>{progress}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span className={currentStep === 1 ? "font-medium text-blue-600" : ""}>Vacancy Details</span>
            <span className={currentStep === 2 ? "font-medium text-blue-600" : ""}>Select Panelists</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {(currentStep === 1 || vacancy) && (
          <Card>
            <CardHeader>
              <CardTitle>Vacancy Details</CardTitle>
              <CardDescription>Fill in the basic information about the position</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position_title">Position Title *</Label>
                  <Input
                    id="position_title"
                    value={formData.position_title}
                    onChange={(e) => setFormData({ ...formData, position_title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="request_type">Request Type *</Label>
                  <Select
                    value={formData.request_type}
                    onValueChange={(value: any) => setFormData({ ...formData, request_type: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="replacement">Replacement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_type">Job Type *</Label>
                  <Select
                    value={formData.job_type}
                    onValueChange={(value: any) => setFormData({ ...formData, job_type: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full-Time</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="contract_to_hire">Contract to Hire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority *</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="P0">P0</SelectItem>
                      <SelectItem value="P1">P1</SelectItem>
                      <SelectItem value="P2">P2</SelectItem>
                      <SelectItem value="P3">P3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hiring_manager_name">Hiring Manager *</Label>
                  <Input
                    id="hiring_manager_name"
                    value={formData.hiring_manager_name}
                    onChange={(e) => setFormData({ ...formData, hiring_manager_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recruiter_name">Recruiter Name *</Label>
                  <Select
                    value={formData.recruiter_name}
                    onValueChange={(value: any) => setFormData({ ...formData, recruiter_name: value })}
                  >
                    <SelectTrigger className="w-full">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number_of_vacancies">Number of Vacancies *</Label>
                  <Input
                    id="number_of_vacancies"
                    type="number"
                    min="1"
                    value={formData.number_of_vacancies}
                    onChange={(e) =>
                      setFormData({ ...formData, number_of_vacancies: Number.parseInt(e.target.value) || 1 })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectClientName">Project/Client Name</Label>
                  <Input
                    id="projectClientName"
                    value={formData.projectClientName}
                    onChange={(e) => setFormData({ ...formData, projectClientName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experienceFrom">Experience From (years) *</Label>
                  <Input
                    id="experienceFrom"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.experienceFrom}
                    onChange={(e) => setFormData({ ...formData, experienceFrom: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experienceTo">Experience To (years) *</Label>
                  <Input
                    id="experienceTo"
                    type="number"
                    min="0"
                    placeholder="5"
                    value={formData.experienceTo}
                    onChange={(e) => setFormData({ ...formData, experienceTo: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Skills Required</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills_required.map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobDescription">Job Description *</Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Enter job description, responsibilities, and requirements..."
                  value={formData.jobDescription || ""}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="about_position">About Position *</Label>
                <Textarea
                  id="about_position"
                  placeholder="Describe the position, responsibilities, and requirements..."
                  value={formData.about_position}
                  onChange={(e) => setFormData({ ...formData, about_position: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="driveDate">Drive Date *</Label>
                    <Input
                      id="driveDate"
                      type="date"
                      value={formData.driveDate}
                      onChange={(e) => setFormData({ ...formData, driveDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driveLocation">Drive Location *</Label>
                    <Input
                      id="driveLocation"
                      placeholder="Enter interview location"
                      value={formData.driveLocation}
                      onChange={(e) => setFormData({ ...formData, driveLocation: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {(currentStep === 2 || vacancy) && (
          <Card>
            <CardHeader>
              <CardTitle>Select Panelists</CardTitle>
              <CardDescription>
                Choose panelists and managers for this vacancy from all users. Selected:{" "}
                {formData.assignedPanelists.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="panelistSearch">Search Users</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="panelistSearch"
                    placeholder="Search by name or skill..."
                    value={panelistSearch}
                    onChange={(e) => setPanelistSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {selectedUsers.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-green-700">Selected Users ({selectedUsers.length})</Label>
                  <div className="space-y-2 p-3 bg-green-50 rounded-lg max-h-40 overflow-y-auto">
                    {selectedUsers.map((user) => (
                      <div key={user._id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-700 font-medium text-sm">
                              {user.name
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("") || "?"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-green-900">{user.name || "Unknown"}</p>
                            <p className="text-sm text-green-600">
                              {user.role} • {user.email || "No email"}
                            </p>
                            {user.skill_set && <p className="text-sm text-green-600">Skills: {user.skill_set.join(", ")}</p>}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handlePanelistChange(user._id, false)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Available Users</Label>
                <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-3">
                  {unselectedUsers.slice(0, Math.max(20, unselectedUsers.length)).map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-gray-700 font-medium text-sm">
                            {user.name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("") || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name || "Unknown"}</p>
                          <p className="text-sm text-gray-500">
                            {user.role} • {user.email || "No email"}
                          </p>
                          {user.skill_set && <p className="text-sm text-gray-500">Skills: {user.skill_set.join(", ")}</p>}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handlePanelistChange(user._id, true)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {unselectedUsers.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      {panelistSearch ? "No users found matching your search" : "All users have been selected"}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <div>
            {currentStep === 2 && !vacancy && (
              <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                Previous
              </Button>
            )}
          </div>
          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            {vacancy ? (
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Save Changes
              </Button>
            ) : currentStep === 1 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(2)}
                disabled={!canProceedToStep2()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next: Select Panelists
              </Button>
            ) : (
              <Button type="submit" disabled={!canSubmit()} className="bg-blue-600 hover:bg-blue-700">
                Create Vacancy
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
