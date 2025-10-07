 

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X, FileText } from "lucide-react"
import type { Candidate } from "@/lib/schema-data"
import { getStoredUser } from "@/lib/auth"

interface CandidateFormProps {
  candidate?: Candidate
  onSubmit: (data: Partial<Candidate>) => void
  onCancel?: () => void
  onFormChange?: (hasChanges: boolean) => void
  submitButtonText?: string // Added optional submit button text prop
}

export function CandidateForm({ candidate, onSubmit, onCancel, onFormChange, submitButtonText }: CandidateFormProps) {
  const currentUser = getStoredUser()

  const [formData, setFormData] = useState({
    name: candidate?.name || "",
    email: candidate?.email || "",
    phone_number: candidate?.phone_number || "",
    location: candidate?.location || "",
    total_experience: candidate?.total_experience || "",
    notice_period: candidate?.notice_period || "",
    applied_position: candidate?.applied_position || "",
    interview_type: candidate?.interview_type || "Walk-In",
    job_type: candidate?.job_type || "full_time",
    source: candidate?.source || "",
    current_ctc: candidate?.current_ctc || "",
    expected_ctc: candidate?.expected_ctc || "",
    negotiable_ctc: candidate?.negotiable_ctc || false,
    willing_to_relocate: candidate?.willing_to_relocate || false,
    skill_set: candidate?.skill_set || [],
    resume: null as File | null,
    recruiter_name: candidate?.recruiter_name || currentUser?.name || "",
    other_source: candidate?.other_source || "",
  })

  const [newSkill, setNewSkill] = useState("")
  const [initialFormData] = useState(formData)
  const [vacancies, setVacancies] = useState([])


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skill_set.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skill_set: [...formData.skill_set, newSkill.trim()],
      })
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skill_set: formData.skill_set.filter((s) => s !== skill),
    })
  }

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]
      if (validTypes.includes(file.type)) {
        setFormData({ ...formData, resume: file })
      } else {
        alert("Please upload a PDF or Word document")
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-3">
      <div className="grid grid-cols-2 gap-0">
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

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="phone_number">Phone *</Label>
          <Input
            id="phone_number"
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
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

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="total_experience">Experience *</Label>
          <Input
            id="total_experience"
            placeholder="e.g., 3 years"
            value={formData.total_experience}
            onChange={(e) => setFormData({ ...formData, total_experience: e.target.value })}
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notice_period">Notice Period *</Label>
          <Input
            id="notice_period"
            placeholder="e.g., 2 weeks"
            value={formData.notice_period}
            onChange={(e) => setFormData({ ...formData, notice_period: e.target.value })}
            required
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="applied_position">Applied Position *</Label>
          <Select
            value={formData.applied_position}
            onValueChange={(value) => setFormData({ ...formData, applied_position: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent>
              {vacancies.map((vacancy: any) => (
                <SelectItem key={vacancy.id} value={vacancy.position_title}>
                  {vacancy.position_title} (#{vacancy.id}) - {vacancy.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="recruiter">Recruiter *</Label>
          <Select value={formData.recruiter_name} onValueChange={(value) => setFormData({ ...formData, recruiter_name: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select recruiter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={currentUser?.name || ""}>{currentUser?.name || "Current User"}</SelectItem>
              {/* Add other recruiters if needed */}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-2">
          <Label htmlFor="interview_type">Interview Type *</Label>
          <Select
            value={formData.interview_type}
            onValueChange={(value: any) => setFormData({ ...formData, interview_type: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Walk-In">Walk-in</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="job_type">Job Type *</Label>
          <Select value={formData.job_type} onValueChange={(value: any) => setFormData({ ...formData, job_type: value })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full_time">Full Time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="contract_to_hire">Contract to Hire</SelectItem>
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
              <SelectItem value="Naukri">Naukri</SelectItem>
              <SelectItem value="Company Website">Company Website</SelectItem>
              <SelectItem value="Referral">Referral</SelectItem>
              <SelectItem value="Job Board">Job Board</SelectItem>
              <SelectItem value="others">Others</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="resume">Upload Resume</Label>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 w-full"
            />
          </div>
          {formData.resume && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <FileText className="h-4 w-4" />
              <span>{formData.resume.name}</span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500">Supported formats: PDF, DOC, DOCX (Max 5MB)</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="current_ctc">Current CTC</Label>
          <Input
            id="current_ctc"
            placeholder="e.g., $80,000"
            value={formData.current_ctc}
            onChange={(e) => setFormData({ ...formData, current_ctc: e.target.value })}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expected_ctc">Expected CTC</Label>
          <Input
            id="expected_ctc"
            placeholder="e.g., $95,000"
            value={formData.expected_ctc}
            onChange={(e) => setFormData({ ...formData, expected_ctc: e.target.value })}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex space-x-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="negotiable_ctc"
            checked={formData.negotiable_ctc}
            onCheckedChange={(checked) => setFormData({ ...formData, negotiable_ctc: checked as boolean })}
          />
          <Label htmlFor="negotiable_ctc">Negotiable</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="willing_to_relocate"
            checked={formData.willing_to_relocate}
            onCheckedChange={(checked) => setFormData({ ...formData, willing_to_relocate: checked as boolean })}
          />
          <Label htmlFor="willing_to_relocate">Open to Relocation</Label>
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
          {formData.skill_set.map((skill) => (
            <Badge key={skill} variant="secondary" className="flex items-center gap-1">
              {skill}
              <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex space-x-3 mt-0">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {submitButtonText || (candidate ? "Save Changes" : "Add Candidate")}
        </Button>
      </div>
    </form>
  )
}
