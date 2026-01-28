import { useState, useEffect } from 'react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCategories } from '@/services';

/**
 * Maps frontend status filter values to backend API accepted values
 * Backend accepts: CANCELED, ACTIVE, UPCOMING, IN_PROGRESS, COMPLETED, RESCHEDULED, FAILED
 */
const mapStatusToBackend = (frontendStatus: string): string => {
  const statusMap: { [key: string]: string } = {
    'accepted': 'ACTIVE',
    'completed': 'COMPLETED',
    'cancelled': 'CANCELED',
    'in-progress': 'IN_PROGRESS',
  };
  
  return statusMap[frontendStatus] || frontendStatus;
};

/**
 * Maps backend API status values back to frontend filter values
 * Used when initializing filters from API response or URL params
 */
const mapStatusToFrontend = (backendStatus: string): string => {
  const reverseStatusMap: { [key: string]: string } = {
    'ACTIVE': 'accepted',
    'COMPLETED': 'completed',
    'CANCELED': 'cancelled',
    'IN_PROGRESS': 'in-progress',
  };
  
  return reverseStatusMap[backendStatus] || backendStatus;
};

/**
 * Maps frontend payment status filter values to backend API accepted values
 * Backend accepts: PENDING, SUCCESS, FAILED, REFUNDED, PARTIALLY_REFUNDED, CANCELLED
 */
const mapPaymentStatusToBackend = (frontendPaymentStatus: string): string => {
  const paymentStatusMap: { [key: string]: string } = {
    'pending': 'PENDING',
    'paid': 'SUCCESS',
    'failed': 'FAILED',
    'refunded': 'REFUNDED',
    'partially-paid': 'PARTIALLY_REFUNDED',
  };
  
  return paymentStatusMap[frontendPaymentStatus] || frontendPaymentStatus;
};

/**
 * Maps backend API payment status values back to frontend filter values
 * Used when initializing filters from API response or URL params
 */
const mapPaymentStatusToFrontend = (backendPaymentStatus: string): string => {
  const reversePaymentStatusMap: { [key: string]: string } = {
    'PENDING': 'pending',
    'SUCCESS': 'paid',
    'FAILED': 'failed',
    'REFUNDED': 'refunded',
    'PARTIALLY_REFUNDED': 'partially-paid',
    'CANCELLED': 'cancelled', // Backend has CANCELLED but frontend doesn't have this option
  };
  
  return reversePaymentStatusMap[backendPaymentStatus] || backendPaymentStatus;
};

interface IBookingManagementHeaderProps {
  onAddBooking?: () => void;
  onFiltersChange?: (filters: {
    search: string;
    status: string;
    payment_status: string;
    start_date: string;
    end_date: string;
    category_id?: string;
  }) => void;
  initialFilters?: {
    search: string;
    status: string;
    payment_status: string;
    start_date: string;
    end_date: string;
    category_id?: string;
  };
}

const BookingManagementHeader = ({
  onAddBooking,
  onFiltersChange,
  initialFilters
}: IBookingManagementHeaderProps) => {
  // Map backend status value to frontend value if initialFilters contains backend value
  const initialStatus = initialFilters?.status 
    ? (initialFilters.status === 'all' || initialFilters.status === '' 
        ? 'all' 
        : mapStatusToFrontend(initialFilters.status))
    : 'all';

  // Map backend payment status value to frontend value if initialFilters contains backend value
  const initialPaymentStatus = initialFilters?.payment_status 
    ? (initialFilters.payment_status === 'all' || initialFilters.payment_status === '' 
        ? 'all' 
        : mapPaymentStatusToFrontend(initialFilters.payment_status))
    : 'all';

  const [searchTerm, setSearchTerm] = useState(initialFilters?.search || '');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(initialPaymentStatus);
  const [categoryFilter, setCategoryFilter] = useState(initialFilters?.category_id || 'all');

  // Fetch categories from API
  const { categories, isLoading: isLoadingCategories } = useCategories({
    page: 1,
    limit: 100, // Get all categories for filter
    status: 'active'
  });

  // Initialize date range from initial filters
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (initialFilters?.start_date && initialFilters?.end_date) {
      return {
        from: new Date(initialFilters.start_date),
        to: new Date(initialFilters.end_date)
      };
    }
    return undefined;
  });

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFiltersChange) {
        const startDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '';
        const endDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '';

        // Map frontend status value to backend API accepted value
        const backendStatus = statusFilter === 'all' ? '' : mapStatusToBackend(statusFilter);

        // Map frontend payment status value to backend API accepted value
        const backendPaymentStatus = paymentStatusFilter === 'all' ? '' : mapPaymentStatusToBackend(paymentStatusFilter);

        onFiltersChange({
          search: searchTerm,
          status: backendStatus,
          payment_status: backendPaymentStatus,
          start_date: startDate,
          end_date: endDate,
          category_id: categoryFilter === 'all' ? '' : categoryFilter,
        });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, paymentStatusFilter, categoryFilter, dateRange, onFiltersChange]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const handlePaymentStatusChange = (value: string) => {
    setPaymentStatusFilter(value);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const handleClearDateRange = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent popover from opening when clicking clear button
    setDateRange(undefined);
  };

  const handleBulkAction = (action: string) => {
    // TODO: Implement bulk actions
    console.log('Bulk action:', action);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex flex-row items-center justify-between w-full gap-4">
          <div className="flex items-center gap-3">
            <KeenIcon icon="calendar-8" className="text-primary text-2xl" />
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Booking Management</h1>
              <p className="text-sm text-gray-600">Monitor and manage all bookings</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="default"
              size="sm"
              onClick={onAddBooking}
              className="w-full sm:w-auto"
            >
              <KeenIcon icon="plus" className="me-2" />
              Add Booking
            </Button>
            {/* <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleBulkAction('cancel')}
              className="w-full sm:w-auto"
            >
              <KeenIcon icon="cross-circle" className="me-2" />
              Cancel Selected
            </Button> */}
            {/* <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleBulkAction('export')}
              className="w-full sm:w-auto"
            >
              <KeenIcon icon="file-down" className="me-2" />
              Export Data
            </Button> */}
          </div>
        </div>
      </div>

      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search Bar */}
          <div className="lg:col-span-2">
            <div className="relative">
              <KeenIcon icon="magnifier" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by booking ID, user, or provider..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {/* <SelectItem value="pending">Pending</SelectItem> */}
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <Select value={paymentStatusFilter} onValueChange={handlePaymentStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="partially-paid">Partially Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div>
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
              disabled={isLoadingCategories}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingCategories ? "Loading..." : "Filter by category"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id || category.public_id || category.category_id || ''} value={category.id || category.public_id || category.category_id || ''}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="mt-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
            <div className="relative">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[300px] justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground",
                      dateRange && "pr-8" // Add padding on right when date is selected to make room for clear button
                    )}
                  >
                    <KeenIcon icon="calendar" className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              {dateRange && (
                <button
                  type="button"
                  onClick={handleClearDateRange}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition-colors"
                  aria-label="Clear date range"
                >
                  <KeenIcon icon="cross" className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { BookingManagementHeader };


