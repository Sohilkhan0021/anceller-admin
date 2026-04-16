import { useState, useEffect } from 'react';
import { KeenIcon } from '@/components';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePaymentTransactions } from '@/services';
import { ContentLoader } from '@/components/loaders';
import { format } from 'date-fns';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { EmptyState } from '@/components/admin/EmptyState';
import { InlineErrorBanner } from '@/components/admin/InlineErrorBanner';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { FormField } from '@/components/forms/FormField';

const CustomerPaymentsTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gatewayFilter, setGatewayFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Fetch payment transactions
  const { transactions, pagination, isLoading, isError, error, refetch, isFetching } =
    usePaymentTransactions({
      page: currentPage,
      limit: pageSize,
      status: statusFilter === 'all' ? '' : statusFilter,
      gateway: gatewayFilter === 'all' ? '' : gatewayFilter,
      search: debouncedSearchTerm
    });

  // Reset page when non-search filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, gatewayFilter]);

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

  const getPaymentModeIcon = (paymentMode: string) => {
    const normalized = (paymentMode || '').trim().toLowerCase();
    if (!normalized) return 'money';

    if (
      normalized.includes('credit') ||
      normalized.includes('debit') ||
      normalized.includes('razorpay')
    ) {
      return 'credit-card';
    }

    if (normalized.includes('upi')) return 'smartphone';

    if (
      normalized.includes('net banking') ||
      normalized.includes('net') ||
      normalized.includes('bank')
    ) {
      return 'bank';
    }

    if (normalized.includes('wallet')) return 'wallet';

    if (
      normalized.includes('cod') ||
      normalized.includes('cash') ||
      normalized.includes('pay after service') ||
      normalized.includes('pay after')
    ) {
      return 'money';
    }

    return 'money';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      currencyDisplay: 'symbol' // Ensure ₹ symbol is displayed
    }).format(amount);
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPp');
    } catch {
      return dateString;
    }
  };

  if (isError) {
    return (
      <div className="space-y-6">
        <InlineErrorBanner
          message={error?.message || 'Failed to load payment transactions. Please try again.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Customer Payments</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search Bar */}
            <FormField
              label="Search"
              helperText="Search by transaction ID, user, or gateway transaction ID"
            >
              <div className="relative">
                <KeenIcon
                  icon="magnifier"
                  className="absolute left-3 top-1/2 -translate-y-1/2 transform text-muted-foreground/70"
                />
                <Input
                  type="text"
                  placeholder="Search transactions..."
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
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {/* Gateway Filter */}
            <FormField label="Gateway">
              <Select
                value={gatewayFilter}
                onValueChange={(value) => {
                  setGatewayFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by gateway" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Gateways</SelectItem>
                  <SelectItem value="razorpay">Razorpay</SelectItem>
                  <SelectItem value="Pay After Service">Cash</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {/* <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              onClick={handleExport}
              disabled={exportMutation.isLoading}
            >
              <KeenIcon icon="file-down" className="me-2" />
              {exportMutation.isLoading ? 'Exporting...' : 'Export Data'}
            </Button>
          </div> */}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Payment Transactions {pagination ? `(${pagination.total})` : ''}
          </h3>
        </div>
        <div className="card-body p-0">
          {isLoading && !isFetching ? (
            <div className="p-8">
              <ContentLoader />
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState
              title="No payment transactions found"
              description="Adjust filters and try again."
              icon="cross-circle"
            />
          ) : (
            <>
              <div className="w-full">
                <AdminDataTable className="w-full table-fixed">
                  <TableHeader>
                    <TableRow>
                      {/* <TableHead className="hidden sm:table-cell w-[15%]">Transaction ID</TableHead> */}
                      <TableHead className="w-[25%] px-4">Transaction</TableHead>
                      <TableHead className="hidden md:table-cell w-[10%] text-center px-4">
                        Amount
                      </TableHead>
                      <TableHead className="hidden lg:table-cell w-[12%] px-4">
                        Payment Mode
                      </TableHead>
                      <TableHead className="hidden sm:table-cell w-[10%] px-4">Status</TableHead>
                      <TableHead className="hidden md:table-cell w-[13%] px-4">Date</TableHead>
                      <TableHead className="hidden lg:table-cell w-[15%] px-4">
                        Gateway Transaction ID
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.transaction_id}>
                        {/* <TableCell className="hidden sm:table-cell font-medium break-all whitespace-normal pr-4">
                          {transaction.transaction_id}
                        </TableCell> */}
                        <TableCell className="px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                              <KeenIcon icon="user" className="text-primary text-sm" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium break-words whitespace-normal leading-tight">
                                {transaction.user.name}
                              </div>
                              <div className="mt-1 hidden break-all whitespace-normal text-sm leading-tight text-muted-foreground sm:block">
                                {transaction.transaction_id}
                              </div>
                              <div className="text-xs text-muted-foreground sm:hidden">
                                {formatCurrency(transaction.amount)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell px-4">
                          <div className="text-center">
                            <div className="font-semibold">
                              {formatCurrency(transaction.amount)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell px-4">
                          <div className="flex items-center gap-2 whitespace-normal break-words leading-tight">
                            <KeenIcon
                              icon={getPaymentModeIcon(
                                transaction.payment_method_display || transaction.payment_mode
                              )}
                              className="text-sm text-muted-foreground flex-shrink-0"
                            />
                            <span className="text-sm">
                              {transaction.payment_method_display || transaction.payment_mode}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell px-4">
                          <StatusBadge status={transaction.status} />
                        </TableCell>
                        <TableCell className="hidden md:table-cell px-4">
                          {/* <div className="text-sm whitespace-normal leading-tight"> */}
                          <div className="text-sm whitespace-nowrap">
                            {formatDateTime(transaction.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell px-4">
                          <div className="font-mono text-sm break-all whitespace-normal leading-tight">
                            {transaction.gateway_transaction_id || 'N/A'}
                          </div>
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
                  itemLabel="transactions"
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { CustomerPaymentsTab };
