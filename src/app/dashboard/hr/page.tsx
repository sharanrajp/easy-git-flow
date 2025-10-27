// @ts-nocheck

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Users, UserCheck, Clock, CheckCircle, TrendingUp, Calendar, ThumbsUp, Filter, Download } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { calculateHRMetrics, type HRDashboardMetrics } from "@/lib/dashboard-api";
import { useToast } from "@/hooks/use-toast";
import { fetchVacancies } from "@/lib/vacancy-api";
import { getAllUsers, type User } from "@/lib/auth";
import type { Position } from "@/lib/schema-data";
import {
  fetchUnassignedCandidates,
  fetchAssignedCandidates,
  fetchOngoingInterviews,
  type BackendCandidate,
} from "@/lib/candidates-api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function HRDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Analytics tab and period filters
  const [activeTab, setActiveTab] = useState("candidates");
  const [timePeriod, setTimePeriod] = useState("this-week");
  const [recruiterFilter, setRecruiterFilter] = useState("all");
  const [jobTitleFilter, setJobTitleFilter] = useState("all");
  const [statusActive, setStatusActive] = useState(true);
  const [statusRejected, setStatusRejected] = useState(true);
  const [statusOffered, setStatusOffered] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Independent filters for each section
  const [candidateFilter, setCandidateFilter] = useState("day");
  const [candidateVacancyFilter, setCandidateVacancyFilter] = useState("all");
  const [pipelineVacancyFilter, setPipelineVacancyFilter] = useState("all");
  const [performanceRecruiterFilter, setPerformanceRecruiterFilter] = useState("all");

  const [vacancies, setVacancies] = useState<Position[]>([]);
  const [hrUsers, setHrUsers] = useState<User[]>([]);

  // Store all fetched data
  const [unassignedCandidates, setUnassignedCandidates] = useState<BackendCandidate[]>([]);
  const [assignedCandidates, setAssignedCandidates] = useState<BackendCandidate[]>([]);
  const [ongoingInterviews, setOngoingInterviews] = useState<any[]>([]);

  // Calculate metrics for Candidate Overview section
  const candidateMetrics = useMemo(() => {
    if (unassignedCandidates.length === 0 && assignedCandidates.length === 0) return null;

    const filters = {
      vacancy: candidateVacancyFilter !== "all" ? candidateVacancyFilter : undefined,
    };

    return calculateHRMetrics(unassignedCandidates, assignedCandidates, ongoingInterviews, filters, vacancies);
  }, [unassignedCandidates, assignedCandidates, ongoingInterviews, candidateVacancyFilter, vacancies]);

  // Calculate metrics for Interview Pipeline with vacancy filter
  const pipelineMetrics = useMemo(() => {
    if (unassignedCandidates.length === 0 && assignedCandidates.length === 0) return null;

    const filters = {
      vacancy: pipelineVacancyFilter !== "all" ? pipelineVacancyFilter : undefined,
    };

    return calculateHRMetrics(unassignedCandidates, assignedCandidates, ongoingInterviews, filters, vacancies);
  }, [unassignedCandidates, assignedCandidates, ongoingInterviews, pipelineVacancyFilter, vacancies]);

  // Calculate metrics for Performance & Hiring section
  const performanceMetrics = useMemo(() => {
    if (unassignedCandidates.length === 0 && assignedCandidates.length === 0) return null;

    const filters = {
      recruiter: performanceRecruiterFilter !== "all" ? performanceRecruiterFilter : undefined,
    };

    return calculateHRMetrics(unassignedCandidates, assignedCandidates, ongoingInterviews, filters, vacancies);
  }, [unassignedCandidates, assignedCandidates, ongoingInterviews, performanceRecruiterFilter, vacancies]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // Listen for updates from other components
    const handleDataUpdate = () => {
      loadInitialData();
    };

    window.addEventListener("dashboardUpdate", handleDataUpdate);
    return () => window.removeEventListener("dashboardUpdate", handleDataUpdate);
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [fetchedVacancies, fetchedUsers, fetchedUnassigned, fetchedAssigned, fetchedOngoing] = await Promise.all([
        fetchVacancies(),
        getAllUsers(),
        fetchUnassignedCandidates(),
        fetchAssignedCandidates(),
        fetchOngoingInterviews(),
      ]);

      setVacancies(fetchedVacancies || []);
      setHrUsers(fetchedUsers.filter((user) => user.role === "hr") || []);
      setUnassignedCandidates(fetchedUnassigned || []);
      setAssignedCandidates(fetchedAssigned || []);
      setOngoingInterviews(fetchedOngoing || []);
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Chart colors
  const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

  // Sample data for charts - replace with actual data from API
  const candidatesBySource = useMemo(() => [
    { name: 'Naukri', value: 420 },
    { name: 'Referral', value: 40 },
    { name: 'Walk-in Drive', value: 28 },
    { name: 'Voler Software', value: 15 },
    { name: 'Expert App Demo', value: 7 },
    { name: 'Data Drone', value: 5 },
    { name: 'Flyrosoft', value: 3 },
    { name: 'Flex Ventures', value: 2 },
  ], []);

  const candidatesByRecruiter = useMemo(() => [
    { name: 'Raja', value: 70.3, count: 350 },
    { name: 'Subikha', value: 9.1, count: 45 },
    { name: 'Pavithra', value: 8.9, count: 44 },
    { name: 'Merwin', value: 7.1, count: 35 },
    { name: 'Preethi', value: 4.6, count: 23 },
  ], []);

  const interviewSchedule = useMemo(() => [
    { position: 'Associate IT Analyst', value: 688 },
  ], []);

  const recruitmentStatus = useMemo(() => [
    { status: 'Reject', value: 281 },
    { status: 'DropOut or NoShow', value: 97 },
    { status: 'Interview in Progress', value: 65 },
    { status: 'Joined', value: 30 },
    { status: 'Sourcing', value: 13 },
    { status: 'OnHold', value: 13 },
    { status: 'Offer Accepted', value: 8 },
    { status: 'Screening Reject', value: 7 },
    { status: 'Offered', value: 5 },
    { status: 'Offer Declined', value: 2 },
    { status: 'Shortlisted for Offer', value: 0 },
    { status: 'Not Joined', value: 0 },
  ], []);

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your data is being exported...",
    });
  };

  const MetricCard = ({
    title,
    value,
    description,
    icon: Icon,
    trend,
    color = "blue",
    filterValue,
  }: {
    title: string;
    value: string | number;
    description?: string;
    icon: any;
    trend?: { value: number; label: string };
    color?: "blue" | "green" | "orange" | "red" | "gray";
    filterValue?: string;
  }) => {
    const colorClasses = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      orange: "from-orange-500 to-orange-600",
      red: "from-red-500 to-red-600",
      gray: "from-gray-500 to-gray-600",
    };

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-slide-up">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
              {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
              {filterValue && <p className="text-xs text-primary mt-1 font-medium">({filterValue})</p>}
              {trend && (
                <div className="flex items-center mt-3 gap-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">
                    +{trend.value}% {trend.label}
                  </span>
                </div>
              )}
            </div>
            <div className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
              <Icon className="h-7 w-7 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="hr">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground animate-pulse">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="hr">
      <div className="space-y-6 animate-fade-in pt-6">
        {/* Time Period Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={timePeriod === "last-week" ? "default" : "outline"}
            onClick={() => setTimePeriod("last-week")}
          >
            LAST WEEK
          </Button>
          <Button
            variant={timePeriod === "this-week" ? "default" : "outline"}
            onClick={() => setTimePeriod("this-week")}
          >
            THIS WEEK
          </Button>
          <Button
            variant={timePeriod === "last-month" ? "default" : "outline"}
            onClick={() => setTimePeriod("last-month")}
          >
            LAST MONTH
          </Button>
          <Button
            variant={timePeriod === "this-month" ? "default" : "outline"}
            onClick={() => setTimePeriod("this-month")}
          >
            THIS MONTH
          </Button>
          <Button
            variant={timePeriod === "last-quarter" ? "default" : "outline"}
            onClick={() => setTimePeriod("last-quarter")}
          >
            LAST QUARTER
          </Button>
          <Button
            variant={timePeriod === "this-quarter" ? "default" : "outline"}
            onClick={() => setTimePeriod("this-quarter")}
          >
            THIS QUARTER
          </Button>
          <Button
            variant={timePeriod === "all" ? "default" : "outline"}
            onClick={() => setTimePeriod("all")}
          >
            ALL
          </Button>
          <Button
            variant={timePeriod === "custom" ? "default" : "outline"}
            onClick={() => setTimePeriod("custom")}
          >
            CUSTOM
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="candidates">Candidates Statistics</TabsTrigger>
            <TabsTrigger value="positions">Positions Statistics</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>

          {/* Candidates Statistics Tab */}
          <TabsContent value="candidates" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <Select value={recruiterFilter} onValueChange={setRecruiterFilter}>
                <SelectTrigger className="w-48 bg-background">
                  <SelectValue placeholder="Recruiter" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="all">All Recruiters</SelectItem>
                  {hrUsers.map((user) => (
                    <SelectItem key={user._id} value={user.name}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={jobTitleFilter} onValueChange={setJobTitleFilter}>
                <SelectTrigger className="w-48 bg-background">
                  <SelectValue placeholder="Job Title" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="all">All Positions</SelectItem>
                  {vacancies.map((vacancy) => (
                    <SelectItem key={vacancy.id} value={vacancy.position_title}>
                      {vacancy.position_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Status:</span>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="active"
                    checked={statusActive}
                    onCheckedChange={(checked) => setStatusActive(checked as boolean)}
                  />
                  <label htmlFor="active" className="text-sm cursor-pointer">
                    Active
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="rejected"
                    checked={statusRejected}
                    onCheckedChange={(checked) => setStatusRejected(checked as boolean)}
                  />
                  <label htmlFor="rejected" className="text-sm cursor-pointer">
                    Rejected/Closed
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="offered"
                    checked={statusOffered}
                    onCheckedChange={(checked) => setStatusOffered(checked as boolean)}
                  />
                  <label htmlFor="offered" className="text-sm cursor-pointer">
                    Offered/Closed
                  </label>
                </div>
              </div>

              <div className="ml-auto">
                <Input
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>

            {/* Export Button */}
            <div className="flex justify-start">
              <Button variant="outline" onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" />
                EXPORT
              </Button>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Candidates by Source */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Candidates by Source</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={candidatesBySource}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3B82F6" label={{ position: 'top' }} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Candidates Sourced by Recruiter */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Candidates Sourced by Recruiter</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={candidatesByRecruiter}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, value }) => `${value}%`}
                      >
                        {candidatesByRecruiter.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Interview Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Interview Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={interviewSchedule}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="position" fontSize={12} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3B82F6" label={{ position: 'top' }} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recruitment Intermediate Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recruitment Intermediate Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={recruitmentStatus} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="status" type="category" width={150} fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" label={{ position: 'right' }} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Positions Statistics Tab */}
          <TabsContent value="positions">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground text-center py-8">Positions statistics coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">

            {/* Candidate Overview Metrics */}
            <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Candidate Overview
            </h2>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={candidateFilter} onValueChange={setCandidateFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
              <Select value={candidateVacancyFilter} onValueChange={setCandidateVacancyFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {vacancies.map((vacancy) => (
                    <SelectItem key={vacancy.id} value={vacancy.id}>
                      {vacancy.position_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Applications"
              value={candidateMetrics?.total_applications || 0}
              icon={Users}
              trend={{ value: 12, label: candidateFilter === "day" ? "vs yesterday" : `vs last ${candidateFilter}` }}
              color="blue"
              filterValue={
                candidateFilter === "day"
                  ? "Today"
                  : candidateFilter === "week"
                    ? "This Week"
                    : candidateFilter === "month"
                      ? "This Month"
                      : "This Quarter"
              }
            />
            <MetricCard
              title="Unassigned Candidates"
              value={candidateMetrics?.unassigned_candidates || 0}
              description="Awaiting recruiter assignment"
              icon={UserCheck}
              color="orange"
              filterValue={
                candidateFilter === "day"
                  ? "Today"
                  : candidateFilter === "week"
                    ? "This Week"
                    : candidateFilter === "month"
                      ? "This Month"
                      : "This Quarter"
              }
            />
            <MetricCard
              title="Interviews Scheduled"
              value={candidateMetrics?.interviews_scheduled || 0}
              description="Across all rounds"
              icon={Clock}
              color="green"
              filterValue={
                candidateFilter === "day"
                  ? "Today"
                  : candidateFilter === "week"
                    ? "This Week"
                    : candidateFilter === "month"
                      ? "This Month"
                      : "This Quarter"
              }
            />
            <MetricCard
              title="Joined/Offer Released"
              value={`${candidateMetrics?.joined_count || 0}/${candidateMetrics?.offer_released_count || 0}`}
              icon={CheckCircle}
              trend={{ value: 25, label: `vs last ${candidateFilter}` }}
              color="green"
              filterValue={
                candidateFilter === "day"
                  ? "Today"
                  : candidateFilter === "week"
                    ? "This Week"
                    : candidateFilter === "month"
                      ? "This Month"
                      : "This Quarter"
              }
            />
            </div>
            </div>

            {/* Interview Pipeline */}
            <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Interview Pipeline
            </h2>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={pipelineVacancyFilter} onValueChange={setPipelineVacancyFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {vacancies.map((vacancy) => (
                    <SelectItem key={vacancy.id} value={vacancy.id}>
                      {vacancy.position_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Ongoing R1"
              value={pipelineMetrics?.ongoing_r1 || 0}
              description="Technical Screen in progress"
              icon={Users}
              color="blue"
            />
            <MetricCard
              title="Ongoing R2"
              value={pipelineMetrics?.ongoing_r2 || 0}
              description="Technical + Behavioral in progress"
              icon={Users}
              color="orange"
            />
            <MetricCard
              title="Ongoing R3"
              value={pipelineMetrics?.ongoing_r3 || 0}
              description="Manager Interview in progress"
              icon={Users}
              color="green"
            />
            </div>
            </div>

            {/* Performance & Hiring */}
            <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performance & Hiring Metrics
            </h2>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={performanceRecruiterFilter} onValueChange={setPerformanceRecruiterFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Recruiters</SelectItem>
                  {hrUsers.map((user) => (
                    <SelectItem key={user._id} value={user.name}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Successful Hires"
              value={performanceMetrics?.successful_hires || 0}
              description="This month"
              icon={CheckCircle}
              trend={{ value: 25, label: "vs last month" }}
              color="green"
            />
            <MetricCard
              title="Interview-to-Offer Rate"
              value={`${performanceMetrics?.interview_to_offer_rate || 0}%`}
              description="Conversion efficiency"
              icon={TrendingUp}
              color="blue"
            />
            <MetricCard
              title="Avg. Time to Hire"
              value={`${performanceMetrics?.avg_time_to_hire || 0} days`}
              description="From application to offer"
              icon={Calendar}
              color="gray"
            />
            <MetricCard
              title="Offer Acceptance Rate"
              value={`${performanceMetrics?.offer_acceptance_rate || 0}%`}
              description="Offers accepted vs. offered"
              icon={ThumbsUp}
              trend={{ value: 5, label: "vs last month" }}
              color="green"
            />
            </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
