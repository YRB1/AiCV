import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'gerade eben'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[äöü]/g, c => ({ ä: 'ae', ö: 'oe', ü: 'ue' }[c] ?? c))
    .replace(/[^a-z0-9-]/g, '')
}

export function formatDocxName(firma: string, beruf: string) {
  const date = new Date().toISOString().split('T')[0]
  return `Bewerbung_${slugify(firma)}_${slugify(beruf)}_${date}.docx`
}