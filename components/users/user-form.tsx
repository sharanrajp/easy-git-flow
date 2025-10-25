 

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { User } from "@/lib/auth"

interface UserFormProps {
  user?: User
  onSubmit: (data: Partial<User>) => void
  onCancel?: () => void
}

interface FormData {
  name: string
  email: string
  role: User["role"]
  skill_set: string[]
  available_rounds: string[]
  current_status?: User["current_status"]
}

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || ("panel_member" as const),
    skill_set: user?.skill_set || [],
    available_rounds: user?.available_rounds || [],
    current_status: user?.current_status || ("free" as const),
  })

  const [newSkill, setNewSkill] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const submitData: Partial<User> = {
      ...formData,
      skill_set: (formData.role === "panel_member" || formData.role === "tpm_tem") ? formData.skill_set : undefined,
      available_rounds: formData.role === "tpm_tem" ? ["r3"] : 
                        formData.role === "panel_member" ? formData.available_rounds : undefined,
      current_status: (formData.role === "panel_member" || formData.role === "tpm_tem") ? formData.current_status : undefined,
    }

    onSubmit(submitData)
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

  const handleRoundChange = (round: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        available_rounds: [...formData.available_rounds, round],
      })
    } else {
      setFormData({
        ...formData,
        available_rounds: formData.available_rounds.filter((r) => r !== round),
      })
    }
  }

  const handleRoleChange = (role: User["role"]) => {
    setFormData({
      ...formData,
      role,
      skill_set: (role === "panel_member" || role === "tpm_tem") ? formData.skill_set : [],
      available_rounds: role === "tpm_tem" ? ["r3"] : 
                        role === "panel_member" ? formData.available_rounds : [],
      current_status: (role === "panel_member" || role === "tpm_tem") ? "free" : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
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
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role *</Label>
        <Select value={formData.role} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="hr">HR</SelectItem>
            <SelectItem value="recruiter">Recruiter</SelectItem>
            <SelectItem value="tpm_tem">TPM/TEM</SelectItem>
            <SelectItem value="panel_member">Panel Member</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(formData.role === "panel_member" || formData.role === "tpm_tem") && (
        <>
          {formData.role === "panel_member" && (
            <div className="space-y-2">
              <Label>Interview Rounds Handled</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="r1"
                    checked={formData.available_rounds.includes("r1")}
                    onCheckedChange={(checked) => handleRoundChange("r1", checked as boolean)}
                  />
                  <Label htmlFor="r1">Round 1 (Technical)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="r2"
                    checked={formData.available_rounds.includes("r2")}
                    onCheckedChange={(checked) => handleRoundChange("r2", checked as boolean)}
                  />
                  <Label htmlFor="r2">Round 2 (Technical + Behavioral)</Label>
                </div>
              </div>
            </div>
          )}

          {formData.role === "tpm_tem" && (
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>TPM/TEM:</strong> Oversees technical pipeline and handles R3 (final) interviews.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Skills/Domain</Label>
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
              {formData.skill_set.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {formData.role === "admin" && (
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Admin:</strong> Full system access.
          </p>
        </div>
      )}

      {formData.role === "hr" && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>HR:</strong> Manages job openings, candidates, offers, and onboarding.
          </p>
        </div>
      )}

      {formData.role === "recruiter" && (
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Recruiter:</strong> Sources and screens candidates.
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {user ? "Update User" : "Add User"}
        </Button>
      </div>
    </form>
  )
}
