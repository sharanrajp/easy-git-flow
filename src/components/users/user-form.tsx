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
  panelistType?: User["panelistType"]
  skills: string[]
  interviewRounds: string[]
  status?: User["status"]
}

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || ("panelist" as const),
    panelistType: user?.panelistType || ("panel-member" as const),
    skills: user?.skills || [],
    interviewRounds: user?.interviewRounds || [],
    status: user?.status || ("available" as const),
  })

  const [newSkill, setNewSkill] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const submitData: Partial<User> = {
      ...formData,
      panelistType: formData.role === "panelist" ? formData.panelistType : undefined,
      // Only include skills and interviewRounds for panelists
      skills: formData.role === "panelist" ? formData.skills : undefined,
      interviewRounds:
        formData.role === "panelist"
          ? formData.panelistType === "manager"
            ? ["R1", "R2", "R3"]
            : formData.interviewRounds
          : undefined,
      // Only include status for panelists
      status: formData.role === "panelist" ? formData.status : undefined,
    }

    onSubmit(submitData)
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

  const handleRoundChange = (round: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        interviewRounds: [...formData.interviewRounds, round],
      })
    } else {
      setFormData({
        ...formData,
        interviewRounds: formData.interviewRounds.filter((r) => r !== round),
      })
    }
  }

  const handleRoleChange = (role: User["role"]) => {
    setFormData({
      ...formData,
      role,
      panelistType: role === "panelist" ? "panel-member" : undefined,
      skills: role === "panelist" ? formData.skills : [],
      interviewRounds: role === "panelist" ? formData.interviewRounds : [],
      status: role === "panelist" ? "available" : undefined,
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
            <SelectItem value="hr">HR Admin</SelectItem>
            <SelectItem value="panelist">Panelist</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.role === "panelist" && (
        <div className="space-y-2">
          <Label htmlFor="panelistType">Panelist Type *</Label>
          <Select
            value={formData.panelistType || "panel-member"}
            onValueChange={(value: "panel-member" | "manager") =>
              setFormData({
                ...formData,
                panelistType: value,
                interviewRounds: value === "manager" ? ["R1", "R2", "R3"] : formData.interviewRounds,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="panel-member">Panelist (Panel Member)</SelectItem>
              <SelectItem value="manager">Panelist (Manager)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.role === "panelist" && (
        <>
          {formData.panelistType === "panel-member" && (
            <div className="space-y-2">
              <Label>Interview Rounds Handled</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="r1"
                    checked={formData.interviewRounds.includes("R1")}
                    onCheckedChange={(checked) => handleRoundChange("R1", checked as boolean)}
                  />
                  <Label htmlFor="r1">Round 1 (Technical)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="r2"
                    checked={formData.interviewRounds.includes("R2")}
                    onCheckedChange={(checked) => handleRoundChange("R2", checked as boolean)}
                  />
                  <Label htmlFor="r2">Round 2 (Technical + Behavioral)</Label>
                </div>
              </div>
            </div>
          )}

          {formData.panelistType === "manager" && (
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>Panelist Manager:</strong> Automatically assigned to handle all interview rounds (R1, R2, R3)
                with focus on final round (R3) interviews and approvals.
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
              {formData.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                </Badge>
              ))}
            </div>
          </div>

          {user && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || "available"}
                onValueChange={(value: string) => setFormData({ ...formData, status: value as User["status"] })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="break">Break</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      )}

      {formData.role === "hr" && (
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>HR Admin Role:</strong> Full access to manage vacancies, candidates, users, and offers. Can oversee
            the entire recruitment process.
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
