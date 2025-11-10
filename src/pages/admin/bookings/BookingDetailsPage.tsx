import { useState, useEffect } from 'react';
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

const BookingDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    // Simulate API call
    const mockBooking = {
      id: id || 'BK001',
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      phone: '+91 98765 43210',
      service: 'Electrical Repair',
      providerName: 'PowerTech Electric',
      status: 'completed',
      amount: 1200,
      paymentType: 'Credit Card',
      address: '123 Main Street, Sector 15, Gurgaon, Haryana 122001',
      bookingDate: '2024-01-20',
      scheduledDate: '2024-01-20',
      completedDate: '2024-01-20',
      notes: 'Customer prefers morning appointments. Please call before arrival.'
    };

    setTimeout(() => {
      setBooking(mockBooking);
      setLoading(false);
    }, 500);
  }, [id]);

  // Mock data for booking details
  const serviceInfo = {
    serviceType: booking?.service || 'Electrical Repair',
    description: 'Professional electrical repair service including wiring, switch installation, and safety checks.',
    duration: '2-3 hours',
    materials: ['Electrical wires', 'Switch board', 'Safety equipment'],
    specialInstructions: booking?.notes || 'Customer prefers morning appointments. Please call before arrival.'
  };

  const addressInfo = {
    fullAddress: booking?.address || '123 Main Street, Sector 15, Gurgaon, Haryana 122001',
    landmark: 'Near Metro Station',
    coordinates: '28.6139° N, 77.2090° E',
    accessInstructions: 'Ring the doorbell twice. Parking available in front of the building.'
  };

  const paymentDetails = {
    amount: booking?.amount || 1200,
    paymentMethod: booking?.paymentType || 'Credit Card',
    transactionId: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    paymentStatus: 'completed',
    paidAt: '2024-01-20 10:15 AM',
    refundAmount: 0,
    refundStatus: 'none'
  };

  const auditTrail = [
    {
      action: 'Booking Created',
      timestamp: '2024-01-20 09:30 AM',
      user: 'System',
      details: 'Booking initiated by customer'
    },
    {
      action: 'Payment Processed',
      timestamp: '2024-01-20 09:32 AM',
      user: 'Payment Gateway',
      details: `Payment of ₹${booking?.amount || 1200} processed via ${booking?.paymentType || 'Credit Card'}`
    },
    {
      action: 'Provider Assigned',
      timestamp: '2024-01-20 09:35 AM',
      user: 'Admin',
      details: 'Provider automatically assigned based on location and availability'
    },
    {
      action: 'Provider Accepted',
      timestamp: '2024-01-20 09:40 AM',
      user: booking?.providerName || 'PowerTech Electric',
      details: 'Provider accepted the booking and confirmed availability'
    },
    {
      action: 'Service Started',
      timestamp: '2024-01-20 10:00 AM',
      user: booking?.providerName || 'PowerTech Electric',
      details: 'Provider arrived at location and started service'
    },
    {
      action: 'Service Completed',
      timestamp: '2024-01-20 12:30 PM',
      user: booking?.providerName || 'PowerTech Electric',
      details: 'Service completed successfully. Customer satisfied.'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: 'success', text: 'Completed' },
      pending: { variant: 'warning', text: 'Pending' },
      cancelled: { variant: 'destructive', text: 'Cancelled' },
      'in-progress': { variant: 'info', text: 'In Progress' },
      accepted: { variant: 'secondary', text: 'Accepted' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', text: status };
    return <Badge variant={config.variant as any}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
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
                Booking Details - {booking.id}
              </h1>
              <p className="text-gray-600">Complete information about this booking</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(booking.status)}
            <div className="flex gap-2">
              <Button variant="destructive">
                <KeenIcon icon="cross-circle" className="me-2" />
                Cancel Booking
              </Button>
              <Button variant="default" className="bg-success text-white hover:bg-success/90">
                <KeenIcon icon="check-circle" className="me-2" />
                Mark Complete
              </Button>
            </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Service Type</label>
                    <p className="text-sm text-gray-900">{serviceInfo.serviceType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Duration</label>
                    <p className="text-sm text-gray-900">{serviceInfo.duration}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-900">{serviceInfo.description}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Materials Required</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {serviceInfo.materials.map((material, index) => (
                      <Badge key={index} variant="outline" className="badge-outline">
                        {material}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Special Instructions</label>
                  <p className="text-sm text-gray-900">{serviceInfo.specialInstructions}</p>
                </div>
              </div>
            </div>

            {/* Address & Location */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Address & Location</h3>
              </div>
              <div className="card-body space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Address</label>
                  <p className="text-sm text-gray-900">{addressInfo.fullAddress}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Landmark</label>
                    <p className="text-sm text-gray-900">{addressInfo.landmark}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Coordinates</label>
                    <p className="text-sm text-gray-900">{addressInfo.coordinates}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Access Instructions</label>
                  <p className="text-sm text-gray-900">{addressInfo.accessInstructions}</p>
                </div>

                <div className="mt-4">
                  <Button variant="outline" size="sm">
                    <KeenIcon icon="location" className="me-2" />
                    View on Map
                  </Button>
                </div>
              </div>
            </div>

            {/* Audit Trail */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Audit Trail</h3>
                <p className="text-sm text-gray-600">Complete timeline of booking events</p>
              </div>
              <div className="card-body p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditTrail.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{entry.action}</TableCell>
                        <TableCell>{entry.timestamp}</TableCell>
                        <TableCell>{entry.user}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={entry.details}>
                            {entry.details}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                    <h4 className="font-semibold text-gray-900">{booking.customerName}</h4>
                    <p className="text-sm text-gray-600">{booking.customerEmail}</p>
                    <p className="text-sm text-gray-600">{booking.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Information */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Provider Information</h3>
              </div>
              <div className="card-body space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-success-light rounded-full flex items-center justify-center">
                    <KeenIcon icon="shop" className="text-success text-xl" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{booking.providerName}</h4>
                    <p className="text-sm text-gray-600">Electrical Services</p>
                    <div className="flex items-center gap-1 mt-1">
                      <KeenIcon icon="star" className="text-warning text-sm" />
                      <span className="text-sm text-gray-600">4.8 (127 reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <KeenIcon icon="message" className="me-1" />
                    Message
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <KeenIcon icon="phone" className="me-1" />
                    Call
                  </Button>
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
                  <div className="text-2xl font-bold text-success">₹{paymentDetails.amount.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Amount</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Payment Method</span>
                    <span className="text-sm font-medium">{paymentDetails.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Transaction ID</span>
                    <span className="text-sm font-mono text-xs">{paymentDetails.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Payment Status</span>
                    <div>{getStatusBadge(paymentDetails.paymentStatus)}</div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Paid At</span>
                    <span className="text-sm">{paymentDetails.paidAt}</span>
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
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Booking Created</p>
                      <p className="text-xs text-gray-600">{booking.bookingDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Scheduled</p>
                      <p className="text-xs text-gray-600">{booking.scheduledDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Completed</p>
                      <p className="text-xs text-gray-600">{booking.completedDate}</p>
                    </div>
                  </div>
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



