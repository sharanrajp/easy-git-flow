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
    title: vacancy?.title || "",
    requestType: vacancy?.requestType || "new",
    jobType: vacancy?.jobType || "full-time",
    priority: vacancy?.priority || "P2",
    projectClientName: vacancy?.projectClientName || "",
    city: vacancy?.city || "Perungudi, Chennai", // default city value
    status: vacancy?.status || "active",
    hiringManager: vacancy?.hiringManager || "",
    recruiterName: vacancy?.recruiterName || "",
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
  })

  const [newSkill, setNewSkill] = useState("")
  const [panelistSearch, setPanelistSearch] = useState("")
  const allUsers = getAllUsers()
  const hrUsers = allUsers.filter((user) => user.role === "hr")

  useEffect(() => {
    // No user data available since localStorage was removed
    // This effect is now a no-op
  }, [])

  const filteredUsers = allUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(panelistSearch.toLowerCase()) ||
      (user.skills && user.skills.some((skill) => skill.toLowerCase().includes(panelistSearch.toLowerCase()))),
  )

  const selectedUsers = filteredUsers.filter((u) => formData.assignedPanelists.includes(u.id))
  const unselectedUsers = filteredUsers.filter((u) => !formData.assignedPanelists.includes(u.id))
  const sortedUsers = [...selectedUsers, ...unselectedUsers]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const submitData: Partial<Vacancy> = {
      ...formData,
      experienceRange: `${formData.experienceFrom}-${formData.experienceTo} years`,
      interviewTypes: ["walk-in"], // Only walk-in interviews for this version
      walkInDetails: {
        date: formData.driveDate,
        location: formData.driveLocation,
      },
      jobDescription: formData.jobDescriptionFile
        ? `File uploaded: ${formData.jobDescriptionFile.name}`
        : formData.existingJobDescription,
    }

    onSubmit(submitData)
  }

  const handleCancel = () => {
    // Reset form data to initial state
    setFormData({
      title: vacancy?.title || "",
      requestType: vacancy?.requestType || "new",
      jobType: vacancy?.jobType || "full-time",
      priority: vacancy?.priority || "P2",
      projectClientName: vacancy?.projectClientName || "",
      city: vacancy?.city || "Perungudi, Chennai",
      status: vacancy?.status || "active",
      hiringManager: vacancy?.hiringManager || "",
      recruiterName: vacancy?.recruiterName || "",
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
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      })
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, jobDescriptionFile: file })
    }
  }

  const canProceedToStep2 = () => {
    return (
      formData.title &&
      formData.requestType &&
      formData.jobType &&
      formData.priority &&
      formData.city &&
      formData.hiringManager &&
      formData.recruiterName &&
      formData.numberOfVacancies &&
      formData.experienceFrom &&
      formData.experienceTo &&
      formData.driveDate &&
      formData.driveLocation &&
      (formData.jobDescriptionFile || formData.existingJobDescription) &&
      formData.aboutPosition.trim() // Make about position required
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
                  <Label htmlFor="title">Position Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requestType">Request Type *</Label>
                  <Select
                    value={formData.requestType}
                    onValueChange={(value: any) => setFormData({ ...formData, requestType: value })}
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
                  <Label htmlFor="jobType">Job Type *</Label>
                  <Select
                    value={formData.jobType}
                    onValueChange={(value: any) => setFormData({ ...formData, jobType: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-Time</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="contract-to-hire">Contract to Hire</SelectItem>
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
                  <Label htmlFor="hiringManager">Hiring Manager *</Label>
                  <Input
                    id="hiringManager"
                    value={formData.hiringManager}
                    onChange={(e) => setFormData({ ...formData, hiringManager: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recruiterName">Recruiter Name *</Label>
                  <Select
                    value={formData.recruiterName}
                    onValueChange={(value: any) => setFormData({ ...formData, recruiterName: value })}
                  >
                    <SelectTrigger className="w-full">
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
                  <Label htmlFor="numberOfVacancies">Number of Vacancies *</Label>
                  <Input
                    id="numberOfVacancies"
                    type="number"
                    min="1"
                    value={formData.numberOfVacancies}
                    onChange={(e) =>
                      setFormData({ ...formData, numberOfVacancies: Number.parseInt(e.target.value) || 1 })
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
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobDescription">Job Description *</Label>
                {formData.existingJobDescription && formData.existingJobDescription.startsWith("File uploaded:") ? (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Upload className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formData.existingJobDescription.replace("File uploaded: ", "")}
                          </p>
                          <p className="text-xs text-gray-500">Job description file</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById("jobDescription")?.click()}
                      >
                        Reupload
                      </Button>
                    </div>
                    <input
                      type="file"
                      id="jobDescription"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Upload job description file *</p>
                      <input
                        type="file"
                        id="jobDescription"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                        required={!formData.existingJobDescription}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("jobDescription")?.click()}
                      >
                        Choose File
                      </Button>
                      {formData.jobDescriptionFile && (
                        <p className="text-sm text-green-600 mt-2">Selected: {formData.jobDescriptionFile.name}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="aboutPosition">About Position *</Label>
                <Textarea
                  id="aboutPosition"
                  placeholder="Describe the position, responsibilities, and requirements..."
                  value={formData.aboutPosition}
                  onChange={(e) => setFormData({ ...formData, aboutPosition: e.target.value })}
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

        {(currentStep === 2 || vacancy) && !vacancy && (
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
                    placeholder="Search by name or skills..."
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
                      <div key={user.id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-700 font-medium text-sm">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-green-900">{user.name}</p>
                            <p className="text-sm text-green-600">
                              {user.role} • {user.email}
                            </p>
                            {user.skills && <p className="text-sm text-green-600">Skills: {user.skills.join(", ")}</p>}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handlePanelistChange(user.id, false)}
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
                    <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-gray-700 font-medium text-sm">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">
                            {user.role} • {user.email}
                          </p>
                          {user.skills && <p className="text-sm text-gray-500">Skills: {user.skills.join(", ")}</p>}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handlePanelistChange(user.id, true)}
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
