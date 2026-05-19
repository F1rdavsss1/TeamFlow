import { format, formatDistanceToNow, isPast } from 'date-fns'
import { ru } from 'date-fns/locale'

export const formatDate = (date: string | Date) =>
  format(new Date(date), 'dd MMM yyyy', { locale: ru })

export const formatRelative = (date: string | Date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true, locale: ru })

export const isOverdue = (date: string | Date) =>
  isPast(new Date(date))
