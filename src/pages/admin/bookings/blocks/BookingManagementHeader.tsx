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

interface IBookingManagementHeaderProps {
  onAddBooking?: () => void;
  onFiltersChange?: (filters: { 
    search: string; 
    status: string;
    payment_status: string;
    start_date: string;
    end_date: string;
  }) => void;
  initialFilters?: {
    search: string;
    status: string;
    payment_status: string;
    start_date: string;
    end_date: string;
  };
}

const BookingManagementHeader = ({ 
  onAddBooking,
  onFiltersChange,
  initialFilters
}: IBookingManagementHeaderProps) => {
  const [searchTerm, setSearchTerm] = useState(initialFilters?.search || '');
  const [statusFilter, setStatusFilter] = useState(initialFilters?.status || 'all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(initialFilters?.payment_status || 'all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  
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
        
        onFiltersChange({
          search: searchTerm,
          status: statusFilter === 'all' ? '' : statusFilter,
          payment_status: paymentStatusFilter === 'all' ? '' : paymentStatusFilter,
          start_date: startDate,
          end_date: endDate,
        });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, paymentStatusFilter, dateRange, onFiltersChange]);

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

  const handleBulkAction = (action: string) => {
    // TODO: Implement bulk actions
    console.log('Bulk action:', action);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleBulkAction('cancel')}
              className="w-full sm:w-auto"
            >
              <KeenIcon icon="cross-circle" className="me-2" />
              Cancel Selected
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleBulkAction('export')}
              className="w-full sm:w-auto"
            >
              <KeenIcon icon="file-down" className="me-2" />
              Export Data
            </Button>
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
                <SelectItem value="pending">Pending</SelectItem>
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

          {/* Service Type Filter (UI only - not part of API) */}
          <div>
            <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="ac">AC Repair</SelectItem>
                <SelectItem value="carpentry">Carpentry</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="mt-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export { BookingManagementHeader };


