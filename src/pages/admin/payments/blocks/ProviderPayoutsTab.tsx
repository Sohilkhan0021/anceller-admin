import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { usePayouts, usePayoutStats } from '@/services';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';
import { format } from 'date-fns';
import { toast } from 'sonner';

const ProviderPayoutsTab = () => {
  const [searchParams] = useSearchParams();
  const statusFromUrl = searchParams.get('status') || 'all';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(statusFromUrl);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Update filter when URL param changes
  useEffect(() => {
    const status = searchParams.get('status');
    if (status) {
      setStatusFilter(status);
    }
  }, [searchParams]);

  // Fetch payouts
  const {
    payouts,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = usePayouts({
    page: currentPage,
    limit: pageSize,
    status: statusFilter === 'all' ? '' : statusFilter,
    search: searchTerm,
  });

  // Fetch payout stats
  const { stats: payoutStats, isLoading: isLoadingStats } = usePayoutStats();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleSettleNow = (payoutId: string) => {
    // TODO: Implement manual settlement API
    toast.info('Manual settlement feature coming soon');
    console.log('Settling payout:', payoutId);
  };

  const handleBulkSettlement = () => {
    // TODO: Implement bulk settlement API
    toast.info('Bulk settlement feature coming soon');
    console.log('Processing bulk settlement...');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: string; className: string; text: string }> = {
      PENDING: { variant: 'default', className: 'bg-warning text-white', text: 'Pending' },
      APPROVED: { variant: 'default', className: 'bg-info text-white', text: 'Approved' },
      PROCESSING: { variant: 'default', className: 'bg-info text-white', text: 'Processing' },
      COMPLETED: { variant: 'default', className: 'bg-success text-white', text: 'Completed' },
      FAILED: { variant: 'destructive', className: '', text: 'Failed' },
      CANCELLED: { variant: 'secondary', className: '', text: 'Cancelled' },
      pending: { variant: 'default', className: 'bg-warning text-white', text: 'Pending' },
      completed: { variant: 'default', className: 'bg-success text-white', text: 'Completed' },
      failed: { variant: 'destructive', className: '', text: 'Failed' },
      processing: { variant: 'default', className: 'bg-info text-white', text: 'Processing' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', className: '', text: status };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PP');
    } catch {
      return dateString;
    }
  };

  if (isError) {
    return (
      <div className="space-y-6">
        <Alert variant="danger">
          <div className="flex items-center justify-between">
            <span>
              {error?.message || 'Failed to load payouts. Please try again.'}
            </span>
            <button
              onClick={() => refetch()}
              className="text-sm underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg text-warning bg-warning-light">
                <KeenIcon icon="time" className="text-xl" />
              </div>
              <div className="text-sm font-medium text-warning">
                Pending
              </div>
            </div>
            <div className="mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isLoadingStats ? '...' : formatCurrency(payoutStats?.pending_amount || 0)}
              </h3>
              <p className="text-sm text-gray-600">Total Pending Payouts</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg text-success bg-success-light">
                <KeenIcon icon="discount" className="text-xl" />
              </div>
              <div className="text-sm font-medium text-success">
                Commission
              </div>
            </div>
            <div className="mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isLoadingStats ? '...' : formatCurrency(payoutStats?.total_commission || 0)}
              </h3>
              <p className="text-sm text-gray-600">Total Commission Earned</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg text-primary bg-primary-light">
                <KeenIcon icon="shop" className="text-xl" />
              </div>
              <div className="text-sm font-medium text-primary">
                Providers
              </div>
            </div>
            <div className="mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isLoadingStats ? '...' : payoutStats?.total_payouts || 0}
              </h3>
              <p className="text-sm text-gray-600">Total Payouts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Provider Payouts</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-2">
              <div className="relative">
                <KeenIcon icon="magnifier" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by provider name or ID..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            {/* <Button variant="outline">
              <KeenIcon icon="file-down" className="me-2" />
              Export Data
            </Button> */}
            <Button variant="default" className="bg-success text-white hover:bg-success/90" onClick={handleBulkSettlement}>
              <KeenIcon icon="cheque" className="me-2" />
              Bulk Settlement
            </Button>
          </div>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Provider Payout Details {pagination ? `(${pagination.total})` : ''}
          </h3>
        </div>
        <div className="card-body p-0">
          {isLoading && !isFetching ? (
            <div className="p-8">
              <ContentLoader />
            </div>
          ) : payouts.length === 0 ? (
            <div className="p-8 text-center">
              <KeenIcon icon="cross-circle" className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No payouts found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto w-full">
                <Table className="w-full table-auto">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Provider</TableHead>
                      <TableHead className="hidden sm:table-cell min-w-[120px]">Total Earnings</TableHead>
                      <TableHead className="hidden md:table-cell min-w-[120px]">Commission</TableHead>
                      <TableHead className="hidden lg:table-cell min-w-[120px]">Net Amount</TableHead>
                      <TableHead className="hidden sm:table-cell min-w-[100px]">Status</TableHead>
                      <TableHead className="hidden md:table-cell min-w-[120px]">Payout Date</TableHead>
                      <TableHead className="hidden lg:table-cell min-w-[120px]">Processed At</TableHead>
                      <TableHead className="min-w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((payout) => (
                      <TableRow key={payout.payout_id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-success-light rounded-full flex items-center justify-center flex-shrink-0">
                              <KeenIcon icon="shop" className="text-success text-sm" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate">{payout.provider.name}</div>
                              <div className="text-sm text-gray-500 hidden sm:block">{payout.bank_account} | {payout.ifsc_code}</div>
                              <div className="text-xs text-gray-500 sm:hidden">{formatCurrency(payout.net_amount)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="text-center">
                            <div className="font-semibold">{formatCurrency(payout.total_earnings)}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-center">
                            <div className="font-semibold text-warning">{formatCurrency(payout.commission_deducted)}</div>
                            <div className="text-xs text-gray-500">
                              ({payout.total_earnings > 0 ? ((payout.commission_deducted / payout.total_earnings) * 100).toFixed(1) : 0}%)
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="text-center">
                            <div className="font-semibold text-success">{formatCurrency(payout.net_amount)}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{getStatusBadge(payout.status)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="min-w-[100px] whitespace-nowrap text-sm">
                            {formatDate(payout.payout_date)}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="min-w-[100px] whitespace-nowrap text-sm">
                            {formatDate(payout.processed_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {payout.status === 'PENDING' && (
                            <Button 
                              variant="default" className="bg-success text-white hover:bg-success/90" 
                              size="sm"
                              onClick={() => handleSettleNow(payout.payout_id)}
                            >
                              <KeenIcon icon="double-check-circle" className="me-1" />
                              <span className="hidden sm:inline">Settle Now</span>
                              <span className="sm:hidden">Settle</span>
                            </Button>
                          )}
                          {payout.status === 'FAILED' && (
                            <Button 
                              variant="outline" className="border-warning text-warning hover:bg-warning hover:text-white" 
                              size="sm"
                              onClick={() => handleSettleNow(payout.payout_id)}
                            >
                              <KeenIcon icon="arrows-circle" className="me-1" />
                              <span className="hidden sm:inline">Retry</span>
                              <span className="sm:hidden">Retry</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="card-footer">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} payouts
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (pagination.page > 1 && !isFetching) {
                            setCurrentPage(pagination.page - 1);
                          }
                        }}
                        disabled={pagination.page <= 1 || isFetching}
                      >
                        <KeenIcon icon="arrow-left" className="me-1" />
                        Previous
                      </Button>
                      <div className="text-sm text-gray-600">
                        Page {pagination.page} of {pagination.totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (pagination.page < pagination.totalPages && !isFetching) {
                            setCurrentPage(pagination.page + 1);
                          }
                        }}
                        disabled={pagination.page >= pagination.totalPages || isFetching}
                      >
                        Next
                        <KeenIcon icon="arrow-right" className="ms-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { ProviderPayoutsTab };


