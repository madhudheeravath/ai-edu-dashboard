"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Filter, Download } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchSubmissions()
  }, [filter, searchTerm])

  const fetchSubmissions = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter)
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`/api/faculty/submissions?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions || [])
      } else {
        console.error("Failed to fetch submissions")
        setSubmissions([])
      }
    } catch (error) {
      console.error("Error fetching submissions:", error)
      setSubmissions([])
    }
  }

  const filteredSubmissions = submissions.filter(sub => {
    const matchesFilter = filter === "all" || sub.status === filter
    const matchesSearch = 
      sub.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.assignment.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Submissions</h1>
          <p className="text-muted-foreground mt-2">
            Review and grade student submissions
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export All
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by student or assignment..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Submissions</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="graded">Graded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Submissions ({filteredSubmissions.length})</CardTitle>
          <CardDescription>
            Click on a submission to review and grade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>AI Detection</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{submission.student}</p>
                      <p className="text-sm text-muted-foreground">{submission.studentId}</p>
                    </div>
                  </TableCell>
                  <TableCell>{submission.assignment}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{submission.type}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(submission.submittedAt)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={submission.aiDetected > 70 ? "destructive" : "outline"}
                    >
                      {submission.aiDetected}% AI
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        submission.status === "flagged" ? "destructive" :
                        submission.status === "graded" ? "default" :
                        "secondary"
                      }
                    >
                      {submission.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/faculty/grading/${submission.id}`}>
                      <Button size="sm" variant={submission.status === "graded" ? "outline" : "default"}>
                        {submission.status === "graded" ? "View" : "Grade"}
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
