import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { IBooking, IPaginationMeta } from '@/services/booking.types';
import { useCancelBooking, useDeleteBooking } from '@/services';
import { ContentLoader } from '@/components/loaders';

interface IBookingManagementTableProps {
  bookings: IBooking[];
  pagination: IPaginationMeta | null;
  isLoading?: boolean;
  onEditBooking?: (booking: IBooking) => void;
  onPageChange?: (page: number) => void;
}

const BookingManagementTable = ({
  bookings,
  pagination,
  isLoading = false,
  onEditBooking,
  onPageChange
}: IBookingManagementTableProps) => {
  const navigate = useNavigate();
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);

  const handleSelectBooking = (bookingId: string, checked: boolean) => {
    if (checked) {
      setSelectedBookings([...selectedBookings, bookingId]);
    } else {
      setSelectedBookings(selectedBookings.filter(id => id !== bookingId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBookings(bookings.map(booking => booking.id));
    } else {
      setSelectedBookings([]);
    }
  };

  const handleViewDetails = (booking: IBooking) => {
    navigate(`/admin/bookings/${booking.id}`);
  };

  const cancelBookingMutation = useCancelBooking({
    onSuccess: (data) => {
      toast.success(data.message || 'Booking cancelled successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel booking');
    },
  });

  const deleteBookingMutation = useDeleteBooking({
    onSuccess: (data) => {
      toast.success(data.message || 'Booking deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete booking');
    },
  });

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      cancelBookingMutation.mutate({ bookingId, reason: 'Cancelled by admin' });
    }
  };

  const handleDeleteBooking = (bookingId: string) => {
    if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      deleteBookingMutation.mutate(bookingId);
    }
  };

  const handleReassignProvider = (bookingId: string) => {
    // TODO: Implement reassign provider functionality
    console.log('Reassigning provider for booking:', bookingId);
  };

  const handleRefund = (bookingId: string) => {
    // TODO: Implement refund functionality
    console.log('Processing refund for booking:', bookingId);
  };

  const handleManualOverride = (bookingId: string) => {
    // TODO: Implement manual override functionality
    console.log('Manual override for booking:', bookingId);
  };

  const capitalizeFirstLetter = (value: string) => {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  };


  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'default', className: 'bg-warning text-black font-semibold', text: 'Pending' },
      accepted: { variant: 'default', className: 'bg-info text-white font-semibold', text: 'Accepted' },
      completed: { variant: 'default', className: 'bg-success text-white font-semibold', text: 'Completed' },
      cancelled: { variant: 'destructive', className: 'bg-danger text-white font-semibold', text: 'Cancelled' },
      'in-progress': { variant: 'secondary', className: 'bg-primary text-white font-semibold', text: 'In Progress' },
      active: { variant: 'default', className: 'bg-success text-white font-semibold', text: 'Active' }
    };

    const config = statusConfig[status?.toLowerCase() as keyof typeof statusConfig] || { variant: 'secondary', className: 'bg-gray-600 text-white font-semibold', text: capitalizeFirstLetter(status), };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      currencyDisplay: 'symbol', // Ensure ₹ symbol is displayed
    }).format(amount);
  };

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return 'N/A';
    try {
      // Check if it's a date-only string (YYYY-MM-DD format)
      const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
      if (dateOnlyPattern.test(dateTime)) {
        // Format date-only string
        const date = new Date(dateTime + 'T00:00:00'); // Add time to avoid timezone issues
        return date.toLocaleDateString('en-IN', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      }
      
      // Check if it's a date+time string (YYYY-MM-DD HH:mm format)
      const dateTimePattern = /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/;
      const dateTimeMatch = dateTime.match(dateTimePattern);
      if (dateTimeMatch) {
        // Format date+time string - show date and time
        const dateStr = dateTimeMatch[1];
        const timeStr = dateTimeMatch[2];
        const date = new Date(dateStr + 'T' + timeStr + ':00');
        return date.toLocaleDateString('en-IN', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) {
        // Try parsing as date string without time
        const dateOnly = new Date(dateTime.split(' ')[0]);
        if (!isNaN(dateOnly.getTime())) {
          return dateOnly.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
        }
        return 'N/A';
      }
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const getPaymentTypeIcon = (paymentType?: string) => {
    if (!paymentType) return 'money';
    const iconMap = {
      'Credit Card': 'credit-card',
      'Debit Card': 'credit-card',
      'UPI': 'smartphone',
      'Net Banking': 'bank',
      'Wallet': 'wallet',
      'Cash': 'money'
    };

    return iconMap[paymentType as keyof typeof iconMap] || 'money';
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="card-title">
            Bookings {pagination ? `(${pagination.total})` : `(${bookings.length})`}
          </h3>
          {/* {selectedBookings.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedBookings.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => setSelectedBookings([])}
              >
                <KeenIcon icon="cross-circle" className="me-2" />
                Cancel Selected
              </Button>
            </div>
          )} */}
        </div>
      </div>

      <div className="card-body p-0">
        {isLoading ? (
          <div className="p-8">
            <ContentLoader />
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center">
            <KeenIcon icon="calendar-8" className="text-gray-400 text-4xl mx-auto mb-4" />
            <p className="text-gray-600">No bookings found</p>
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="min-w-full table-fixed">
                <TableHeader>
                  <TableRow>
                    {/* <TableHead className="w-12 hidden sm:table-cell"> */}
                    {/* <Checkbox
                        checked={selectedBookings.length === bookings.length && bookings.length > 0}
                        onCheckedChange={handleSelectAll}
                      /> */}
                    {/* </TableHead> */}
                    <TableHead className="hidden sm:table-cell w-[120px]">Booking ID</TableHead>
                    <TableHead className="w-[180px] sm:w-[200px]">Customer</TableHead>
                    <TableHead className="hidden md:table-cell w-[140px]">Provider</TableHead>
                    <TableHead className="hidden lg:table-cell w-[100px]">Service</TableHead>
                    <TableHead className="hidden md:table-cell w-[160px]">Date-Time</TableHead>
                    <TableHead className="hidden sm:table-cell w-[100px]">Status</TableHead>
                    <TableHead className="hidden lg:table-cell w-[100px]">Amount</TableHead>
                    <TableHead className="hidden lg:table-cell w-[120px]">Payment</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      {/* <TableCell className="hidden sm:table-cell"> */}
                      {/* <Checkbox
                          checked={selectedBookings.includes(booking.id)}
                          onCheckedChange={(checked) => handleSelectBooking(booking.id, checked as boolean)}
                        /> */}
                      {/* </TableCell> */}
                      <TableCell className="hidden sm:table-cell">
                        <div className="font-medium text-xs max-w-[120px] truncate" title={booking.id}>
                          {booking.id || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="w-[180px] sm:w-[200px]">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                            <KeenIcon icon="user" className="text-primary text-xs" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate text-sm" title={booking.userName || 'N/A'}>
                              {booking.userName || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 hidden sm:block truncate" title={booking.phone || 'N/A'}>
                              {booking.phone || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 sm:hidden truncate max-w-[100px]" title={booking.id || 'N/A'}>
                              {booking.id ? booking.id.substring(0, 15) + '...' : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-success-light rounded-full flex items-center justify-center flex-shrink-0">
                            <KeenIcon icon="shop" className="text-success text-sm" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{booking.providerName || 'N/A'}</div>
                            <div className="text-sm text-gray-500">Provider</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell w-[100px] px-2">
                        <div className="min-w-0 w-full">
                          <Badge variant="outline" className="badge-outline w-full truncate block" title={booking.service || 'N/A'}>
                            <span className="block truncate">{booking.service || 'N/A'}</span>
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell w-[160px] px-2">
                        <div className="min-w-0 w-full space-y-1">
                          <div className="font-medium text-sm truncate w-full" title={formatDateTime(booking.dateTime) !== 'N/A' ? formatDateTime(booking.dateTime) : booking.dateTime}>
                            {(() => {
                              const dateTimeStr = formatDateTime(booking.dateTime) !== 'Invalid Date' ? formatDateTime(booking.dateTime) : (booking.dateTime ? new Date(booking.dateTime).toLocaleDateString() : 'N/A');
                              return dateTimeStr.length > 12 ? dateTimeStr.substring(0, 12) + '...' : dateTimeStr;
                            })()}
                          </div>
                          <div className="text-xs text-gray-500 truncate w-full" title={booking.address || 'N/A'}>
                            {booking.address || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{getStatusBadge(booking.status)}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="text-center">
                          <div className="font-semibold">{formatCurrency(booking.amount || 0)}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <KeenIcon icon={getPaymentTypeIcon(booking.paymentType)} className="text-gray-500 text-sm" />
                          {/* <span className="text-sm">{booking.paymentType || 'N/A'}</span> */}
                          <span className="text-sm">
                            {booking.paymentType
                              ? capitalizeFirstLetter(booking.paymentType)
                              : 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="w-[80px]">
                        <div className="flex items-center justify-end">
                          <div className="flex flex-col gap-1 sm:hidden mr-1">
                            <div className="md:hidden">
                              <Badge variant="outline" className="badge-outline text-xs px-1 py-0">
                                {booking.service && booking.service.length > 8
                                  ? booking.service.substring(0, 8) + '...'
                                  : booking.service || 'N/A'}
                              </Badge>
                            </div>
                            <div className="sm:hidden">
                              {getStatusBadge(booking.status)}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="flex-shrink-0 p-1">
                                <KeenIcon icon="dots-vertical" className="text-sm" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                                <KeenIcon icon="eye" className="me-2" />
                                View Details
                              </DropdownMenuItem>
                              {onEditBooking && (
                                <DropdownMenuItem onClick={() => onEditBooking(booking)}>
                                  <KeenIcon icon="notepad-edit" className="me-2" />
                                  Edit Booking
                                </DropdownMenuItem>
                              )}
                              {booking.status === 'pending' && (
                                <>
                                  <DropdownMenuItem onClick={() => handleCancelBooking(booking.id)}>
                                    <KeenIcon icon="cross-circle" className="me-2" />
                                    Cancel Booking
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleReassignProvider(booking.id)}>
                                    <KeenIcon icon="refresh" className="me-2" />
                                    Reassign Provider
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleDeleteBooking(booking.id)}
                                className="text-danger"
                                disabled={deleteBookingMutation.isLoading}
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
            {pagination && pagination.totalPages > 1 && onPageChange && (
              <div className="card-footer">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} bookings
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPage = Math.max(1, pagination.page - 1);
                        if (newPage !== pagination.page && newPage >= 1) {
                          onPageChange(newPage);
                        }
                      }}
                      disabled={!pagination.hasPreviousPage || isLoading}
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
                        const newPage = Math.min(pagination.totalPages, pagination.page + 1);
                        if (newPage !== pagination.page && newPage <= pagination.totalPages) {
                          onPageChange(newPage);
                        }
                      }}
                      disabled={!pagination.hasNextPage || isLoading}
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
  );
};

export { BookingManagementTable };


