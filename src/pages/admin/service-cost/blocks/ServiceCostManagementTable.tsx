import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { IServiceCostConfig } from '@/services/serviceCost.service';
import { ContentLoader } from '@/components/loaders';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { EmptyState } from '@/components/admin/EmptyState';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';

interface IServiceCostManagementTableProps {
  configs: IServiceCostConfig[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null;
  isLoading?: boolean;
  onEdit: Function;
  onDelete: Function;
  onToggleActive?: Function;
  onPageChange: Function;
  onFilterChange: Function;
  currentFilter?: boolean | undefined;
}

const ServiceCostManagementTable = ({
  configs,
  pagination,
  isLoading = false,
  onEdit,
  onDelete,
  onToggleActive,
  onPageChange,
  onFilterChange,
  currentFilter
}: IServiceCostManagementTableProps) => {
  const formatDate = (date: string | null) => {
    if (!date) return 'No expiry';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return <ContentLoader />;
  }

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h2 className="text-lg font-semibold">Service Cost Configurations</h2>
        <Select
          value={currentFilter === undefined ? 'all' : currentFilter ? 'active' : 'inactive'}
          onValueChange={(value) => {
            if (value === 'all') onFilterChange(undefined);
            else if (value === 'active') onFilterChange(true);
            else onFilterChange(false);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Configurations</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="card-body p-0">
        <AdminDataTable>
          <TableHeader>
            <TableRow>
              <TableHead>Service Cost</TableHead>
              <TableHead>Free Threshold</TableHead>
              <TableHead>Tax Rates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valid Period</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {configs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <EmptyState
                    title="No service cost configurations"
                    description="No service cost configurations found for the selected filter."
                    icon="setting-2"
                  />
                </TableCell>
              </TableRow>
            ) : (
              configs.map((config) => (
                <TableRow key={config.config_id}>
                  <TableCell>
                    <div className="font-medium">₹{config.service_cost_amount}</div>
                    <div className="text-sm text-muted-foreground">Service fee</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">₹{config.free_service_threshold}</div>
                    <div className="text-sm text-muted-foreground">Free above this</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Service Tax: {config.service_cost_tax_rate}%</div>
                      <div>Order Tax: {config.order_tax_rate}%</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={config.is_active ? 'active' : 'inactive'} />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>From: {formatDate(config.valid_from)}</div>
                      <div>Until: {formatDate(config.valid_until)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <span className="sr-only">Open service cost actions</span>
                          <KeenIcon icon="dots-vertical" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(config)}>
                          <KeenIcon icon="pencil" className="me-2" />
                          Edit
                        </DropdownMenuItem>
                        {onToggleActive && (
                          <DropdownMenuItem
                            onClick={() => onToggleActive(config)}
                            className={config.is_active ? 'text-warning' : 'text-success'}
                          >
                            <KeenIcon
                              icon={config.is_active ? 'cross-circle' : 'check-circle'}
                              className="me-2"
                            />
                            {config.is_active ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => onDelete(config.config_id)}
                          className="text-danger"
                        >
                          <KeenIcon icon="trash" className="me-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </AdminDataTable>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <AdminPagination
          page={pagination.page}
          total={pagination.total}
          totalPages={pagination.totalPages}
          limit={pagination.limit}
          onPageChange={onPageChange}
          isLoading={isLoading}
          itemLabel="configurations"
        />
      )}
    </div>
  );
};

export { ServiceCostManagementTable };
