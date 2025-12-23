import { useState, useEffect } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSystemLogs } from '@/services';
import { format } from 'date-fns';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';
import type { ISystemLog } from '@/services/settings.types';

const ActivityLog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const { 
    data: logsData, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useSystemLogs({
    page: currentPage,
    limit: pageSize,
    search: searchTerm || undefined
  });

  const systemLogs = logsData?.logs || [];
  const pagination = logsData?.pagination;

  // Refetch when filters change (debounced for search)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        refetch();
      } else {
        setCurrentPage(1);
      }
    }, searchTerm ? 500 : 0);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, moduleFilter]);

  const getModuleBadge = (module: string) => {
    const moduleConfig: Record<string, { variant: string; text: string }> = {
      'Payments': { variant: 'success', text: 'Payments' },
      'Payment': { variant: 'success', text: 'Payments' },
      'Bookings': { variant: 'info', text: 'Bookings' },
      'Booking': { variant: 'info', text: 'Bookings' },
      'Users': { variant: 'warning', text: 'Users' },
      'User': { variant: 'warning', text: 'Users' },
      'Providers': { variant: 'primary', text: 'Providers' },
      'Provider': { variant: 'primary', text: 'Providers' },
      'Catalog': { variant: 'secondary', text: 'Catalog' },
      'Service': { variant: 'secondary', text: 'Catalog' },
      'Coupons': { variant: 'warning', text: 'Coupons' },
      'Coupon': { variant: 'warning', text: 'Coupons' },
      'System': { variant: 'destructive', text: 'System' },
      'Roles': { variant: 'primary', text: 'Roles' },
      'Role': { variant: 'primary', text: 'Roles' }
    };
    
    const config = moduleConfig[module] || { variant: 'secondary', text: module };
    return <Badge variant={config.variant as any}>{config.text}</Badge>;
  };

  const getActionIcon = (action: string) => {
    if (!action) return 'information';
    const actionUpper = action.toUpperCase();
    if (actionUpper.includes('CREATE') || actionUpper.includes('APPROVE') || actionUpper.includes('COMPLETE')) {
      return 'check-circle';
    }
    if (actionUpper.includes('DELETE') || actionUpper.includes('CANCEL') || actionUpper.includes('REJECT') || actionUpper.includes('FAIL')) {
      return 'trash';
    }
    if (actionUpper.includes('UPDATE') || actionUpper.includes('MODIFY')) {
      return 'setting-2';
    }
    return 'information';
  };

  // Map module filter names to API entity types
  const moduleToEntityType: Record<string, string> = {
    'Payments': 'Payment',
    'Bookings': 'Booking',
    'Users': 'User',
    'Providers': 'Provider',
    'Catalog': 'Service',
    'Coupons': 'Coupon',
    'System': 'System',
    'Roles': 'Role'
  };

  // Filter logs by module if filter is set
  const filteredLogs = systemLogs.filter((log: ISystemLog) => {
    if (moduleFilter === 'all') return true;
    const entityType = moduleToEntityType[moduleFilter];
    return log.service === moduleFilter || 
           log.entity_type === entityType || 
           log.entity_type === moduleFilter;
  });

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="card-title">Activity Log</h3>
            <p className="text-sm text-gray-600">Track admin actions and system changes</p>
          </div>
          
          <div className="flex gap-3">
            {/* <Button variant="outline" size="sm">
              <KeenIcon icon="file-down" className="me-2" />
              Export Log
            </Button> */}
            {/* <Button 
              size="sm" 
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <KeenIcon icon="refresh" className="me-2" />
              Refresh
            </Button> */}
          </div>
        </div>
      </div>
      
      <div className="card-body">
        {/* Error State */}
        {isError && (
          <Alert variant="danger" className="mb-4">
            <div className="flex items-center justify-between">
              <span>
                {error instanceof Error ? error.message : 'Failed to load activity logs. Please try again.'}
              </span>
              <button
                onClick={() => refetch()}
                className="text-sm underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          </Alert>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <div className="relative">
              <KeenIcon icon="magnifier" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by action, service, or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                <SelectItem value="Payments">Payments</SelectItem>
                <SelectItem value="Bookings">Bookings</SelectItem>
                <SelectItem value="Users">Users</SelectItem>
                <SelectItem value="Providers">Providers</SelectItem>
                <SelectItem value="Catalog">Catalog</SelectItem>
                <SelectItem value="Coupons">Coupons</SelectItem>
                <SelectItem value="System">System</SelectItem>
                <SelectItem value="Roles">Roles</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-8">
            <ContentLoader />
          </div>
        ) : (
          <>
            {/* Activity Logs Table */}
            <div className="overflow-x-auto">
              <Table className="min-w-full table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px] sm:w-[140px]">Timestamp</TableHead>
                    <TableHead className="hidden sm:table-cell w-[120px]">User</TableHead>
                    <TableHead className="hidden md:table-cell w-[120px]">Action</TableHead>
                    <TableHead className="hidden lg:table-cell w-[100px]">Service</TableHead>
                    <TableHead className="w-[200px] sm:w-[250px]">Message</TableHead>
                    <TableHead className="hidden lg:table-cell w-[150px]">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No activity logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log: ISystemLog) => (
                      <TableRow key={log.id || log.log_id}>
                        <TableCell className="w-[120px] sm:w-[140px]">
                          <div className="text-xs">
                            <div className="font-medium">
                              {log.timestamp ? format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell w-[120px]">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-primary-light rounded-full flex items-center justify-center">
                              <KeenIcon icon="user" className="text-primary text-xs" />
                            </div>
                            <span className="text-sm font-medium">
                              {log.user?.name || log.user?.email || 'System'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell w-[120px]">
                          <div className="flex items-center gap-2">
                            <KeenIcon icon={getActionIcon(log.action || log.message)} className="text-sm" />
                            <span className="text-sm">{log.action || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell w-[100px]">
                          {getModuleBadge(log.service || log.entity_type || 'System')}
                        </TableCell>
                        <TableCell className="w-[200px] sm:w-[250px]">
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm" title={log.message}>
                              {log.message}
                            </div>
                            <div className="text-xs text-gray-500 sm:hidden">
                              {log.service || 'System'} • {log.action || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell w-[150px]">
                          <div className="max-w-xs">
                            <div className="truncate text-sm text-gray-600" title={log.details || ''}>
                              {log.details || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} logs
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={pagination.page === 1 || isLoading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                    disabled={pagination.page === pagination.totalPages || isLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export { ActivityLog };


