import { Badge } from '@/components/ui/badge';

type StatusTone = 'active' | 'pending' | 'danger' | 'inactive' | 'progress';

const STATUS_TONE_MAP: Record<StatusTone, { variant: any; fallbackText: string }> = {
  active: { variant: 'statusActive', fallbackText: 'Active' },
  pending: { variant: 'statusPending', fallbackText: 'Pending' },
  danger: { variant: 'destructive', fallbackText: 'Failed' },
  inactive: { variant: 'statusInactive', fallbackText: 'Inactive' },
  progress: { variant: 'statusProgress', fallbackText: 'In Progress' }
};

const STATUS_KEYWORDS: Record<StatusTone, string[]> = {
  active: ['active', 'completed', 'approved', 'success'],
  pending: ['pending', 'scheduled', 'accepted'],
  danger: [
    'inactive',
    'failed',
    'rejected',
    'cancelled',
    'canceled',
    'blocked',
    'suspended',
    'refunded',
    'refund'
  ],
  inactive: ['not started', 'not scheduled', 'draft'],
  progress: ['in progress', 'processing', 'under review', 'under-review', 'under_review']
};

const resolveTone = (status: string): StatusTone => {
  const normalized = status.trim().toLowerCase();
  for (const [tone, keywords] of Object.entries(STATUS_KEYWORDS) as [StatusTone, string[]][]) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return tone;
    }
  }
  return 'inactive';
};

const titleCase = (text: string) =>
  text
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

interface StatusBadgeProps {
  status?: string | null;
  label?: string;
  className?: string;
}

const StatusBadge = ({ status, label, className }: StatusBadgeProps) => {
  const raw = status || '';
  const tone = resolveTone(raw);
  const text = label || (raw ? titleCase(raw) : STATUS_TONE_MAP[tone].fallbackText);

  return (
    <Badge variant={STATUS_TONE_MAP[tone].variant} className={className}>
      {text}
    </Badge>
  );
};

export { StatusBadge };
