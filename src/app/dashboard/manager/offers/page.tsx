// @ts-nocheck

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Plus,
  Eye,
  Edit,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  User,
} from "lucide-react"
import { offers, candidates } from "@/lib/manager-data"

export default function OffersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOffer, setSelectedOffer] = useState<any>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      offer.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || offer.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "sent":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "negotiating":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "sent":
        return <FileText className="h-4 w-4" />
      case "accepted":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "negotiating":
        return <DollarSign className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Offer Management</h1>
          <p className="text-gray-600">Manage job offers and track acceptance status</p>
        </div>
        <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <SheetTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Offer
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[600px] sm:w-[600px]">
            <SheetHeader>
              <SheetTitle>Create New Offer</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="candidate">Candidate</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates
                      .filter((c) => c.status === "selected")
                      .map((candidate) => (
                        <SelectItem key={candidate.id} value={candidate.id}>
                          {candidate.name} - {candidate.applied_position}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary Package</Label>
                  <Input id="salary" placeholder="e.g., $120,000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="joiningDate">Joining Date</Label>
                  <Input id="joiningDate" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="benefits">Benefits & Perks</Label>
                <Textarea id="benefits" placeholder="Health insurance, stock options, flexible hours..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea id="terms" placeholder="Employment terms, probation period, notice period..." />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Create Offer</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search offers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="negotiating">Negotiating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOffers.map((offer) => (
              <Card key={offer.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{offer.candidateName}</CardTitle>
                      <p className="text-sm text-gray-600">{offer.position}</p>
                    </div>
                    <Badge className={`${getStatusColor(offer.status)} flex items-center gap-1`}>
                      {getStatusIcon(offer.status)}
                      {offer.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    {offer.salary}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Joining: {offer.joiningDate}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    Created: {offer.createdDate}
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOffer(offer)
                        setIsDetailsOpen(true)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-900">Candidate</th>
                      <th className="text-left p-4 font-medium text-gray-900">Position</th>
                      <th className="text-left p-4 font-medium text-gray-900">Salary</th>
                      <th className="text-left p-4 font-medium text-gray-900">Status</th>
                      <th className="text-left p-4 font-medium text-gray-900">Joining Date</th>
                      <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOffers.map((offer) => (
                      <tr key={offer.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{offer.candidateName}</div>
                              <div className="text-sm text-gray-500">{offer.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-900">{offer.position}</td>
                        <td className="p-4 text-gray-900">{offer.salary}</td>
                        <td className="p-4">
                          <Badge className={`${getStatusColor(offer.status)} flex items-center gap-1 w-fit`}>
                            {getStatusIcon(offer.status)}
                            {offer.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-gray-900">{offer.joiningDate}</td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOffer(offer)
                                setIsDetailsOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="w-[600px] sm:w-[600px]">
          {selectedOffer && (
            <>
              <SheetHeader>
                <SheetTitle>Offer Details</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedOffer.candidateName}</h3>
                    <p className="text-gray-600">{selectedOffer.position}</p>
                  </div>
                  <Badge className={`${getStatusColor(selectedOffer.status)} flex items-center gap-1`}>
                    {getStatusIcon(selectedOffer.status)}
                    {selectedOffer.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Salary Package</Label>
                    <p className="text-lg font-semibold text-gray-900">{selectedOffer.salary}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Joining Date</Label>
                    <p className="text-gray-900">{selectedOffer.joiningDate}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Benefits & Perks</Label>
                  <p className="text-gray-900">{selectedOffer.benefits}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Terms & Conditions</Label>
                  <p className="text-gray-900">{selectedOffer.terms}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Created Date</Label>
                    <p className="text-gray-900">{selectedOffer.createdDate}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Valid Until</Label>
                    <p className="text-gray-900">{selectedOffer.validUntil}</p>
                  </div>
                </div>

                {selectedOffer.notes && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Notes</Label>
                    <p className="text-gray-900">{selectedOffer.notes}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline">Edit Offer</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">Send Offer</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
