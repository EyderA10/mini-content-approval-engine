import { Badge } from "@/components/ui/badge"
import { ContentStatus } from '@/lib/enums'

type StatusBadgeProps = {
  status: ContentStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = {
    [ContentStatus.Pending]: 'secondary' as const,
    [ContentStatus.Approved]: 'default' as const,
    [ContentStatus.Rejected]: 'destructive' as const,
  }

  return (
    <Badge variant={variant[status]}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
        status === ContentStatus.Pending ? 'bg-warning' : 
        status === ContentStatus.Approved ? 'bg-success' : 
        'bg-error'
      }`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}