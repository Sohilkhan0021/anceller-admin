import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePayouts, usePayoutStats } from '@/services';
import { ContentLoader } from '@/components/loaders';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { EmptyState } from '@/components/admin/EmptyState';
import { InlineErrorBanner } from '@/components/admin/InlineErrorBanner';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { FormField } from '@/components/forms/FormField';
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog';

const ProviderPayoutsTab = () => {
  const [searchParams] = useSearchParams();
  const statusFromUrl = searchParams.get('status') || 'all';

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(statusFromUrl);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [confirmBulkOpen, setConfirmBulkOpen] = useState(false);

  // Update filter when URL param changes
  useEffect(() => {
    const status = searchParams.get('status');
    if (status) {
      setStatusFilter(status);
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Reset pagination when changing status filter
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Fetch payouts
  const { payouts, pagination, isLoading, isError, error, refetch, isFetching } = usePayouts({
    page: currentPage,
    limit: pageSize,
    status: statusFilter === 'all' ? '' : statusFilter,
    search: debouncedSearchTerm
  });

  // Fetch payout stats
  const { stats: payoutStats, isLoading: isLoadingStats } = usePayoutStats();

  // Debounce search (avoid firing API requests on every keystroke)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      currencyDisplay: 'symbol' // Ensure ₹ symbol is displayed
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
        <InlineErrorBanner
          message={error?.message || 'Failed to load payouts. Please try again.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg text-warning bg-warning-light">
                <KeenIcon icon="time" className="text-xl" />
              </div>
              <div className="text-sm font-medium text-warning">Pending</div>
            </div>
            <div className="mb-2">
              <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                {isLoadingStats ? '...' : formatCurrency(payoutStats?.pending_amount || 0)}
              </h3>
              <p className="text-sm text-muted-foreground">Total Pending Payouts</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg text-success bg-success-light">
                <KeenIcon icon="discount" className="text-xl" />
              </div>
              <div className="text-sm font-medium text-success">Commission</div>
            </div>
            <div className="mb-2">
              <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                {isLoadingStats ? '...' : formatCurrency(payoutStats?.total_commission || 0)}
              </h3>
              <p className="text-sm text-muted-foreground">Total Commission Earned</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg text-primary bg-primary-light">
                <KeenIcon icon="shop" className="text-xl" />
              </div>
              <div className="text-sm font-medium text-primary">Providers</div>
            </div>
            <div className="mb-2">
              <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                {isLoadingStats ? '...' : payoutStats?.total_payouts || 0}
              </h3>
              <p className="text-sm text-muted-foreground">Total Payouts</p>
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Search Bar */}
            <FormField label="Search" helperText="Search by provider name or ID">
              <div className="relative">
                <KeenIcon
                  icon="magnifier"
                  className="absolute left-3 top-1/2 -translate-y-1/2 transform text-muted-foreground/70"
                />
                <Input
                  type="text"
                  placeholder="Search providers..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </FormField>

            {/* Status Filter */}
            <FormField label="Status">
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
            </FormField>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            {/* <Button variant="outline">
              <KeenIcon icon="file-down" className="me-2" />
              Export Data
            </Button> */}
            <Button variant="destructive" onClick={() => setConfirmBulkOpen(true)}>
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
            <EmptyState
              title="No payouts found"
              description="Try a different status filter or search term."
              icon="cross-circle"
            />
          ) : (
            <>
              <div className="w-full overflow-x-auto">
                <AdminDataTable className="w-full table-auto">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Provider</TableHead>
                      <TableHead className="hidden sm:table-cell min-w-[120px]">
                        Total Earnings
                      </TableHead>
                      <TableHead className="hidden md:table-cell min-w-[120px]">
                        Commission
                      </TableHead>
                      <TableHead className="hidden lg:table-cell min-w-[120px]">
                        Net Amount
                      </TableHead>
                      <TableHead className="hidden sm:table-cell min-w-[100px]">Status</TableHead>
                      <TableHead className="hidden md:table-cell min-w-[120px]">
                        Payout Date
                      </TableHead>
                      <TableHead className="hidden lg:table-cell min-w-[120px]">
                        Processed At
                      </TableHead>
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
                              <div className="hidden text-sm text-muted-foreground sm:block">
                                {payout.bank_account} | {payout.ifsc_code}
                              </div>
                              <div className="text-xs text-muted-foreground sm:hidden">
                                {formatCurrency(payout.net_amount)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="text-center">
                            <div className="font-semibold">
                              {formatCurrency(payout.total_earnings)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-center">
                            <div className="font-semibold text-warning">
                              {formatCurrency(payout.commission_deducted)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              (
                              {payout.total_earnings > 0
                                ? (
                                    (payout.commission_deducted / payout.total_earnings) *
                                    100
                                  ).toFixed(1)
                                : 0}
                              %)
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="text-center">
                            <div className="font-semibold text-success">
                              {formatCurrency(payout.net_amount)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <StatusBadge status={payout.status} />
                        </TableCell>
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
                              variant="default"
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
                              variant="secondary"
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
                </AdminDataTable>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <AdminPagination
                  page={pagination.page}
                  total={pagination.total}
                  totalPages={pagination.totalPages}
                  limit={pagination.limit}
                  onPageChange={setCurrentPage}
                  isLoading={isFetching}
                  itemLabel="payouts"
                />
              )}
            </>
          )}
        </div>
      </div>
      <ConfirmActionDialog
        open={confirmBulkOpen}
        title="Run bulk settlement"
        description="This action will start settlement for eligible payouts. Continue?"
        confirmText="Run Settlement"
        danger
        onOpenChange={setConfirmBulkOpen}
        onConfirm={() => {
          setConfirmBulkOpen(false);
          handleBulkSettlement();
        }}
      />
    </div>
  );
};

export { ProviderPayoutsTab };
