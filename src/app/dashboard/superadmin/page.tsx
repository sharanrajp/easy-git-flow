import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { fetchVacancies } from "@/lib/vacancy-api";
import { getAllUsers, type User } from "@/lib/auth";
import { fetchDriveInsights, type DriveInsights } from "@/lib/analytics-api";
import type { Vacancy } from "@/lib/schema-data";
import { Users, UserCheck, XCircle, CheckCircle, Clock, TrendingUp, Briefcase, Calendar } from "lucide-react";
import { format } from "date-fns";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface AggregateMetrics {
  totalCandidates: number;
  attended: number;
  notAttended: number;
  clearedAllRounds: number;
  totalRejected: number;
  selectionRate: number;
  avgTimeToHire: number;
  activeDrives: number;
}

interface VacancyWithInsights extends Vacancy {
  insights?: DriveInsights;
}

export default function SuperadminDashboard() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [vacancies, setVacancies] = useState<VacancyWithInsights[]>([]);
  const [hrUsers, setHrUsers] = useState<User[]>([]);
  const [selectedHR, setSelectedHR] = useState<string>("all");
  const [selectedDrive, setSelectedDrive] = useState<string>("all");
  const [selectedVacancyId, setSelectedVacancyId] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch all vacancies and HR users in parallel
      const [vacanciesData, allUsers] = await Promise.all([
        fetchVacancies(),
        getAllUsers(),
      ]);

      // Filter HR users
      const hrs = allUsers.filter((user: User) => user.role === "hr" || user.role === "admin");
      setHrUsers(hrs);
      setVacancies(vacanciesData);

      // Fetch insights for each vacancy
      const vacanciesWithInsights = await Promise.all(
        vacanciesData.map(async (vacancy: Vacancy) => {
          try {
            const insights = await fetchDriveInsights(vacancy.id);
            return { ...vacancy, insights };
          } catch (error) {
            console.error(`Failed to fetch insights for vacancy ${vacancy.id}:`, error);
            return vacancy;
          }
        })
      );

      setVacancies(vacanciesWithInsights);
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate aggregate metrics based on filters
  const aggregateMetrics: AggregateMetrics = useMemo(() => {
    let filteredVacancies = vacancies;

    // Apply HR filter
    if (selectedHR !== "all") {
      filteredVacancies = filteredVacancies.filter((v) => v.recruiter_name === selectedHR);
    }

    // Apply Drive filter
    if (selectedDrive !== "all") {
      filteredVacancies = filteredVacancies.filter((v) => v.id === selectedDrive);
    }

    // If a specific vacancy is selected, show only its metrics
    if (selectedVacancyId) {
      const selectedVacancy = vacancies.find((v) => v.id === selectedVacancyId);
      if (selectedVacancy?.insights) {
        const insights = selectedVacancy.insights;
        return {
          totalCandidates: insights.total_candidates,
          attended: insights.attended,
          notAttended: insights.not_attended,
          clearedAllRounds: insights.cleared_all_rounds,
          totalRejected: insights.total_rejected,
          selectionRate: insights.selection_rate,
          avgTimeToHire: insights.avg_time_to_hire,
          activeDrives: selectedVacancy.status === "active" ? 1 : 0,
        };
      }
    }

    // Calculate aggregate metrics
    const metrics = filteredVacancies.reduce(
      (acc, vacancy) => {
        if (vacancy.insights) {
          acc.totalCandidates += vacancy.insights.total_candidates;
          acc.attended += vacancy.insights.attended;
          acc.notAttended += vacancy.insights.not_attended;
          acc.clearedAllRounds += vacancy.insights.cleared_all_rounds;
          acc.totalRejected += vacancy.insights.total_rejected;
          acc.avgTimeToHireSum += vacancy.insights.avg_time_to_hire;
          acc.avgTimeToHireCount += vacancy.insights.avg_time_to_hire > 0 ? 1 : 0;
        }
        if (vacancy.status === "active") {
          acc.activeDrives += 1;
        }
        return acc;
      },
      {
        totalCandidates: 0,
        attended: 0,
        notAttended: 0,
        clearedAllRounds: 0,
        totalRejected: 0,
        activeDrives: 0,
        avgTimeToHireSum: 0,
        avgTimeToHireCount: 0,
      }
    );

    const selectionRate = metrics.totalCandidates > 0 ? (metrics.clearedAllRounds / metrics.totalCandidates) * 100 : 0;
    const avgTimeToHire = metrics.avgTimeToHireCount > 0 ? metrics.avgTimeToHireSum / metrics.avgTimeToHireCount : 0;

    return {
      totalCandidates: metrics.totalCandidates,
      attended: metrics.attended,
      notAttended: metrics.notAttended,
      clearedAllRounds: metrics.clearedAllRounds,
      totalRejected: metrics.totalRejected,
      selectionRate: parseFloat(selectionRate.toFixed(2)),
      avgTimeToHire: parseFloat(avgTimeToHire.toFixed(2)),
      activeDrives: metrics.activeDrives,
    };
  }, [vacancies, selectedHR, selectedDrive, selectedVacancyId]);

  // Prepare chart data
  const barChartData = useMemo(() => {
    let filteredVacancies = vacancies;
    if (selectedHR !== "all") {
      filteredVacancies = filteredVacancies.filter((v) => v.recruiter_name === selectedHR);
    }
    return filteredVacancies
      .filter((v) => v.insights)
      .map((v) => ({
        name: v.position_title.length > 20 ? v.position_title.substring(0, 20) + "..." : v.position_title,
        selectionRate: v.insights?.selection_rate || 0,
      }))
      .slice(0, 10);
  }, [vacancies, selectedHR]);

  const lineChartData = useMemo(() => {
    let filteredVacancies = vacancies;
    if (selectedHR !== "all") {
      filteredVacancies = filteredVacancies.filter((v) => v.recruiter_name === selectedHR);
    }
    return filteredVacancies
      .filter((v) => v.insights && v.insights.avg_time_to_hire > 0)
      .sort((a, b) => new Date(a.drive_date || "").getTime() - new Date(b.drive_date || "").getTime())
      .map((v) => ({
        date: format(new Date(v.drive_date || ""), "MMM dd"),
        avgDays: v.insights?.avg_time_to_hire || 0,
      }));
  }, [vacancies, selectedHR]);

  const pieChartData = useMemo(() => {
    return [
      { name: "Attended", value: aggregateMetrics.attended },
      { name: "Not Attended", value: aggregateMetrics.notAttended },
    ];
  }, [aggregateMetrics]);

  // HR Performance Data
  const hrPerformanceData = useMemo(() => {
    const hrMap = new Map<string, { totalCandidates: number; attended: number; selected: number; drivesManaged: number }>();

    vacancies.forEach((vacancy) => {
      const hrName = vacancy.recruiter_name;
      if (!hrMap.has(hrName)) {
        hrMap.set(hrName, { totalCandidates: 0, attended: 0, selected: 0, drivesManaged: 0 });
      }
      const hrData = hrMap.get(hrName)!;
      hrData.drivesManaged += 1;
      if (vacancy.insights) {
        hrData.totalCandidates += vacancy.insights.total_candidates;
        hrData.attended += vacancy.insights.attended;
        hrData.selected += vacancy.insights.cleared_all_rounds;
      }
    });

    return Array.from(hrMap.entries())
      .map(([name, data]) => ({
        name,
        totalCandidates: data.totalCandidates,
        attended: data.attended,
        selected: data.selected,
        selectionRate: data.totalCandidates > 0 ? (data.selected / data.totalCandidates) * 100 : 0,
        drivesManaged: data.drivesManaged,
      }))
      .sort((a, b) => b.selectionRate - a.selectionRate);
  }, [vacancies]);

  const handleDriveRowClick = (vacancyId: string) => {
    setSelectedVacancyId(vacancyId === selectedVacancyId ? null : vacancyId);
  };

  const handleFilterChange = () => {
    setSelectedVacancyId(null); // Reset selected vacancy when filters change
  };

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))"];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Superadmin Dashboard</h1>
          <p className="text-muted-foreground mt-2">ATS Hiring Overview</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">HR Filter</label>
                <Select
                  value={selectedHR}
                  onValueChange={(value) => {
                    setSelectedHR(value);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select HR" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All HRs</SelectItem>
                    {hrUsers.map((hr) => (
                      <SelectItem key={hr._id} value={hr.name}>
                        {hr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Drive Filter</label>
                <Select
                  value={selectedDrive}
                  onValueChange={(value) => {
                    setSelectedDrive(value);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Drive" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Drives</SelectItem>
                    {vacancies.map((vacancy) => (
                      <SelectItem key={vacancy.id} value={vacancy.id}>
                        {vacancy.position_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={loadInitialData} variant="outline">
                  Refresh Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aggregateMetrics.totalCandidates}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Attended</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aggregateMetrics.attended}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Not Attended</CardTitle>
              <XCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aggregateMetrics.notAttended}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Cleared All Rounds</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aggregateMetrics.clearedAllRounds}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aggregateMetrics.totalRejected}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Selection Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aggregateMetrics.selectionRate}%</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Time to Hire</CardTitle>
              <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aggregateMetrics.avgTimeToHire} days</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Drives</CardTitle>
              <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aggregateMetrics.activeDrives}</div>
            </CardContent>
          </Card>
        </div>

        {/* Drives Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle>Drives Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Drive Title</TableHead>
                  <TableHead>HR Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Drive Date</TableHead>
                  <TableHead className="text-right">Total Candidates</TableHead>
                  <TableHead className="text-right">Selected</TableHead>
                  <TableHead className="text-right">Selection Rate</TableHead>
                  <TableHead className="text-right">Avg Time (days)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vacancies
                  .filter((v) => {
                    if (selectedHR !== "all" && v.recruiter_name !== selectedHR) return false;
                    if (selectedDrive !== "all" && v.id !== selectedDrive) return false;
                    return true;
                  })
                  .map((vacancy) => (
                    <TableRow
                      key={vacancy.id}
                      className={`cursor-pointer ${selectedVacancyId === vacancy.id ? "bg-accent" : ""}`}
                      onClick={() => handleDriveRowClick(vacancy.id)}
                    >
                      <TableCell className="font-medium">{vacancy.position_title}</TableCell>
                      <TableCell>{vacancy.recruiter_name}</TableCell>
                      <TableCell>{vacancy.drive_location}</TableCell>
                      <TableCell>{format(new Date(vacancy.drive_date || ""), "MMM dd, yyyy")}</TableCell>
                      <TableCell className="text-right">{vacancy.insights?.total_candidates || 0}</TableCell>
                      <TableCell className="text-right">{vacancy.insights?.cleared_all_rounds || 0}</TableCell>
                      <TableCell className="text-right">{vacancy.insights?.selection_rate.toFixed(2) || 0}%</TableCell>
                      <TableCell className="text-right">{vacancy.insights?.avg_time_to_hire.toFixed(2) || 0}</TableCell>
                      <TableCell>
                        <Badge variant={vacancy.status === "active" ? "default" : "secondary"}>
                          {vacancy.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* HR Performance Section */}
        <Card>
          <CardHeader>
            <CardTitle>HR Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>HR Name</TableHead>
                  <TableHead className="text-right">Total Candidates</TableHead>
                  <TableHead className="text-right">Attended</TableHead>
                  <TableHead className="text-right">Selected</TableHead>
                  <TableHead>Selection Rate</TableHead>
                  <TableHead className="text-right">Drives Managed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hrPerformanceData.map((hr) => (
                  <TableRow key={hr.name}>
                    <TableCell className="font-medium">{hr.name}</TableCell>
                    <TableCell className="text-right">{hr.totalCandidates}</TableCell>
                    <TableCell className="text-right">{hr.attended}</TableCell>
                    <TableCell className="text-right">{hr.selected}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={hr.selectionRate} className="w-20" />
                        <span className="text-sm">{hr.selectionRate.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{hr.drivesManaged}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Selection Rate by Drive</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="selectionRate" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Time to Hire Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgDays" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieChartData} cx="50%" cy="50%" labelLine={false} label={(entry) => `${entry.name}: ${entry.value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
