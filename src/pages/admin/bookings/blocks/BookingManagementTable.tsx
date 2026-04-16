import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { IBooking, IPaginationMeta } from '@/services/booking.types';
import { useCancelBooking, useDeleteBooking } from '@/services';
import { ContentLoader } from '@/components/loaders';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { EmptyState } from '@/components/admin/EmptyState';
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminDataTable } from '@/components/admin/AdminDataTable';

interface IBookingManagementTableProps {
  bookings: IBooking[];
  pagination: IPaginationMeta | null;
  isLoading?: boolean;
  onEditBooking?: Function;
  onPageChange?: Function;
}

const BookingManagementTable = ({
  bookings,
  pagination,
  isLoading = false,
  onEditBooking,
  onPageChange
}: IBookingManagementTableProps) => {
  const navigate = useNavigate();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  const handleViewDetails = (booking: IBooking) => {
    navigate(`/admin/bookings/${booking.id}`);
  };

  const cancelBookingMutation = useCancelBooking({
    onSuccess: (data) => {
      toast.success(data.message || 'Booking cancelled successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel booking');
    }
  });

  const deleteBookingMutation = useDeleteBooking({
    onSuccess: (data) => {
      toast.success(data.message || 'Booking deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete booking');
    }
  });

  const handleCancelBooking = (bookingId: string) => setConfirmCancelId(bookingId);

  const handleDeleteBooking = (bookingId: string) => setConfirmDeleteId(bookingId);

  const handleReassignProvider = (bookingId: string) => {
    // TODO: Implement reassign provider functionality
    console.log('Reassigning provider for booking:', bookingId);
  };

  const capitalizeFirstLetter = (value: string) => {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      currencyDisplay: 'symbol' // Ensure ₹ symbol is displayed
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
            day: 'numeric'
          });
        }
        return 'N/A';
      }
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
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
      UPI: 'smartphone',
      'Net Banking': 'bank',
      Wallet: 'wallet',
      Cash: 'money'
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
              <span className="text-sm text-muted-foreground">
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
          <EmptyState
            title="No bookings found"
            description="Try adjusting your search or filter criteria."
            icon="calendar-8"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <AdminDataTable className="min-w-full table-fixed">
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
                        <div
                          className="font-medium text-xs max-w-[120px] truncate"
                          title={booking.id}
                        >
                          {booking.id || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="w-[180px] sm:w-[200px]">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                            <KeenIcon icon="user" className="text-primary text-xs" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div
                              className="font-medium truncate text-sm"
                              title={booking.userName || 'N/A'}
                            >
                              {booking.userName || 'N/A'}
                            </div>
                            <div
                              className="text-xs text-muted-foreground hidden sm:block truncate"
                              title={booking.phone || 'N/A'}
                            >
                              {booking.phone || 'N/A'}
                            </div>
                            <div
                              className="text-xs text-muted-foreground sm:hidden truncate max-w-[100px]"
                              title={booking.id || 'N/A'}
                            >
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
                            <div className="font-medium truncate">
                              {booking.providerName || 'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground">Provider</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell w-[100px] px-2">
                        <div className="min-w-0 w-full">
                          <Badge
                            variant="outline"
                            className="badge-outline w-full truncate block"
                            title={booking.service || 'N/A'}
                          >
                            <span className="block truncate">{booking.service || 'N/A'}</span>
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell w-[160px] px-2">
                        <div className="min-w-0 w-full space-y-1">
                          <div
                            className="font-medium text-sm truncate w-full"
                            title={
                              formatDateTime(booking.dateTime) !== 'N/A'
                                ? formatDateTime(booking.dateTime)
                                : booking.dateTime
                            }
                          >
                            {(() => {
                              const dateTimeStr =
                                formatDateTime(booking.dateTime) !== 'Invalid Date'
                                  ? formatDateTime(booking.dateTime)
                                  : booking.dateTime
                                    ? new Date(booking.dateTime).toLocaleDateString()
                                    : 'N/A';
                              return dateTimeStr.length > 12
                                ? dateTimeStr.substring(0, 12) + '...'
                                : dateTimeStr;
                            })()}
                          </div>
                          <div
                            className="text-xs text-muted-foreground truncate w-full"
                            title={booking.address || 'N/A'}
                          >
                            {booking.address || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <StatusBadge status={booking.status} />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="text-center">
                          <div className="font-semibold">{formatCurrency(booking.amount || 0)}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <KeenIcon
                            icon={getPaymentTypeIcon(booking.paymentType)}
                            className="text-muted-foreground text-sm"
                          />
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
                              <StatusBadge status={booking.status} />
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="flex-shrink-0 p-1">
                                <span className="sr-only">Open booking actions</span>
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
                                  <DropdownMenuItem
                                    onClick={() => handleReassignProvider(booking.id)}
                                  >
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
              </AdminDataTable>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && onPageChange && (
              <AdminPagination
                page={pagination.page}
                total={pagination.total}
                totalPages={pagination.totalPages}
                limit={pagination.limit}
                onPageChange={onPageChange}
                isLoading={isLoading}
                itemLabel="bookings"
              />
            )}
          </>
        )}
      </div>
      <ConfirmActionDialog
        open={Boolean(confirmCancelId)}
        title="Cancel booking"
        description="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmText="Cancel Booking"
        danger
        loading={cancelBookingMutation.isLoading}
        onOpenChange={(open: boolean) => !open && setConfirmCancelId(null)}
        onConfirm={() => {
          if (confirmCancelId) {
            cancelBookingMutation.mutate({
              bookingId: confirmCancelId,
              reason: 'Cancelled by admin'
            });
          }
          setConfirmCancelId(null);
        }}
      />
      <ConfirmActionDialog
        open={Boolean(confirmDeleteId)}
        title="Delete booking"
        description="Are you sure you want to delete this booking? This action cannot be undone."
        confirmText="Delete Booking"
        danger
        loading={deleteBookingMutation.isLoading}
        onOpenChange={(open: boolean) => !open && setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) {
            deleteBookingMutation.mutate(confirmDeleteId);
          }
          setConfirmDeleteId(null);
        }}
      />
    </div>
  );
};

export { BookingManagementTable };
