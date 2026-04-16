import { ReactNode } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  extra?: ReactNode;
}

const EmptyState = ({
  title,
  description,
  icon = 'abstract-26',
  ctaLabel,
  onCtaClick,
  extra
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-primary">
        <KeenIcon icon={icon} className="text-xl" />
      </div>
      <h4 className="text-base font-semibold text-foreground">{title}</h4>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {ctaLabel && onCtaClick && (
        <Button onClick={onCtaClick} size="sm">
          {ctaLabel}
        </Button>
      )}
      {extra}
    </div>
  );
};

export { EmptyState };
