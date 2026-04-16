import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { KeenIcon } from '@/components';

interface AdminPaginationProps {
  page: number;
  total: number;
  totalPages: number;
  limit: number;
  onPageChange: Function;
  onLimitChange?: Function;
  isLoading?: boolean;
  itemLabel?: string;
}

const pageSizes = ['10', '20', '50', '100'];

const AdminPagination = ({
  page,
  total,
  totalPages,
  limit,
  onPageChange,
  onLimitChange,
  isLoading = false,
  itemLabel = 'items'
}: AdminPaginationProps) => {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        Showing {from} to {to} of {total} {itemLabel}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onLimitChange && (
          <Select value={String(limit)} onValueChange={(value) => onLimitChange(Number(value))}>
            <SelectTrigger size="sm" className="w-[110px]">
              <SelectValue placeholder="Page size" />
            </SelectTrigger>
            <SelectContent>
              {pageSizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || isLoading}
          onClick={() => onPageChange(page - 1)}
        >
          <KeenIcon icon="arrow-left" className="me-1" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {Math.max(totalPages, 1)}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages || isLoading}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <KeenIcon icon="arrow-right" className="ms-1" />
        </Button>
      </div>
    </div>
  );
};

export { AdminPagination };
