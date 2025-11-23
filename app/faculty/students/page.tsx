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
import { Search, UserCircle } from "lucide-react"
import Link from "next/link"

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/faculty/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
      } else {
        console.error("Failed to fetch students")
        setStudents([])
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      setStudents([])
    }
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.major.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
        <p className="text-muted-foreground mt-2">
          View and manage student profiles
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, ID, or major..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Students ({filteredStudents.length})</CardTitle>
          <CardDescription>
            Overview of student performance and AI usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Year & Major</TableHead>
                <TableHead>Prior GPA</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead>Avg AI Usage</TableHead>
                <TableHead>Avg Creativity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.studentId}</p>
                        {student.firstGen && (
                          <Badge variant="secondary" className="text-xs mt-1">First Gen</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p>Year {student.year}</p>
                    <p className="text-sm text-muted-foreground">{student.major}</p>
                  </TableCell>
                  <TableCell>{student.priorGpa.toFixed(2)}</TableCell>
                  <TableCell>{student.submissions}</TableCell>
                  <TableCell>
                    <Badge variant={student.avgAI > 60 ? "destructive" : "outline"}>
                      {student.avgAI}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{student.avgCreativity.toFixed(1)}/5</span>
                  </TableCell>
                  <TableCell>
                    <Link href={`/faculty/students/${student.studentId}`}>
                      <Button size="sm" variant="outline">View Details</Button>
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
