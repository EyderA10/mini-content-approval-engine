type StatusBadgeProps = {
  status: 'pending' | 'approved' | 'rejected'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    pending: 'bg-warning-subtle text-warning border border-warning/20',
    approved: 'bg-success-subtle text-success border border-success/20',
    rejected: 'bg-error-subtle text-error border border-error/20',
  }

  const labels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${styles[status]}`}
    >
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
        status === 'pending' ? 'bg-warning' : 
        status === 'approved' ? 'bg-success' : 
        'bg-error'
      }`} />
      {labels[status]}
    </span>
  )
}