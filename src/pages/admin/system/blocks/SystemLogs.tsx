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

const SystemLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
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
    level: levelFilter !== 'all' ? levelFilter as 'error' | 'warning' | 'info' | 'success' : undefined,
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
  }, [searchTerm, levelFilter]);

  const getLevelBadge = (level: string) => {
    const levelConfig = {
      error: { variant: 'destructive', className: '', text: 'Error' },
      warning: { variant: 'default', className: 'bg-warning text-white', text: 'Warning' },
      info: { variant: 'default', className: 'bg-info text-white', text: 'Info' },
      success: { variant: 'default', className: 'bg-success text-white', text: 'Success' }
    };

    const config = levelConfig[level as keyof typeof levelConfig] || { variant: 'secondary', className: '', text: level };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      resolved: { variant: 'default', className: 'bg-success text-white', text: 'Resolved' },
      monitoring: { variant: 'default', className: 'bg-warning text-white', text: 'Monitoring' },
      investigating: { variant: 'default', className: 'bg-info text-white', text: 'Investigating' },
      completed: { variant: 'default', className: 'bg-success text-white', text: 'Completed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', className: '', text: status };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
  };

  const getLevelIcon = (level: string) => {
    const iconConfig = {
      error: 'danger',
      warning: 'warning',
      info: 'information',
      success: 'check-circle'
    };

    return iconConfig[level as keyof typeof iconConfig] || 'question';
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <h3 className="card-title">System Logs</h3>
          <p className="text-sm text-gray-600">Monitor API failures, downtime alerts, and system events</p>
        </div>

        <div className="flex items-center gap-3">
          {/* <Button variant="outline" size="sm">
              <KeenIcon icon="file-down" className="me-2" />
              Export Logs
            </Button> */}
          <Button
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <KeenIcon icon="refresh" className="me-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="card-body">
        {/* Error State */}
        {isError && (
          <Alert variant="danger" className="mb-4">
            <div className="flex items-center justify-between">
              <span>
                {error instanceof Error ? error.message : 'Failed to load system logs. Please try again.'}
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
                placeholder="Search logs by service or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
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
            {/* Logs Table */}
            <div className="overflow-x-auto">
              <Table className="min-w-full table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px] sm:w-[140px]">Timestamp</TableHead>
                    <TableHead className="hidden sm:table-cell w-[100px]">Service</TableHead>
                    <TableHead className="hidden md:table-cell w-[80px]">Level</TableHead>
                    <TableHead className="w-[200px] sm:w-[250px]">Message</TableHead>
                    <TableHead className="hidden lg:table-cell w-[100px]">Status</TableHead>
                    <TableHead className="hidden lg:table-cell w-[150px]">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {systemLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <KeenIcon icon="document" className="text-gray-400 text-4xl" />
                          <p className="text-gray-500 font-medium">No logs found</p>
                          <p className="text-sm text-gray-400">
                            {searchTerm || levelFilter !== 'all' 
                              ? 'Try adjusting your filters' 
                              : 'System activity will appear here as events occur'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    systemLogs.map((log) => (
                      <TableRow key={log.id || log.log_id}>
                        <TableCell className="w-[120px] sm:w-[140px]">
                          <div className="text-xs">
                            <div className="font-medium">
                              {log.timestamp ? format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell w-[100px]">
                          <div className="flex items-center gap-2">
                            <KeenIcon icon="setting-2" className="text-gray-500 text-sm" />
                            <span className="text-sm font-medium">{log.service || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell w-[80px]">
                          <div className="flex items-center gap-2">
                            <KeenIcon icon={getLevelIcon(log.level)} className="text-sm" />
                            {getLevelBadge(log.level)}
                          </div>
                        </TableCell>
                        <TableCell className="w-[200px] sm:w-[250px]">
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm" title={log.message}>
                              {log.message}
                            </div>
                            <div className="text-xs text-gray-500 sm:hidden">{log.service || 'N/A'} • {log.level}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell w-[100px]">{getStatusBadge(log.status || 'unknown')}</TableCell>
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

export { SystemLogs };


