"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  ClipboardCheck,
  Settings,
  LogOut,
  GraduationCap,
  TrendingUp,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

const navigation = [
  { name: "Dashboard", href: "/faculty", icon: LayoutDashboard },
  { name: "My Subjects", href: "/faculty/subjects", icon: BookOpen },
  { name: "Enrolled Students", href: "/faculty/enrolled-students", icon: GraduationCap },
  { name: "Assignments", href: "/faculty/assignments", icon: FileText },
  { name: "Submissions", href: "/faculty/submissions", icon: FileText },
  { name: "Grading", href: "/faculty/grading", icon: ClipboardCheck },
  { name: "Students", href: "/faculty/students", icon: Users },
  { name: "Analytics", href: "/faculty/analytics", icon: BarChart3 },
  { name: "AI Detection", href: "/faculty/ai-detection", icon: TrendingUp },
  { name: "Settings", href: "/faculty/settings", icon: Settings },
]

export function FacultySidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-white border-r">
      <div className="flex items-center justify-center h-16 border-b bg-gradient-to-r from-blue-600 to-blue-700">
        <GraduationCap className="h-6 w-6 text-white mr-2" />
        <h1 className="text-xl font-bold text-white">Faculty Portal</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
