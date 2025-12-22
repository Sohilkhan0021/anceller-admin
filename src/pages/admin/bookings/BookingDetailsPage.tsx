import { useParams, useNavigate } from 'react-router-dom';
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
import { useBookingDetail } from '@/services';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';
import { format } from 'date-fns';

const BookingDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { booking, isLoading, isError, error, refetch } = useBookingDetail(id || null);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: string; text: string }> = {
      completed: { variant: 'success', text: 'Completed' },
      pending: { variant: 'warning', text: 'Pending' },
      cancelled: { variant: 'destructive', text: 'Cancelled' },
      'in-progress': { variant: 'info', text: 'In Progress' },
      accepted: { variant: 'secondary', text: 'Accepted' },
      CONFIRMED: { variant: 'success', text: 'Confirmed' },
      PENDING: { variant: 'warning', text: 'Pending' },
      CANCELLED: { variant: 'destructive', text: 'Cancelled' },
      COMPLETED: { variant: 'success', text: 'Completed' },
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge variant={config.variant as any}>{config.text}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
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
                        <p className="text-sm text-gray-900">{booking.address.pincode || 'N/A'}</p>
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
    </Container>
  );
};

export { BookingDetailsPage };
