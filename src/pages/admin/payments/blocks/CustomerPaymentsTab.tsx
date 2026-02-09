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
import { usePaymentTransactions, useExportPaymentData } from '@/services';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';
import { format } from 'date-fns';
import { toast } from 'sonner';

const CustomerPaymentsTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gatewayFilter, setGatewayFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Fetch payment transactions
  const {
    transactions,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = usePaymentTransactions({
    page: currentPage,
    limit: pageSize,
    status: statusFilter === 'all' ? '' : statusFilter,
    gateway: gatewayFilter === 'all' ? '' : gatewayFilter,
    search: searchTerm,
  });

  const exportMutation = useExportPaymentData();

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, gatewayFilter, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleExport = async () => {
    try {
      const data = await exportMutation.mutateAsync({
        status: statusFilter === 'all' ? '' : statusFilter,
      });

      // Convert to CSV
      if (data && data.length > 0) {
        const headers = Object.keys(data[0]);
        const csvContent = [
          headers.join(','),
          ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Payment data exported successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to export payment data');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: string; className: string; text: string }> = {
      SUCCESS: { variant: 'default', className: 'bg-success text-white', text: 'Success' },
      PENDING: { variant: 'default', className: 'bg-warning text-white', text: 'Pending' },
      FAILED: { variant: 'destructive', className: '', text: 'Failed' },
      REFUNDED: { variant: 'secondary', className: '', text: 'Refunded' },
      PARTIALLY_REFUNDED: { variant: 'secondary', className: '', text: 'Partially Refunded' },
      success: { variant: 'default', className: 'bg-success text-white', text: 'Success' },
      pending: { variant: 'default', className: 'bg-warning text-white', text: 'Pending' },
      failed: { variant: 'destructive', className: '', text: 'Failed' },
      cod: { variant: 'secondary', className: '', text: 'COD' }
    };

    const config = statusConfig[status] || { variant: 'outline', className: '', text: status };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
  };

  const getPaymentModeIcon = (paymentMode: string) => {
    const iconMap: Record<string, string> = {
      'Credit Card': 'credit-card',
      'Debit Card': 'credit-card',
      'UPI': 'smartphone',
      'Net Banking': 'bank',
      'Wallet': 'wallet',
      'COD': 'money',
      'razorpay': 'credit-card',
      'cash': 'money'
    };

    return iconMap[paymentMode] || 'money';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      currencyDisplay: 'symbol', // Ensure ₹ symbol is displayed
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
        <Alert variant="danger">
          <div className="flex items-center justify-between">
            <span>
              {error?.message || 'Failed to load payment transactions. Please try again.'}
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
      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Customer Payments</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-2">
              <div className="relative">
                <KeenIcon icon="magnifier" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by transaction ID, user, or gateway transaction ID..."
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
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Gateway Filter */}
            <div>
              <Select value={gatewayFilter} onValueChange={(value) => {
                setGatewayFilter(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by gateway" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Gateways</SelectItem>
                  <SelectItem value="razorpay">Razorpay</SelectItem>
                  <SelectItem value="Pay After Service">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <div className="p-8 text-center">
              <KeenIcon icon="cross-circle" className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No payment transactions found</p>
            </div>
          ) : (
            <>
              <div className="w-full">
                <Table className="w-full table-fixed" containerClassName="!overflow-x-hidden">
                  <TableHeader>
                    <TableRow>
                      {/* <TableHead className="hidden sm:table-cell w-[15%]">Transaction ID</TableHead> */}
                      <TableHead className="w-[25%] px-4">Transaction</TableHead>
                      <TableHead className="hidden md:table-cell w-[10%] text-center px-4">Amount</TableHead>
                      <TableHead className="hidden lg:table-cell w-[12%] px-4">Payment Mode</TableHead>
                      <TableHead className="hidden sm:table-cell w-[10%] px-4">Status</TableHead>
                      <TableHead className="hidden md:table-cell w-[13%] px-4">Date</TableHead>
                      <TableHead className="hidden lg:table-cell w-[15%] px-4">Gateway Transaction ID</TableHead>
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
                              <div className="text-sm text-gray-500 hidden sm:block break-all whitespace-normal leading-tight mt-1">
                                {transaction.transaction_id}
                              </div>
                              <div className="text-xs text-gray-500 sm:hidden">{formatCurrency(transaction.amount)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell px-4">
                          <div className="text-center">
                            <div className="font-semibold">{formatCurrency(transaction.amount)}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell px-4">
                          <div className="flex items-center gap-2 whitespace-normal break-words leading-tight">
                            <KeenIcon icon={getPaymentModeIcon(transaction.payment_method_display || transaction.payment_mode)} className="text-gray-500 text-sm flex-shrink-0" />
                            <span className="text-sm">{transaction.payment_method_display || transaction.payment_mode}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell px-4">{getStatusBadge(transaction.status)}</TableCell>
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
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="card-footer">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
                    <div className="text-sm text-gray-600">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} transactions
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

export { CustomerPaymentsTab };


