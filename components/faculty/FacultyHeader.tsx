"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function FacultyHeader() {
  const { data: session } = useSession()
  const router = useRouter()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search students, assignments..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-xs">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/faculty/submissions')}>
              <div className="flex flex-col gap-1">
                <p className="font-medium">New Submission</p>
                <p className="text-sm text-gray-500">
                  John Doe submitted Research Paper
                </p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/faculty/ai-detection')}>
              <div className="flex flex-col gap-1">
                <p className="font-medium">High AI Detection</p>
                <p className="text-sm text-gray-500">
                  Assignment flagged with 95% AI confidence
                </p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/faculty/grading')}>
              <div className="flex flex-col gap-1">
                <p className="font-medium">Grading Reminder</p>
                <p className="text-sm text-gray-500">
                  5 assignments pending review
                </p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-600 text-white">
                  {session?.user?.name ? getInitials(session.user.name) : "F"}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium">{session?.user?.name || "Faculty"}</p>
                <p className="text-xs text-gray-500">Professor</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/faculty/dashboard')}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/faculty/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
