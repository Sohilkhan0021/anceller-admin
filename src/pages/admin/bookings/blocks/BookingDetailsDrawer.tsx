import { useState } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface IBookingDetailsDrawerProps {
  booking: any | null;
  isOpen: boolean;
  onClose: () => void;
}

const BookingDetailsDrawer = ({ booking, isOpen, onClose }: IBookingDetailsDrawerProps) => {
  if (!booking) return null;

  // Mock data for booking details
  const serviceInfo = {
    serviceType: booking.service,
    description: 'Professional electrical repair service including wiring, switch installation, and safety checks.',
    duration: '2-3 hours',
    materials: ['Electrical wires', 'Switch board', 'Safety equipment'],
    specialInstructions: 'Customer prefers morning appointments. Please call before arrival.'
  };

  const addressInfo = {
    fullAddress: booking.address,
    landmark: 'Near Metro Station',
    coordinates: '28.6139° N, 77.2090° E',
    accessInstructions: 'Ring the doorbell twice. Parking available in front of the building.'
  };

  const paymentDetails = {
    amount: booking.amount,
    paymentMethod: booking.paymentType,
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
      details: `Payment of ₹${booking.amount} processed via ${booking.paymentType}`
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
      user: booking.providerName,
      details: 'Provider accepted the booking and confirmed availability'
    },
    {
      action: 'Service Started',
      timestamp: '2024-01-20 10:00 AM',
      user: booking.providerName,
      details: 'Provider arrived at location and started service'
    },
    {
      action: 'Service Completed',
      timestamp: '2024-01-20 12:30 PM',
      user: booking.providerName,
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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:w-[800px] h-full flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-3">
            <KeenIcon icon="calendar-8" className="text-primary" />
            Booking Details - {booking.id}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
          {/* Service Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Service Information</h3>
            </div>
            <div className="card-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
              
              <div className="grid grid-cols-2 gap-4">
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

          {/* Payment Details */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Payment Details</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Amount</label>
                  <p className="text-lg font-semibold text-gray-900">₹{paymentDetails.amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Payment Method</label>
                  <p className="text-sm text-gray-900">{paymentDetails.paymentMethod}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Transaction ID</label>
                  <p className="text-sm text-gray-900 font-mono">{paymentDetails.transactionId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Payment Status</label>
                  <div className="mt-1">{getStatusBadge(paymentDetails.paymentStatus)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Paid At</label>
                  <p className="text-sm text-gray-900">{paymentDetails.paidAt}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Refund Status</label>
                  <p className="text-sm text-gray-900">No refund</p>
                </div>
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
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="destructive">
            <KeenIcon icon="cross-circle" className="me-2" />
            Cancel Booking
          </Button>
          <Button variant="default" className="bg-success text-white hover:bg-success/90">
            <KeenIcon icon="check-circle" className="me-2" />
            Mark Complete
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export { BookingDetailsDrawer };


