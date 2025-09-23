// @ts-nocheck

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, CheckCircle, XCircle, Clock, FileText, TrendingUp, DollarSign, BarChart3 } from "lucide-react"
import { getManagerDashboardData } from "@/lib/manager-data"

export default function ManagerDashboard() {
  const data = getManagerDashboardData()

  const MetricCard = ({
    title,
    value,
    description,
    icon: Icon,
    trend,
    color = "blue",
  }: {
    title: string
    value: string | number
    description?: string
    icon: any
    trend?: { value: number; label: string }
    color?: "blue" | "green" | "orange" | "red" | "gray"
  }) => {
    const colorClasses = {
      blue: "bg-blue-50 text-blue-600",
      green: "bg-green-50 text-green-600",
      orange: "bg-orange-50 text-orange-600",
      red: "bg-red-50 text-red-600",
      gray: "bg-gray-50 text-gray-600",
    }

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
              {trend && (
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">
                    +{trend.value}% {trend.label}
                  </span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <DashboardLayout requiredRole="manager">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
            <p className="text-gray-600">Overview of R3 interviews, offers, and hiring performance.</p>
          </div>
        </div>

        {/* Interview & Selection Metrics */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Interview & Selection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total R3 Interviews"
              value={data.interviews.totalR3Interviews}
              icon={Users}
              trend={{ value: 12, label: "this month" }}
              color="blue"
            />
            <MetricCard
              title="Candidates Selected"
              value={data.interviews.candidatesSelected}
              icon={CheckCircle}
              color="green"
            />
            <MetricCard
              title="Candidates Rejected"
              value={data.interviews.candidatesRejected}
              icon={XCircle}
              color="red"
            />
            <MetricCard
              title="Pending Decisions"
              value={data.interviews.pendingDecisions}
              description="Awaiting your review"
              icon={Clock}
              color="orange"
            />
          </div>
        </div>

        {/* Offers & Hiring */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Offers & Hiring</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Offers Sent"
              value={data.offers.offersSent}
              icon={FileText}
              trend={{ value: 8, label: "this month" }}
              color="blue"
            />
            <MetricCard title="Offers Accepted" value={data.offers.offersAccepted} icon={CheckCircle} color="green" />
            <MetricCard title="Offers Declined" value={data.offers.offersDeclined} icon={XCircle} color="red" />
            <MetricCard
              title="Hired This Month"
              value={data.offers.hiredThisMonth}
              icon={Users}
              trend={{ value: 25, label: "vs last month" }}
              color="green"
            />
          </div>
        </div>

        {/* Performance & Analytics */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance & Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Avg Time to Decision"
              value={`${data.analytics.avgTimeToDecision} days`}
              icon={Clock}
              color="blue"
            />
            <MetricCard
              title="Avg Salary Offered"
              value={`$${data.analytics.avgSalaryOffered.toLocaleString()}`}
              icon={DollarSign}
              color="green"
            />
            <MetricCard
              title="Team Capacity"
              value={`${data.analytics.teamCapacity}%`}
              icon={BarChart3}
              color="orange"
            />
            <MetricCard
              title="Pipeline Health"
              value={`${data.analytics.pipelineHealth}%`}
              description="Quality score"
              icon={TrendingUp}
              color="green"
            />
          </div>
        </div>

        {/* R3 Candidates Awaiting Decision */}
        <Card>
          <CardHeader>
            <CardTitle>R3 Candidates Awaiting Your Decision</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.pendingR3Candidates.map((candidate) => (
                <div key={candidate.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{candidate.name}</h3>
                        <p className="text-sm text-gray-600">{candidate.position}</p>
                      </div>
                      <Badge variant="outline">R3</Badge>
                      <Badge className="bg-orange-100 text-orange-800">Pending Decision</Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div>Interview Date: {candidate.interviewDate}</div>
                      <div>Expected CTC: {candidate.expectedCTC}</div>
                      <div>Days Pending: {candidate.daysPending}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                      Select
                    </button>
                    <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent R3 Interview History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent R3 Interview History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentR3History.map((interview) => (
                <div key={interview.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{interview.candidateName}</span>
                      <Badge variant="outline">R3</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Rating:</span>
                      <Badge variant="secondary">{interview.rating}/5</Badge>
                      <Badge
                        className={
                          interview.decision === "selected" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }
                      >
                        {interview.decision}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{interview.notes}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Position: {interview.position}</span>
                    <span>Completed: {interview.completedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hiring Pipeline Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Hiring Status */}
          <Card>
            <CardHeader>
              <CardTitle>Team Hiring Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.teamHiringStatus.map((team) => (
                  <div key={team.department} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{team.department}</div>
                      <div className="text-sm text-gray-500">
                        {team.filled}/{team.total} positions filled
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(team.filled / team.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{Math.round((team.filled / team.total) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Salary Budget Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Salary Budget Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Budget:</span>
                  <span className="font-medium">${data.salaryBudget.totalBudget.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Allocated:</span>
                  <span className="font-medium">${data.salaryBudget.allocated.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Remaining:</span>
                  <span className="font-medium text-green-600">${data.salaryBudget.remaining.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(data.salaryBudget.allocated / data.salaryBudget.totalBudget) * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500 text-center">
                  {Math.round((data.salaryBudget.allocated / data.salaryBudget.totalBudget) * 100)}% of budget used
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
