import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  X,
  Upload,
  Search,
  UserPlus,
  UserMinus,
  Loader2,
  CalendarIcon,
  Check,
  ChevronsUpDown,
  XCircle,
} from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Position } from "@/lib/schema-data";
import { getAllUsers } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

interface VacancyFormProps {
  vacancy?: Position;
  onSubmit: (data: Partial<Position>) => void;
}

export function VacancyForm({ vacancy, onSubmit }: VacancyFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  // No stored user available since we removed localStorage
  const currentUser = null;

  const [formData, setFormData] = useState({
    position_title: vacancy?.position_title || "",
    request_type: vacancy?.request_type || "new",
    job_type: vacancy?.job_type || "full_time",
    priority: vacancy?.priority || "P0",
    projectClientName: vacancy?.projectClientName || "",
    city: vacancy?.city || "", // default city value
    status: vacancy?.status || "active",
    hiring_manager_name: vacancy?.hiring_manager_name || "",
    recruiter_name: vacancy?.recruiter_name || "",
    number_of_vacancies: vacancy?.number_of_vacancies || 1,
    experience_range: vacancy?.experience_range || "",
    position_approved_by: vacancy?.position_approved_by || "",
    category: vacancy?.category || "",
    plan: vacancy?.plan || "",
    skills_required: vacancy?.skills_required || [],
    job_desc: vacancy?.job_desc || "",
    drive_date: vacancy?.walkInDetails?.date || "",
    drive_location: vacancy?.walkInDetails?.location || "",
    assignedPanelists: vacancy?.assignedPanelists || [],
  });

  const [newSkill, setNewSkill] = useState("");
  const [panelistSearch, setPanelistSearch] = useState("");
  const [skillSearchOpen, setSkillSearchOpen] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [hrUsers, setHrUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [managers, setManagers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const users = await getAllUsers();
        setAllUsers(users);
        setManagers(users.filter((user) => user.role === "tpm_tem"));
        setHrUsers(users.filter((user) => user.role === "recruiter"));
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setAllUsers([]);
        setManagers([]);
        setHrUsers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    // No user data available since localStorage was removed
    // This effect is now a no-op
  }, []);

  const filteredUsers = allUsers.filter(
    (user) =>
      user.role === "panel_member" &&
      (user.name?.toLowerCase().includes(panelistSearch.toLowerCase()) ||
        false ||
        (Array.isArray(user.skill_set) &&
          user.skill_set.some((skill: string) => skill?.toLowerCase().includes(panelistSearch.toLowerCase())))),
  );

  const selectedUsers = filteredUsers.filter((u) => formData.assignedPanelists.includes(u._id));
  const unselectedUsers = filteredUsers.filter((u) => !formData.assignedPanelists.includes(u._id));
  const sortedUsers = [...selectedUsers, ...unselectedUsers];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData: Partial<Position> = {
      ...formData,
      experience_range: formData.experience_range,
      interview_type: "Walk-In", // Only Walk-In interviews for this version
      walkInDetails:
        formData.drive_date || formData.drive_location
          ? {
              date: formData.drive_date,
              location: formData.drive_location,
            }
          : undefined,
    };

    onSubmit(submitData);
  };

  const handleCancel = () => {
    // Reset form data to initial state
    setFormData({
      position_title: vacancy?.position_title || "",
      request_type: vacancy?.request_type || "new",
      job_type: vacancy?.job_type || "full_time",
      priority: vacancy?.priority || "P0",
      projectClientName: vacancy?.projectClientName || "",
      city: vacancy?.city || "",
      status: vacancy?.status || "active",
      hiring_manager_name: vacancy?.hiring_manager_name || "",
      recruiter_name: vacancy?.recruiter_name || "",
      number_of_vacancies: vacancy?.number_of_vacancies || 1,
      experience_range: vacancy?.experience_range || "",
      position_approved_by: vacancy?.position_approved_by || "",
      category: vacancy?.category || "",
      plan: vacancy?.plan || "",
      skills_required: vacancy?.skills_required || [],
      job_desc: vacancy?.job_desc || "",
      drive_date: vacancy?.walkInDetails?.date || "",
      drive_location: vacancy?.walkInDetails?.location || "",
      assignedPanelists: vacancy?.assignedPanelists || [],
    });
    setCurrentStep(1);
    setNewSkill("");
    setPanelistSearch("");
    setSkillSearch("");

    // Close the dialog by triggering parent component
    if (typeof window !== "undefined") {
      const event = new CustomEvent("closeVacancyDialog");
      window.dispatchEvent(event);
    }
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !formData.skills_required.includes(skill.trim())) {
      setFormData({
        ...formData,
        skills_required: [...formData.skills_required, skill.trim()],
      });
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills_required: formData.skills_required.filter((s) => s !== skill),
    });
  };

  const toggleSkill = (skill: string) => {
    if (formData.skills_required.includes(skill)) {
      removeSkill(skill);
    } else {
      addSkill(skill);
    }
  };

  // Predefined skills list
  const availableSkills = [
    "Python",
    "Java",
    "SQL",
    "JavaScript",
    "TypeScript",
    "React",
    "Angular",
    "Vue.js",
    "Node.js",
    "Cloud Computing",
    "AWS",
    "Azure",
    "DevOps",
    "Docker",
    "Kubernetes",
    "Data Analysis",
    "Machine Learning",
    "Artificial Intelligence",
    "UX/UI Design",
    "Communication",
    "Leadership",
    "Project Management",
    "Agile",
    "Scrum",
    "HTML",
    "CSS",
    "REST API",
    "GraphQL",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "Git",
    "CI/CD",
  ];

  const filteredSkills = availableSkills.filter((skill) => skill.toLowerCase().includes(skillSearch.toLowerCase()));

  const handlePanelistChange = (panelistId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        assignedPanelists: [...formData.assignedPanelists, panelistId],
      });
    } else {
      setFormData({
        ...formData,
        assignedPanelists: formData.assignedPanelists.filter((id) => id !== panelistId),
      });
    }
  };

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
      formData.experience_range &&
      formData.job_desc.trim() &&
      formData.category &&
      formData.position_approved_by &&
      formData.plan &&
      formData.skills_required.length > 0
    );
  };

  const canSubmit = () => {
    return canProceedToStep2(); // Panelist selection is no longer mandatory
  };

  const progress = currentStep === 1 ? 50 : 100;

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
            <span className={currentStep === 1 ? "font-medium text-blue-600" : ""}>Position Details</span>
            <span className={currentStep === 2 ? "font-medium text-blue-600" : ""}>Select Panelists</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {(currentStep === 1 || vacancy) && (
          <Card>
            <CardHeader>
              <CardTitle>Position Details</CardTitle>
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
                      <SelectItem value="Backup Offer">Backup Offer</SelectItem>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Reopened">Reopened</SelectItem>
                      <SelectItem value="Replacement">Replacement</SelectItem>
                      <SelectItem value="Attrition">Attrition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_type">Employment Type *</Label>
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
                  <Select
                    value={formData.hiring_manager_name}
                    onValueChange={(value: any) => setFormData({ ...formData, hiring_manager_name: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {managers.map((user) => (
                        <SelectItem key={user._id} value={user.name}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="city">Location *</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value: any) => setFormData({ ...formData, city: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Chennai">Chennai</SelectItem>
                      <SelectItem value="Chennai/Remote">Chennai/Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number_of_vacancies">Number of Positions *</Label>
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
                      <SelectItem value="joined">Joined</SelectItem>
                      <SelectItem value="offer Accepted">Offer Accepted</SelectItem>
                      <SelectItem value="offer Declined">Offer Declined</SelectItem>
                      <SelectItem value="on-Hold">On-Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Growth Opportunity">Growth Opportunity</SelectItem>
                      <SelectItem value="Attrition/Backup">Attrition/Backup</SelectItem>
                      <SelectItem value="Proactive Hiring">Proactive Hiring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectClientName">Project/Client Name</Label>
                  <Input
                    id="projectClientName"
                    value={formData.projectClientName}
                    onChange={(e) => setFormData({ ...formData, projectClientName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position_approved_by">Position Approved By *</Label>
                  <Select
                    value={formData.position_approved_by}
                    onValueChange={(value: any) => setFormData({ ...formData, position_approved_by: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select approver" />
                    </SelectTrigger>
                    <SelectContent>
                      {managers.map((user) => (
                        <SelectItem key={user._id} value={user.name}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_range">Experience *</Label>
                <Input
                  id="experience_range"
                  list="experience-presets"
                  placeholder="Select or type experience range"
                  value={formData.experience_range}
                  onChange={(e) => setFormData({ ...formData, experience_range: e.target.value })}
                  onBlur={(e) => {
                    const value = e.target.value.trim();
                    // Check if value matches pattern like "5-7" or "5+" and doesn't already end with "years"
                    if (value && /^\d+[-+]\d*$/.test(value) && !value.toLowerCase().includes('year')) {
                      setFormData({ ...formData, experience_range: value + ' years' });
                    }
                  }}
                  required
                />
                <datalist id="experience-presets">
                  <option value="0-1 years" />
                  <option value="1-2 years" />
                  <option value="2-3 years" />
                  <option value="4-5 years" />
                  <option value="5+ years" />
                </datalist>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan">Reason for Hiring *</Label>
                <Input
                  id="plan"
                  placeholder="Enter the reason for opening this position"
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Skills Required *</Label>
                <Popover open={skillSearchOpen} onOpenChange={setSkillSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={skillSearchOpen}
                      className="w-full justify-between"
                      type="button"
                    >
                      Select skills...
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start" onWheel={(e) => e.stopPropagation()}>
                    <div className="flex flex-col">
                      <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                          placeholder="Search or add custom skill..."
                          value={skillSearch}
                          onChange={(e) => setSkillSearch(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && skillSearch.trim()) {
                              e.preventDefault();
                              addSkill(skillSearch);
                              setSkillSearch("");
                            }
                          }}
                          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                        {skillSearch && (
                          <button
                            type="button"
                            onClick={() => setSkillSearch("")}
                            className="ml-2 hover:bg-accent rounded-sm p-1 transition-colors"
                            aria-label="Clear search"
                          >
                            <XCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </button>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto p-1">
                        {skillSearch && !availableSkills.some((s) => s.toLowerCase() === skillSearch.toLowerCase()) && (
                          <div
                            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                            onClick={() => {
                              addSkill(skillSearch);
                              setSkillSearch("");
                            }}
                          >
                            <div className="flex items-center flex-1">
                              <span className="font-medium">Add "{skillSearch}"</span>
                            </div>
                          </div>
                        )}
                        {filteredSkills.map((skill) => (
                          <div
                            key={skill}
                            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                            onClick={() => toggleSkill(skill)}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                formData.skills_required.includes(skill) ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            {skill}
                          </div>
                        ))}
                        {filteredSkills.length === 0 && !skillSearch && (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">No skills found</div>
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills_required.map((skill) => (
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

              <div className="space-y-2">
                <Label htmlFor="job_desc">Job Description *</Label>
                <Textarea
                  id="job_desc"
                  placeholder="Enter job description, responsibilities, and requirements..."
                  value={formData.job_desc || ""}
                  onChange={(e) => setFormData({ ...formData, job_desc: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Drive Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.drive_date ? formatDate(formData.drive_date) : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={formData.drive_date ? new Date(formData.drive_date) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, "0");
                              const day = String(date.getDate()).padStart(2, "0");
                              setFormData({ ...formData, drive_date: `${year}-${month}-${day}` });
                            } else {
                              setFormData({ ...formData, drive_date: "" });
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="drive_location">Drive Location</Label>
                    <Input
                      id="drive_location"
                      placeholder="Enter interview location"
                      value={formData.drive_location}
                      onChange={(e) => setFormData({ ...formData, drive_location: e.target.value })}
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
                Choose panelists for this vacancy (optional). Selected:{" "}
                {formData.assignedPanelists.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  <h3 className="text-lg font-semibold">Loading Panelists...</h3>
                </div>
              ) : (
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
              )}

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
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentStep(2);
                }}
                disabled={!canProceedToStep2()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next: Select Panelists
              </Button>
            ) : (
              <Button type="submit" disabled={!canSubmit()} className="bg-blue-600 hover:bg-blue-700">
                Create Position
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
