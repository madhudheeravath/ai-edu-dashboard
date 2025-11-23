import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string to a readable format
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Get the status of a due date (overdue, due soon, upcoming)
 */
export function getDueDateStatus(dueDate: string | Date): {
  status: 'overdue' | 'due-soon' | 'upcoming'
  color: string
  text: string
  daysRemaining: number
} {
  const due = new Date(dueDate)
  const now = new Date()
  const diffTime = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return {
      status: 'overdue',
      color: 'text-red-600',
      text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`,
      daysRemaining: diffDays
    }
  } else if (diffDays === 0) {
    return {
      status: 'due-soon',
      color: 'text-red-600',
      text: 'Due Today',
      daysRemaining: 0
    }
  } else if (diffDays <= 3) {
    return {
      status: 'due-soon',
      color: 'text-orange-600',
      text: `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`,
      daysRemaining: diffDays
    }
  } else {
    return {
      status: 'upcoming',
      color: 'text-green-600',
      text: `Due in ${diffDays} days`,
      daysRemaining: diffDays
    }
  }
}
