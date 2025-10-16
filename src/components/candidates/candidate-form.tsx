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

  // Parse existing experience to extract years and months
  const parseExperience = (expString: string) => {
    if (!expString) return { years: "0", months: "0" }
    const yearMatch = expString.match(/(\d+)\s*Year/)
    const monthMatch = expString.match(/(\d+)\s*Month/)
    return {
      years: yearMatch ? yearMatch[1] : "0",
      months: monthMatch ? monthMatch[1] : "0"
    }
  }

  const initialExp = parseExperience(candidate?.total_experience || "")
  const [experienceYears, setExperienceYears] = useState(initialExp.years)
  const [experienceMonths, setExperienceMonths] = useState(initialExp.months)

  const formatExperience = (years: string, months: string) => {
    return `${years} Year(s) ${months} Month(s)`
  }

  const [formData, setFormData] = useState({
    name: candidate?.name || "",
    email: candidate?.email || "",
    phone_number: candidate?.phone_number || "",
    location: candidate?.location || "",
    total_experience: formatExperience(initialExp.years, initialExp.months),
    notice_period: candidate?.notice_period || "",
    applied_position: candidate?.applied_position || "",
    interview_type: candidate?.interview_type || "Walk-In",
    source: candidate?.source || "",
    other_source: (candidate as any)?.other_source || "",
    current_ctc: candidate?.current_ctc || "",
    expected_ctc: candidate?.expected_ctc || "",
    negotiable_ctc: candidate?.negotiable_ctc || false,
    willing_to_relocate: candidate?.willing_to_relocate || false,
    skill_set: (candidate as any)?.skill_set || (candidate as any)?.skills || [],
    resume: null as File | null,
    recruiter_name: candidate?.recruiter_name || "",
  })

  const [newSkill, setNewSkill] = useState("")
  const [initialFormData] = useState(formData)
  const [vacancies, setVacancies] = useState<any[]>([])
  const [loadingVacancies, setLoadingVacancies] = useState(false)

  // Load vacancies from API
  useEffect(() => {
    const loadVacancies = async () => {
      setLoadingVacancies(true)
      try {
        const { fetchVacancies } = await import("../../lib/vacancy-api")
        const vacancyData = await fetchVacancies()
        // Filter only active vacancies
        const activeVacancies = vacancyData.filter(vacancy => vacancy.status === "active")
        setVacancies(activeVacancies)
      } catch (error) {
        console.error('Failed to load vacancies:', error)
        setVacancies([])
      } finally {
        setLoadingVacancies(false)
      }
    }

    loadVacancies()

    const handleVacancyUpdate = () => {
      loadVacancies()
    }

    window.addEventListener("vacancyUpdated", handleVacancyUpdate)

    return () => {
      window.removeEventListener("vacancyUpdated", handleVacancyUpdate)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate phone number
    const phoneRegex = /^\d{10}$/
    if (!phoneRegex.test(formData.phone_number)) {
      alert("Please enter a valid 10-digit phone number")
      return
    }
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.applied_position) {
      alert("Please fill in all required fields")
      return
    }
    
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
      skill_set: formData.skill_set.filter((s: string) => s !== skill),
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
          <Label htmlFor="phone_number">Phone Number *</Label>
          <Input
            id="phone_number"
            type="tel"
            value={formData.phone_number}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d{0,10}$/.test(value)) {
                setFormData({ ...formData, phone_number: value });
              }
            }}
            placeholder="Enter 10-digit phone number"
            maxLength={10}
            required
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">Enter exactly 10 digits</p>
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
          <Label>Total Experience *</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="experience_years" className="text-xs text-muted-foreground">Years</Label>
              <Select
                value={experienceYears}
                onValueChange={(value) => {
                  setExperienceYears(value)
                  setFormData({ ...formData, total_experience: formatExperience(value, experienceMonths) })
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience_months" className="text-xs text-muted-foreground">Months</Label>
              <Select
                value={experienceMonths}
                onValueChange={(value) => {
                  setExperienceMonths(value)
                  setFormData({ ...formData, total_experience: formatExperience(experienceYears, value) })
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Display: {formData.total_experience}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notice_period">Notice Period *</Label>
          <Input
            id="notice_period"
            placeholder="e.g., 2 weeks, Immediate"
            value={formData.notice_period}
            onChange={(e) => setFormData({ ...formData, notice_period: e.target.value })}
            required
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="applied_position">Applied Position *</Label>
          <Select
            value={formData.applied_position}
            onValueChange={(value) => {
              const selectedVacancy = vacancies.find((v: any) => v.position_title === value)
              setFormData({ 
                ...formData, 
                applied_position: value,
                recruiter_name: selectedVacancy?.recruiter_name || "Auto-assigned"
              })
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={loadingVacancies ? "Loading positions..." : "Select position"} />
            </SelectTrigger>
            <SelectContent>
              {loadingVacancies ? (
                <SelectItem value="loading" disabled>Loading vacancies...</SelectItem>
              ) : vacancies.length === 0 ? (
                <SelectItem value="no-vacancies" disabled>No active vacancies available</SelectItem>
              ) : (
                vacancies.map((vacancy: any) => (
                  <SelectItem key={vacancy.id} value={vacancy.position_title}>
                    {vacancy.position_title}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="recruiter">Recruiter Name</Label>
          <Input
            id="recruiter"
            value={formData.recruiter_name}
            readOnly
            className="w-full bg-muted"
            placeholder="Auto-filled based on position"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="source">Source *</Label>
          <Select 
            value={formData.source} 
            onValueChange={(value) => setFormData({ ...formData, source: value, other_source: value === 'other' ? formData.other_source : '' })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="naukri">Naukri</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="interview_type">Interview Type *</Label>
          <Select
            value={formData.interview_type}
            onValueChange={(value: any) => setFormData({ ...formData, interview_type: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select interview type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Walk-In">Walk-In</SelectItem>
              <SelectItem value="Virtual">Virtual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.source === 'other' && (
        <div className="space-y-2">
          <Label htmlFor="other_source">Other Source *</Label>
          <Input
            id="other_source"
            value={formData.other_source}
            onChange={(e) => setFormData({ ...formData, other_source: e.target.value })}
            placeholder="Please specify the source"
            required
            className="w-full"
          />
        </div>
      )}

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

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="current_ctc">Current CTC (₹) *</Label>
          <Input
            id="current_ctc"
            placeholder="e.g., 2"
            value={formData.current_ctc}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                setFormData({ ...formData, current_ctc: value });
              }
            }}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expected_ctc">Expected CTC (₹) *</Label>
          <Input
            id="expected_ctc"
            placeholder="e.g., 4"
            value={formData.expected_ctc}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                setFormData({ ...formData, expected_ctc: value });
              }
            }}
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
        <Label>Skills *</Label>
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
          {formData.skill_set.map((skill: string) => (
            <Badge key={skill} variant="secondary" className="flex items-center gap-1 pr-1">
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-1 hover:text-destructive transition-colors focus:outline-none"
                aria-label={`Remove ${skill}`}
              >
                <X className="h-3 w-3" />
              </button>
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
