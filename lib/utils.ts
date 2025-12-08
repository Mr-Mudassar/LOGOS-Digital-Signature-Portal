import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diffInMs = now.getTime() - d.getTime()
  const diffInHours = diffInMs / (1000 * 60 * 60)

  if (diffInHours < 24) {
    const hours = Math.floor(diffInHours)
    if (hours === 0) {
      const minutes = Math.floor(diffInMs / (1000 * 60))
      return `${minutes}m ago`
    }
    return `${hours}h ago`
  } else if (diffInHours < 48) {
    return 'Yesterday'
  } else {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
}
