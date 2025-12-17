import { useState } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabPanel,
  TabsList,
  Tab,
} from '@/components/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUserManage } from '@/providers/userManageProvider';
import { useEffect } from 'react';
import { ContentLoader } from '@/components/loaders';

interface IUserDetailModalProps {
  user: any | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailModal = ({ user, isOpen, onClose }: IUserDetailModalProps) => {
  const { fetchUserDetails, currentUserDetails, userDetailsLoading } = useUserManage();

  useEffect(() => {
    if (isOpen && user?.id) {
      // Use id or user_id depending on what's available physically in the object from Table
      const idToFetch = user.user_id || user.id;
      fetchUserDetails(idToFetch);
    }
  }, [isOpen, user]);

  if (!isOpen) return null; // Don't verify user prop here, rely on Loading or Details

  // Use currentUserDetails if available, else fallback to prop
  const displayUser = currentUserDetails || user;

  if (userDetailsLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl min-h-[400px] flex items-center justify-center">
          <ContentLoader />
        </DialogContent>
      </Dialog>
    );
  }

  if (!displayUser) return null;

  // Mock data for user details (keep existing mocks if API doesn't provide lists yet)
  // The API response in screenshot has empty lists for recent_orders and addresses but has stats.
  // I will map stats if available.

  const bookingHistory = [
    {
      id: 'BK001',
      service: 'Home Cleaning',
      provider: 'CleanPro Services',
      date: '2024-01-20',
      status: 'completed',
      amount: 500
    },
    {
      id: 'BK002',
      service: 'Plumbing Repair',
      provider: 'FixIt Plumbing',
      date: '2024-01-18',
      status: 'completed',
      amount: 800
    },
    {
      id: 'BK003',
      service: 'Electrical Work',
      provider: 'PowerTech Electric',
      date: '2024-01-15',
      status: 'pending',
      amount: 1200
    }
  ];

  const paymentHistory = [
    {
      id: 'PAY001',
      amount: 500,
      method: 'Credit Card',
      date: '2024-01-20',
      status: 'completed'
    },
    {
      id: 'PAY002',
      amount: 800,
      method: 'UPI',
      date: '2024-01-18',
      status: 'completed'
    },
    {
      id: 'PAY003',
      amount: 1200,
      method: 'Credit Card',
      date: '2024-01-15',
      status: 'pending'
    }
  ];

  const supportTickets = [
    {
      id: 'TKT001',
      subject: 'Service Quality Issue',
      status: 'open',
      priority: 'high',
      date: '2024-01-19',
      description: 'The cleaning service was not satisfactory'
    },
    {
      id: 'TKT002',
      subject: 'Payment Refund Request',
      status: 'resolved',
      priority: 'medium',
      date: '2024-01-10',
      description: 'Requesting refund for cancelled service'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: 'success', text: 'Completed' },
      pending: { variant: 'warning', text: 'Pending' },
      cancelled: { variant: 'destructive', text: 'Cancelled' },
      open: { variant: 'destructive', text: 'Open' },
      resolved: { variant: 'success', text: 'Resolved' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'outline', text: status };
    return <Badge variant={config.variant as any}>{config.text}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { variant: 'destructive', text: 'High' },
      medium: { variant: 'warning', text: 'Medium' },
      low: { variant: 'secondary', text: 'Low' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || { variant: 'secondary', text: priority };
    return <Badge variant={config.variant as any}>{config.text}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 py-4">
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="user" className="text-primary" />
            User Details - {displayUser.name}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <Tab value="profile">Profile</Tab>
              <Tab value="bookings">Bookings</Tab>
              <Tab value="payments">Payments</Tab>
              <Tab value="tickets">Support</Tab>
            </TabsList>

            {/* Profile Tab */}
            <TabPanel value="profile" className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Basic Information</h3>
                  </div>
                  <div className="card-body space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center">
                        <KeenIcon icon="user" className="text-primary text-2xl" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold">{displayUser.name}</h4>
                        <p className="text-gray-600">{displayUser.email}</p>
                        <p className="text-gray-600">{displayUser.phone || displayUser.phone_number}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">User ID</label>
                        <p className="text-sm text-gray-900">{displayUser.user_id || displayUser.id}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <div className="mt-1">{getStatusBadge(displayUser.status)}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Join Date</label>
                        <p className="text-sm text-gray-900">{displayUser.joined_at || displayUser.joinDate}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Last Active</label>
                        <p className="text-sm text-gray-900">{displayUser.last_login_at || displayUser.lastActive || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Statistics</h3>
                  </div>
                  <div className="card-body">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-primary-light rounded-lg">
                        <div className="text-2xl font-bold text-primary">{displayUser.stats?.total_orders || displayUser.totalBookings || 0}</div>
                        <div className="text-sm text-gray-600">Total Bookings</div>
                      </div>
                      <div className="text-center p-4 bg-success-light rounded-lg">
                        <div className="text-2xl font-bold text-success">₹{displayUser.stats?.total_revenue || displayUser.totalSpent || 0}</div>
                        <div className="text-sm text-gray-600">Total Spent</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>

            {/* Bookings Tab */}
            <TabPanel value="bookings" className="space-y-6 pt-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Booking History</h3>
                </div>
                <div className="card-body p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Booking ID</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookingHistory.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.id}</TableCell>
                          <TableCell>{booking.service}</TableCell>
                          <TableCell>{booking.provider}</TableCell>
                          <TableCell>{booking.date}</TableCell>
                          <TableCell>₹{booking.amount}</TableCell>
                          <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabPanel>

            {/* Payments Tab */}
            <TabPanel value="payments" className="space-y-6 pt-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Payment History</h3>
                </div>
                <div className="card-body p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentHistory.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.id}</TableCell>
                          <TableCell>₹{payment.amount}</TableCell>
                          <TableCell>{payment.method}</TableCell>
                          <TableCell>{payment.date}</TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabPanel>

            {/* Support Tickets Tab */}
            <TabPanel value="tickets" className="space-y-6 pt-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Support Tickets</h3>
                </div>
                <div className="card-body p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket ID</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supportTickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-medium">{ticket.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{ticket.subject}</div>
                              <div className="text-sm text-gray-600">{ticket.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                          <TableCell>{ticket.date}</TableCell>
                          <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabPanel>
          </Tabs>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="destructive">
            <KeenIcon icon="cross-circle" className="me-2" />
            Block User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { UserDetailModal };
