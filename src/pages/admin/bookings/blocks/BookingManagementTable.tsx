import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

interface IBooking {
  id: string;
  userName: string;
  providerName: string;
  service: string;
  dateTime: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled' | 'in-progress';
  amount: number;
  paymentType: string;
  address: string;
  phone: string;
}

interface IBookingManagementTableProps {
  onEditBooking?: (booking: IBooking) => void;
}

const BookingManagementTable = ({ onEditBooking }: IBookingManagementTableProps) => {
  const navigate = useNavigate();
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);

  // Mock data - in real app, this would come from API
  const bookings: IBooking[] = [
    {
      id: 'BK001',
      userName: 'John Doe',
      providerName: 'Rajesh Kumar',
      service: 'Electrical Repair',
      dateTime: '2024-01-20 10:00 AM',
      status: 'completed',
      amount: 500,
      paymentType: 'Credit Card',
      address: '123 Main St, Delhi',
      phone: '+91 98765 43210'
    },
    {
      id: 'BK002',
      userName: 'Jane Smith',
      providerName: 'Priya Sharma',
      service: 'AC Service',
      dateTime: '2024-01-21 2:00 PM',
      status: 'in-progress',
      amount: 800,
      paymentType: 'UPI',
      address: '456 Park Ave, Mumbai',
      phone: '+91 98765 43211'
    },
    {
      id: 'BK003',
      userName: 'Mike Johnson',
      providerName: 'Amit Singh',
      service: 'Plumbing Repair',
      dateTime: '2024-01-22 9:00 AM',
      status: 'pending',
      amount: 1200,
      paymentType: 'Net Banking',
      address: '789 Garden Rd, Bangalore',
      phone: '+91 98765 43212'
    },
    {
      id: 'BK004',
      userName: 'Sarah Wilson',
      providerName: 'Sunita Patel',
      service: 'Home Cleaning',
      dateTime: '2024-01-23 11:00 AM',
      status: 'accepted',
      amount: 300,
      paymentType: 'Wallet',
      address: '321 Oak St, Chennai',
      phone: '+91 98765 43213'
    },
    {
      id: 'BK005',
      userName: 'David Brown',
      providerName: 'Vikram Gupta',
      service: 'Carpentry Work',
      dateTime: '2024-01-24 3:00 PM',
      status: 'cancelled',
      amount: 1500,
      paymentType: 'Cash',
      address: '654 Pine St, Kolkata',
      phone: '+91 98765 43214'
    }
  ];

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

  const handleCancelBooking = (bookingId: string) => {
    // TODO: Implement cancel booking functionality
    console.log('Cancelling booking:', bookingId);
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'default', className: 'bg-warning text-white', text: 'Pending' },
      accepted: { variant: 'default', className: 'bg-info text-white', text: 'Accepted' },
      completed: { variant: 'default', className: 'bg-success text-white', text: 'Completed' },
      cancelled: { variant: 'destructive', className: '', text: 'Cancelled' },
      'in-progress': { variant: 'secondary', className: '', text: 'In Progress' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', className: '', text: status };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
  };

  const getPaymentTypeIcon = (paymentType: string) => {
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
          <h3 className="card-title">Bookings ({bookings.length})</h3>
          {selectedBookings.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedBookings.length} selected
              </span>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <KeenIcon icon="cross-circle" className="me-2" />
                Cancel Selected
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="card-body p-0">
        <div className="overflow-x-auto">
          <Table className="min-w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 hidden sm:table-cell">
                  <Checkbox
                    checked={selectedBookings.length === bookings.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="hidden sm:table-cell">Booking ID</TableHead>
                <TableHead className="w-[180px] sm:w-[200px]">Booking</TableHead>
                <TableHead className="hidden md:table-cell w-[150px]">Provider</TableHead>
                <TableHead className="hidden lg:table-cell w-[120px]">Service</TableHead>
                <TableHead className="hidden md:table-cell w-[150px]">Date-Time</TableHead>
                <TableHead className="hidden sm:table-cell w-[100px]">Status</TableHead>
                <TableHead className="hidden lg:table-cell w-[100px]">Amount</TableHead>
                <TableHead className="hidden lg:table-cell w-[120px]">Payment</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Checkbox
                      checked={selectedBookings.includes(booking.id)}
                      onCheckedChange={(checked) => handleSelectBooking(booking.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell font-medium">{booking.id}</TableCell>
                  <TableCell className="w-[180px] sm:w-[200px]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                        <KeenIcon icon="user" className="text-primary text-xs" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate text-sm">{booking.userName}</div>
                        <div className="text-xs text-gray-500 hidden sm:block">{booking.phone}</div>
                        <div className="text-xs text-gray-500 sm:hidden">{booking.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-success-light rounded-full flex items-center justify-center flex-shrink-0">
                        <KeenIcon icon="shop" className="text-success text-sm" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{booking.providerName}</div>
                        <div className="text-sm text-gray-500">Provider</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant="outline" className="badge-outline">
                      {booking.service}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div>
                      <div className="font-medium">{booking.dateTime}</div>
                      <div className="text-sm text-gray-500 truncate max-w-[200px]" title={booking.address}>
                        {booking.address}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{getStatusBadge(booking.status)}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="text-center">
                      <div className="font-semibold">₹{booking.amount.toLocaleString()}</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <KeenIcon icon={getPaymentTypeIcon(booking.paymentType)} className="text-gray-500 text-sm" />
                      <span className="text-sm">{booking.paymentType}</span>
                    </div>
                  </TableCell>
                  <TableCell className="w-[80px]">
                    <div className="flex items-center justify-end">
                      <div className="flex flex-col gap-1 sm:hidden mr-1">
                        <div className="md:hidden">
                          <Badge variant="outline" className="badge-outline text-xs px-1 py-0">
                            {booking.service.length > 8 ? booking.service.substring(0, 8) + '...' : booking.service}
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
                          <DropdownMenuItem onClick={() => handleRefund(booking.id)}>
                            <KeenIcon icon="arrows-loop" className="me-2" />
                            Refund / Manual Override
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
      </div>
    </div>
  );
};

export { BookingManagementTable };


