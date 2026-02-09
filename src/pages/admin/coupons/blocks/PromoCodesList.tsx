import { useState, useEffect, useCallback } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCoupons, useCouponStats } from '@/services';
import { toast } from 'sonner';
import { ICoupon } from '@/services/coupon.types';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';

interface IPromoCodesListProps {
  onEditPromo: (promo: any) => void;
  onDeletePromo: (promoId: string) => void;
}

const PromoCodesList = ({ onEditPromo, onDeletePromo }: IPromoCodesListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch coupons with filters
  const {
    coupons,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useCoupons({
    page: currentPage,
    limit: pageSize,
    status: statusFilter === 'all' ? '' : statusFilter,
    search: debouncedSearch,
  });

  // Fetch coupon statistics
  const { stats, isLoading: isStatsLoading, isError: isStatsError, error: statsError, refetch: refetchStats } = useCouponStats();

  // Handle filter changes
  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  const handleEditPromoClick = (promoId: string) => {
    const promo = coupons.find(p => p.id === promoId);
    if (promo) {
      onEditPromo(promo);
    }
  };

  const handleDeactivatePromo = async (promoId: string) => {
    try {
      const { updateCoupon } = await import('@/services/coupon.service');
      await updateCoupon(promoId, { is_active: false });
      toast.success('Promo code deactivated successfully');
      // Refetch after deactivation
      refetch();
    } catch (error: any) {
      console.error('Failed to deactivate promo:', error);
      toast.error(error?.message || 'Failed to deactivate promo code');
    }
  };

  const handleDeletePromo = (promoId: string) => {
    onDeletePromo(promoId);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default', className: 'bg-success text-white', text: 'Active' },
      expired: { variant: 'destructive', className: '', text: 'Expired' },
      upcoming: { variant: 'default', className: 'bg-info text-white', text: 'Upcoming' },
      deactivated: { variant: 'secondary', className: '', text: 'Deactivated' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'outline', className: '', text: status };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
  };

  const getTypeDisplay = (type?: string, value?: number | string) => {
    if (!type || value === undefined || value === null) return 'N/A';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'N/A';
    // Check if type is percentage (case-insensitive)
    const isPercentage = type?.toLowerCase() === 'percentage' || type === 'PERCENTAGE';
    return isPercentage ? `${numValue}%` : `₹${numValue}`;
  };

  const getUsagePercentage = (usageCount?: number, maxUsage?: number) => {
    if (!usageCount || !maxUsage || maxUsage === 0) return 0;
    return Math.round((usageCount / maxUsage) * 100);
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      currencyDisplay: 'symbol', // Ensure ₹ symbol is displayed
    }).format(amount);
  };

  // Calculate metrics from API data
  const totalRedemptions = coupons.reduce((sum, promo) => sum + (promo.redemptions || promo.usageCount || 0), 0);
  const totalRevenueImpact = coupons.reduce((sum, promo) => sum + (promo.revenueImpact || 0), 0);
  const activeCouponsCount = coupons.filter(promo => promo.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Success Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg text-primary bg-primary-light">
                <KeenIcon icon="gift" className="text-xl" />
              </div>
            </div>
            <div className="mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isStatsLoading ? '...' : (stats?.total_redemptions || 0)}
              </h3>
              <p className="text-sm text-gray-600">Total Redemptions</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg text-success bg-success-light">
                <KeenIcon icon="dollar" className="text-xl" />
              </div>
            </div>
            <div className="mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isStatsLoading ? '...' : formatCurrency(stats?.revenue_impact || 0)}
              </h3>
              <p className="text-sm text-gray-600">Revenue Impact</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg text-info bg-info-light">
                <KeenIcon icon="chart-simple" className="text-xl" />
              </div>
              {isStatsError && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetchStats()}
                  title="Retry loading stats"
                >
                  <KeenIcon icon="refresh" className="text-sm" />
                </Button>
              )}
            </div>
            <div className="mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isStatsLoading ? '...' : (stats?.active_coupons ?? 0)}
              </h3>
              <p className="text-sm text-gray-600">Active Promo Codes</p>
              {isStatsError && (
                <p className="text-xs text-red-500 mt-1">
                  {statsError?.message || 'Failed to load stats'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Promo Codes {pagination ? `(${pagination.total})` : `(${coupons.length})`}
          </h3>
        </div>
        <div className="card-body">
          {/* Error State */}
          {isError && (
            <Alert variant="danger" className="mb-4">
              <div className="flex items-center justify-between">
                <span>
                  {error?.message || 'Failed to load coupons. Please try again.'}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-2">
              <div className="relative">
                <KeenIcon icon="magnifier" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by promo code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="deactivated">Deactivated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Promo Codes Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Promo Codes List</h3>
        </div>
        <div className="card-body p-0">
          {isLoading && !isFetching ? (
            <div className="p-8">
              <ContentLoader />
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-8 text-center">
              <KeenIcon icon="gift" className="text-gray-400 text-4xl mx-auto mb-4" />
              <p className="text-gray-600">No coupons found</p>
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead className="hidden sm:table-cell">Type</TableHead>
                      <TableHead className="hidden md:table-cell">Value</TableHead>
                      <TableHead className="hidden lg:table-cell">Expiry</TableHead>
                      <TableHead className="hidden sm:table-cell">Usage</TableHead>
                      <TableHead className="hidden md:table-cell">Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Revenue Impact</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((promo) => (
                      <TableRow key={promo.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                              <KeenIcon icon="gift" className="text-primary text-sm" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate">{promo.code || 'N/A'}</div>
                              <div className="text-sm text-gray-500 hidden sm:block">
                                Created {promo.createdAt || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500 sm:hidden">
                                {getTypeDisplay(promo.type, promo.value)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="badge-outline">
                            {promo.type === 'percentage' ? 'Percentage' : 'Flat Amount'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-center">
                            <div className="font-semibold">{getTypeDisplay(promo.type, promo.value)}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{promo.expiry || 'N/A'}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="text-center">
                            <div className="font-semibold">
                              {promo.usageCount || promo.usage_count || promo.redemptions || 0}
                              {promo.maxUsage || promo.max_usage ? `/${promo.maxUsage || promo.max_usage}` : ' (Unlimited)'}
                            </div>
                            {(promo.maxUsage || promo.max_usage) && (
                              <>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                  <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${getUsagePercentage(promo.usageCount || promo.usage_count || promo.redemptions, promo.maxUsage || promo.max_usage)}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {getUsagePercentage(promo.usageCount || promo.usage_count || promo.redemptions, promo.maxUsage || promo.max_usage)}% used
                                </div>
                              </>
                            )}
                            {!promo.maxUsage && !promo.max_usage && (
                              <div className="text-xs text-gray-500 mt-1">
                                No limit
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {getStatusBadge(promo.status || 'deactivated')}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="text-center">
                            <div className="font-semibold text-success">
                              {formatCurrency(promo.revenueImpact)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {promo.redemptions || promo.usageCount || 0} redemptions
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1 sm:hidden">
                              <div className="md:hidden">
                                {getStatusBadge(promo.status || 'deactivated')}
                              </div>
                              <div className="lg:hidden">
                                <div className="text-xs text-gray-500">
                                  {formatCurrency(promo.revenueImpact)}
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <KeenIcon icon="dots-vertical" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditPromoClick(promo.id)}>
                                  <KeenIcon icon="notepad-edit" className="me-2" />
                                  Edit
                                </DropdownMenuItem>
                                {promo.status === 'active' && (
                                  <DropdownMenuItem
                                    onClick={() => handleDeactivatePromo(promo.id)}
                                    className="text-warning"
                                  >
                                    <KeenIcon icon="time" className="me-2" />
                                    Deactivate
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleDeletePromo(promo.id)}
                                  className="text-danger"
                                >
                                  <KeenIcon icon="trash" className="me-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="card-footer">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} coupons
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(pagination.page - 1)}
                        disabled={!pagination.hasPreviousPage || isFetching}
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
                        onClick={() => setCurrentPage(pagination.page + 1)}
                        disabled={!pagination.hasNextPage || isFetching}
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

export { PromoCodesList };
