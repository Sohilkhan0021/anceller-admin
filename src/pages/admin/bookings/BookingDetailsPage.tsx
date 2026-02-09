import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/container';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useBookingDetail, useCancelBooking } from '@/services';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';
import { format } from 'date-fns';
import { useState } from 'react';

const BookingDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  
  const { booking, isLoading, isError, error, refetch } = useBookingDetail(id || null);
  
  const cancelBookingMutation = useCancelBooking({
    onSuccess: (data) => {
      toast.success(data.message || 'Booking cancelled successfully');
      setCancelDialogOpen(false);
      setCancelReason('');
      refetch();
      navigate('/admin/bookings');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel booking');
    },
  });

  const handleCancelBooking = () => {
    if (!id) return;
    cancelBookingMutation.mutate({ 
      bookingId: id, 
      reason: cancelReason || 'Cancelled by admin' 
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: string; className: string; text: string }> = {
      completed: { variant: 'success', className: 'bg-success text-white font-semibold', text: 'Completed' },
      pending: { variant: 'warning', className: 'bg-warning text-black font-semibold', text: 'Pending' },
      cancelled: { variant: 'destructive', className: 'bg-danger text-white font-semibold', text: 'Cancelled' },
      'in-progress': { variant: 'info', className: 'bg-primary text-white font-semibold', text: 'In Progress' },
      accepted: { variant: 'secondary', className: 'bg-info text-white font-semibold', text: 'Accepted' },
      CONFIRMED: { variant: 'success', className: 'bg-success text-white font-semibold', text: 'Confirmed' },
      PENDING: { variant: 'warning', className: 'bg-warning text-black font-semibold', text: 'Pending' },
      CANCELLED: { variant: 'destructive', className: 'bg-danger text-white font-semibold', text: 'Cancelled' },
      COMPLETED: { variant: 'success', className: 'bg-success text-white font-semibold', text: 'Completed' },
      active: { variant: 'success', className: 'bg-success text-white font-semibold', text: 'Active' },
    };
    
    const normalizedStatus = status?.toLowerCase();
    const config = statusConfig[normalizedStatus] || statusConfig[status] || { variant: 'secondary', className: 'bg-gray-600 text-white font-semibold', text: status };
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

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPp');
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center h-64">
          <ContentLoader />
        </div>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <Alert variant="danger">
          <div className="flex items-center justify-between">
            <span>
              {error?.message || 'Failed to load booking details. Please try again.'}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/bookings')}>
                Back to Bookings
              </Button>
            </div>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container>
        <div className="text-center py-12">
          <KeenIcon icon="cross-circle" className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">The booking you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/admin/bookings')}>
            <KeenIcon icon="arrow-left" className="me-2" />
            Back to Bookings
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/bookings')}
              className="flex items-center gap-2"
            >
              <KeenIcon icon="arrow-left" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <KeenIcon icon="calendar-8" className="text-primary" />
                Booking Details - {booking.booking_id}
              </h1>
              <p className="text-gray-600">Complete information about this booking</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(booking.status)}
            {booking.status && !['CANCELLED', 'COMPLETED', 'cancelled', 'completed'].includes(booking.status) && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setCancelDialogOpen(true)}
                disabled={cancelBookingMutation.isLoading}
              >
                <KeenIcon icon="cross-circle" className="me-2" />
                Cancel Booking
              </Button>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Information */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Service Information</h3>
              </div>
              <div className="card-body space-y-4">
                {booking.items && booking.items.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {booking.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {item.service_name}
                            {item.sub_service && (
                              <div className="text-xs text-gray-500 mt-1">
                                {item.sub_service.name}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{item.sub_service?.category || 'N/A'}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(item.total_price)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-gray-600">No service items found</p>
                )}
              </div>
            </div>

            {/* Address & Location */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Address & Location</h3>
              </div>
              <div className="card-body space-y-4">
                {booking.address ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Full Address</label>
                      <p className="text-sm text-gray-900">
                        {booking.address.full_address || booking.address.address_line_1 || 'N/A'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">City</label>
                        <p className="text-sm text-gray-900">{booking.address.city || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">State</label>
                        <p className="text-sm text-gray-900">{booking.address.state || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Pincode</label>
                        <p className="text-sm text-gray-900">{booking.address?.postal_code || booking.address?.pincode || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Landmark</label>
                        <p className="text-sm text-gray-900">{booking.address.landmark || 'N/A'}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600">No address information available</p>
                )}
              </div>
            </div>

            {/* Status History / Audit Trail */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Status History</h3>
                <p className="text-sm text-gray-600">Complete timeline of booking status changes</p>
              </div>
              <div className="card-body p-0">
                {booking.status_history && booking.status_history.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Changed At</TableHead>
                        <TableHead>Changed By</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {booking.status_history.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {getStatusBadge(entry.status)}
                          </TableCell>
                          <TableCell>{formatDateTime(entry.changed_at)}</TableCell>
                          <TableCell>
                            {entry.changed_by ? (
                              <div>
                                <div className="font-medium">{entry.changed_by.name}</div>
                                <div className="text-xs text-gray-500">{entry.changed_by.role}</div>
                              </div>
                            ) : (
                              'System'
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={entry.reason || 'N/A'}>
                              {entry.reason || 'N/A'}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-6 text-center text-gray-600">
                    No status history available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar Info */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Customer Information</h3>
              </div>
              <div className="card-body space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
                    <KeenIcon icon="user" className="text-primary text-xl" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{booking.user.name}</h4>
                    <p className="text-sm text-gray-600">{booking.user.email}</p>
                    <p className="text-sm text-gray-600">{booking.user.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Information */}
            {booking.provider ? (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Provider Information</h3>
                </div>
                <div className="card-body space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-success-light rounded-full flex items-center justify-center">
                      <KeenIcon icon="user-tie" className="text-success text-xl" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{booking.provider.name}</h4>
                      {booking.provider.email && (
                        <p className="text-sm text-gray-600">{booking.provider.email}</p>
                      )}
                      {booking.provider.phone && (
                        <p className="text-sm text-gray-600">{booking.provider.phone}</p>
                      )}
                      {booking.provider.provider_id && (
                        <p className="text-xs text-gray-500 mt-1">ID: {booking.provider.provider_id}</p>
                      )}
                    </div>
                  </div>
                  {booking.provider.assignment_status && (
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Assignment Status</span>
                        {getStatusBadge(booking.provider.assignment_status)}
                      </div>
                    </div>
                  )}
                  {booking.provider.assignment_id && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Assignment ID</span>
                        <span className="text-xs font-mono text-gray-500">{booking.provider.assignment_id}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Provider Information</h3>
                </div>
                <div className="card-body">
                  <div className="text-center py-4">
                    <KeenIcon icon="user-tie" className="text-4xl text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No provider assigned</p>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Timeline */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Booking Timeline</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {booking.scheduled_date && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Scheduled Date</p>
                        <p className="text-xs text-gray-600">
                          {format(new Date(booking.scheduled_date), 'PP')}
                        </p>
                      </div>
                    </div>
                  )}
                  {booking.scheduled_time_start && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-info rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Start Time</p>
                        <p className="text-xs text-gray-600">
                          {formatDateTime(booking.scheduled_time_start)}
                        </p>
                      </div>
                    </div>
                  )}
                  {booking.scheduled_time_end && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">End Time</p>
                        <p className="text-xs text-gray-600">
                          {formatDateTime(booking.scheduled_time_end)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Payment Details</h3>
              </div>
              <div className="card-body space-y-4">
                <div className="text-center p-4 bg-success-light rounded-lg">
                  <div className="text-2xl font-bold text-success">
                    {formatCurrency(booking.pricing.total)}
                  </div>
                  <div className="text-sm text-gray-600">Total Amount</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span className="text-sm font-medium">{formatCurrency(booking.pricing.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tax</span>
                    <span className="text-sm font-medium">{formatCurrency(booking.pricing.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Discount</span>
                    <span className="text-sm font-medium">{formatCurrency(booking.pricing.discount)}</span>
                  </div>
                  {booking.payment && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Payment Gateway</span>
                        <span className="text-sm font-medium">{booking.payment.gateway}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Payment Status</span>
                        <div>{getStatusBadge(booking.payment.status)}</div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Payment ID</span>
                        <span className="text-sm font-mono text-xs">{booking.payment.payment_id}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              <div>
                <Label htmlFor="cancelReason">Cancellation Reason (Optional)</Label>
                <Textarea
                  id="cancelReason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter reason for cancellation..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCancelDialogOpen(false);
                setCancelReason('');
              }}
              disabled={cancelBookingMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={cancelBookingMutation.isLoading}
            >
              {cancelBookingMutation.isLoading ? 'Cancelling...' : 'Confirm Cancellation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export { BookingDetailsPage };
