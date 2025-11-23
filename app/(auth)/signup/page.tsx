"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserPlus, GraduationCap, Users } from "lucide-react"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    // Student specific fields
    studentId: "",
    major: "",
    semester: "",
    aiAwareness: "",
    // Faculty specific fields
    facultyId: "",
    department: "",
    expYears: "",
    aiLiteracy: "",
    dashboardAdoption: "",
    numCourses: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("") // Clear error when user types
  }

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setError("Please fill in all required fields")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return false
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address")
      return false
    }

    if (!agreeTerms) {
      setError("Please agree to the terms and conditions")
      return false
    }

    // Role-specific validation
    if (formData.role === "student") {
      if (!formData.studentId || !formData.major || !formData.semester) {
        setError("Please fill in all student information fields")
        return false
      }
    }

    if (formData.role === "faculty") {
      if (!formData.facultyId || !formData.department || !formData.expYears) {
        setError("Please fill in all faculty information fields")
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Account created successfully! Redirecting to login...")
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setError(data.error || "Failed to create account")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Join the AI Education Dashboard platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">I am a *</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Student
                    </div>
                  </SelectItem>
                  <SelectItem value="faculty">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Faculty Member
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Student-specific fields */}
            {formData.role === "student" && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID *</Label>
                    <Input
                      id="studentId"
                      placeholder="e.g., STU12345"
                      value={formData.studentId}
                      onChange={(e) => handleInputChange("studentId", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="major">Major *</Label>
                    <Select value={formData.major} onValueChange={(value) => handleInputChange("major", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your major" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Psychology">Psychology</SelectItem>
                        <SelectItem value="Biology">Biology</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="History">History</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="semester">Current Semester *</Label>
                    <Select value={formData.semester} onValueChange={(value) => handleInputChange("semester", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st Semester</SelectItem>
                        <SelectItem value="2">2nd Semester</SelectItem>
                        <SelectItem value="3">3rd Semester</SelectItem>
                        <SelectItem value="4">4th Semester</SelectItem>
                        <SelectItem value="5">5th Semester</SelectItem>
                        <SelectItem value="6">6th Semester</SelectItem>
                        <SelectItem value="7">7th Semester</SelectItem>
                        <SelectItem value="8">8th Semester</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aiAwareness">AI Awareness Level</Label>
                    <Select value={formData.aiAwareness} onValueChange={(value) => handleInputChange("aiAwareness", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select awareness level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Beginner (1-2)</SelectItem>
                        <SelectItem value="3">Intermediate (3-4)</SelectItem>
                        <SelectItem value="5">Advanced (5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Faculty-specific fields */}
            {formData.role === "faculty" && (
              <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900">Faculty Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facultyId">Faculty ID *</Label>
                    <Input
                      id="facultyId"
                      placeholder="e.g., FAC12345"
                      value={formData.facultyId}
                      onChange={(e) => handleInputChange("facultyId", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Psychology">Psychology</SelectItem>
                        <SelectItem value="Biology">Biology</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="History">History</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expYears">Years of Experience *</Label>
                    <Input
                      id="expYears"
                      type="number"
                      placeholder="e.g., 5"
                      value={formData.expYears}
                      onChange={(e) => handleInputChange("expYears", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aiLiteracy">AI Literacy Level</Label>
                    <Select value={formData.aiLiteracy} onValueChange={(value) => handleInputChange("aiLiteracy", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Beginner (1-2)</SelectItem>
                        <SelectItem value="3">Intermediate (3-4)</SelectItem>
                        <SelectItem value="5">Advanced (5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numCourses">Courses Teaching</Label>
                    <Input
                      id="numCourses"
                      type="number"
                      placeholder="e.g., 3"
                      value={formData.numCourses}
                      onChange={(e) => handleInputChange("numCourses", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreeTerms}
                onCheckedChange={setAgreeTerms}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>

            {/* Login Link */}
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
