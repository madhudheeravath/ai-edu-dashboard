"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, Users, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, role: string) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        email,
        password,
        role,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Authentication Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        })
        
        // Redirect based on role
        if (role === "student") {
          router.push("/student/dashboard")
        } else {
          router.push("/faculty/dashboard")
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 p-4">
      {/* Back to Home Button */}
      <Link 
        href="/" 
        className="absolute top-4 left-4 flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      <Card className="w-full max-w-md shadow-2xl animate-fade-in">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
              <GraduationCap className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-base">
            Sign in to your AI Education Platform account
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="student" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Student
              </TabsTrigger>
              <TabsTrigger value="faculty" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Faculty
              </TabsTrigger>
            </TabsList>

            {/* Student Login */}
            <TabsContent value="student" className="animate-slide-up">
              <form onSubmit={(e) => handleSubmit(e, "student")} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-email">Email Address</Label>
                  <Input
                    id="student-email"
                    name="email"
                    type="email"
                    placeholder="student@university.edu"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-password">Password</Label>
                  <Input
                    id="student-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                  <Link href="/forgot-password" className="text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In as Student"}
                </Button>
              </form>
              
              <div className="mt-6 text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/signup" className="text-primary font-medium hover:underline">
                  Sign up
                </Link>
              </div>
            </TabsContent>

            {/* Faculty Login */}
            <TabsContent value="faculty" className="animate-slide-up">
              <form onSubmit={(e) => handleSubmit(e, "faculty")} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="faculty-email">Email Address</Label>
                  <Input
                    id="faculty-email"
                    name="email"
                    type="email"
                    placeholder="professor@university.edu"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faculty-password">Password</Label>
                  <Input
                    id="faculty-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                  <Link href="/forgot-password" className="text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In as Faculty"}
                </Button>
              </form>
              
              <div className="mt-6 text-center text-sm text-gray-600">
                Need faculty access?{" "}
                <Link href="/contact" className="text-primary font-medium hover:underline">
                  Contact admin
                </Link>
              </div>
            </TabsContent>
          </Tabs>

          {/* Signup Link */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Create account here
            </Link>
          </div>

          {/* Demo Credentials Info */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-900 mb-2">✅ Working Credentials:</p>
            <div className="text-xs text-blue-800 space-y-1">
              <p><strong>Student:</strong> student@university.edu / password123</p>
              <p><strong>Faculty:</strong> faculty@university.edu / password123</p>
              <p className="text-blue-600 mt-2"><strong>Or any:</strong> stu10004@university.edu / password123</p>
              <p className="text-blue-600"><strong>Or any:</strong> fac1001@university.edu / password123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
