import { Badge } from "@/components/ui/badge"

type StatusBadgeProps = {
  status: 'pending' | 'approved' | 'rejected'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = {
    pending: "secondary" as const,
    approved: "default" as const,
    rejected: "destructive" as const,
  }

  const labels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
  }

  return (
    <Badge variant={variant[status]}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
        status === 'pending' ? 'bg-warning' : 
        status === 'approved' ? 'bg-success' : 
        'bg-error'
      }`} />
      {labels[status]}
    </Badge>
  )
}