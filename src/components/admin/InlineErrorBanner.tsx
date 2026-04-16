import { Alert } from '@/components/alert';
import { Button } from '@/components/ui/button';

interface InlineErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

const InlineErrorBanner = ({ message, onRetry }: InlineErrorBannerProps) => {
  return (
    <Alert variant="danger">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm">{message}</span>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    </Alert>
  );
};

export { InlineErrorBanner };
