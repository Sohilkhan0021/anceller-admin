import { useState } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IServiceCostConfig } from '@/services/serviceCost.service';
import { ContentLoader } from '@/components/loaders';

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
  onEdit: (config: IServiceCostConfig) => void;
  onDelete: (configId: string) => void;
  onToggleActive?: (config: IServiceCostConfig) => void;
  onPageChange: (page: number) => void;
  onFilterChange: (filter: boolean | undefined) => void;
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
        <Table>
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
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No service cost configurations found
                </TableCell>
              </TableRow>
            ) : (
              configs.map((config) => (
                <TableRow key={config.config_id}>
                  <TableCell>
                    <div className="font-medium">₹{config.service_cost_amount}</div>
                    <div className="text-sm text-gray-500">Service fee</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">₹{config.free_service_threshold}</div>
                    <div className="text-sm text-gray-500">Free above this</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Service Tax: {config.service_cost_tax_rate}%</div>
                      <div>Order Tax: {config.order_tax_rate}%</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={config.is_active ? 'default' : 'secondary'}
                      className={config.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}
                    >
                      {config.is_active ? 'Active' : 'Inactive'}
                    </Badge>
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
                            <KeenIcon icon={config.is_active ? 'cross-circle' : 'check-circle'} className="me-2" />
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
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="card-footer flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} configurations
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPreviousPage}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export { ServiceCostManagementTable };
