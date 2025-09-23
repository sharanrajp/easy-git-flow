import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import type { Candidate } from "@/lib/mock-data"
import { getMockVacancies } from "@/lib/mock-data"

interface CandidateFormProps {
  candidate?: Candidate
  onSubmit: (data: Partial<Candidate>) => void
  onCancel?: () => void
  onFormChange?: (hasChanges: boolean) => void
  submitButtonText?: string // Added optional submit button text prop
}

export function CandidateForm({ candidate, onSubmit, onCancel, onFormChange, submitButtonText }: CandidateFormProps) {
  // No stored user available since we removed localStorage
  const currentUser = null

  const [formData, setFormData] = useState({
    name: candidate?.name || "",
    email: candidate?.email || "",
    phone: candidate?.phone || "",
    location: candidate?.location || "",
    experience: candidate?.experience || "",
    noticePeriod: candidate?.noticePeriod || "",
    appliedPosition: candidate?.appliedPosition || "",
    interviewType: candidate?.interviewType || "walk-in",
    jobType: candidate?.jobType || "full-time",
    source: candidate?.source || "",
    currentCTC: candidate?.currentCTC || "",
    expectedCTC: candidate?.expectedCTC || "",
    negotiable: candidate?.negotiable || false,
    relocation: candidate?.relocation || false,
    skills: candidate?.skills || [],
    jobDescription: candidate?.jobDescription || "",
    recruiter: candidate?.recruiter || "",
  })

  const [newSkill, setNewSkill] = useState("")
  const [initialFormData] = useState(formData)
  const [vacancies, setVacancies] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vacancies")
      return stored ? JSON.parse(stored) : getMockVacancies()
    }
    return getMockVacancies()
  })

  useEffect(() => {
    const updateVacancies = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("vacancies")
        setVacancies(stored ? JSON.parse(stored) : getMockVacancies())
      }
    }

    window.addEventListener("storage", updateVacancies)
    window.addEventListener("vacancyUpdated", updateVacancies)

    return () => {
      window.removeEventListener("storage", updateVacancies)
      window.removeEventListener("vacancyUpdated", updateVacancies)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
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

  // Removed resume upload handler since we're using textarea for job description

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="experience">Experience *</Label>
          <Input
            id="experience"
            placeholder="e.g., 3 years"
            value={formData.experience}
            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="noticePeriod">Notice Period *</Label>
          <Input
            id="noticePeriod"
            placeholder="e.g., 2 weeks"
            value={formData.noticePeriod}
            onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
            required
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="appliedPosition">Applied Position *</Label>
          <Select
            value={formData.appliedPosition}
            onValueChange={(value) => setFormData({ ...formData, appliedPosition: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent>
              {vacancies.map((vacancy: any) => (
                <SelectItem key={vacancy.id} value={vacancy.title}>
                  {vacancy.title} (#{vacancy.id}) - {vacancy.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="recruiter">Recruiter *</Label>
          <Select value={formData.recruiter} onValueChange={(value) => setFormData({ ...formData, recruiter: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select recruiter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Current User">Current User</SelectItem>
              {/* Add other recruiters if needed */}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="interviewType">Interview Type *</Label>
          <Select
            value={formData.interviewType}
            onValueChange={(value: any) => setFormData({ ...formData, interviewType: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="walk-in">Walk-in</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="jobType">Job Type *</Label>
          <Select value={formData.jobType} onValueChange={(value: any) => setFormData({ ...formData, jobType: value })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-time">Full Time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="contract-to-hire">Contract to Hire</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="source">Source *</Label>
          <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LinkedIn">LinkedIn</SelectItem>
              <SelectItem value="Company Website">Company Website</SelectItem>
              <SelectItem value="Referral">Referral</SelectItem>
              <SelectItem value="Job Board">Job Board</SelectItem>
              <SelectItem value="Recruiter">Recruiter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="jobDescription">Job Description</Label>
        <Textarea
          id="jobDescription"
          placeholder="Enter job description or requirements..."
          value={formData.jobDescription}
          onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
          className="w-full min-h-24 resize-y"
          rows={4}
        />
        <p className="text-xs text-gray-500">Describe the job requirements and responsibilities</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="currentCTC">Current CTC</Label>
          <Input
            id="currentCTC"
            placeholder="e.g., $80,000"
            value={formData.currentCTC}
            onChange={(e) => setFormData({ ...formData, currentCTC: e.target.value })}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expectedCTC">Expected CTC</Label>
          <Input
            id="expectedCTC"
            placeholder="e.g., $95,000"
            value={formData.expectedCTC}
            onChange={(e) => setFormData({ ...formData, expectedCTC: e.target.value })}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex space-x-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="negotiable"
            checked={formData.negotiable}
            onCheckedChange={(checked) => setFormData({ ...formData, negotiable: checked as boolean })}
          />
          <Label htmlFor="negotiable">Negotiable</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="relocation"
            checked={formData.relocation}
            onCheckedChange={(checked) => setFormData({ ...formData, relocation: checked as boolean })}
          />
          <Label htmlFor="relocation">Open to Relocation</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Skills/Stack</Label>
        <div className="flex space-x-2">
          <Input
            placeholder="Add a skill"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            className="flex-1"
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

      <div className="flex justify-end space-x-3 pt-4 border-t border-border">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="hover:bg-muted smooth-transition px-6"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="gradient-primary text-white hover:scale-105 smooth-transition shadow-elegant px-6"
        >
          {submitButtonText || (candidate ? "Save Changes" : "Add Candidate")}
        </Button>
      </div>
    </form>
  )
}
