import { useState, useEffect, useRef, useCallback } from 'react';
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
import { ContentLoader } from '@/components/loaders';
import { userService } from '@/services/user.service';

interface IUserDetailModalProps {
  user: any | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailModal = ({ user, isOpen, onClose }: IUserDetailModalProps) => {
  const { fetchUserDetails, currentUserDetails, userDetailsLoading, updateUserStatus, isUpdatingStatus } = useUserManage();
  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  
  // Use ref to track the last fetched user ID to prevent duplicate calls
  const lastFetchedUserIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  // Memoize the fetch function to prevent recreation on every render
  const fetchUserData = useCallback(async (userId: string) => {
    // Prevent duplicate calls
    if (isFetchingRef.current || lastFetchedUserIdRef.current === userId) {
      return;
    }
    
    isFetchingRef.current = true;
    lastFetchedUserIdRef.current = userId;
    
    setBookingsLoading(true);
    setPaymentsLoading(true);
    setTicketsLoading(true);
    
    try {
      const [bookingsData, paymentsData, ticketsData] = await Promise.all([
        userService.getUserBookings(userId, { limit: 50 }).catch(err => {
          console.error('Error fetching bookings:', err);
          return { data: { bookings: [] } };
        }),
        userService.getUserPayments(userId, { limit: 50 }).catch(err => {
          console.error('Error fetching payments:', err);
          return { data: { transactions: [] } };
        }),
        userService.getUserSupportTickets(userId, { limit: 50 }).catch(err => {
          console.error('Error fetching support tickets:', err);
          return { data: { items: [] } };
        })
      ]);
      
      // Handle bookings response - backend returns { status: 1, data: { bookings: [...], pagination: {...} } }
      let bookingsList = [];
      if (bookingsData?.data?.bookings) {
        bookingsList = Array.isArray(bookingsData.data.bookings) ? bookingsData.data.bookings : [];
      } else if (bookingsData?.data?.items) {
        bookingsList = Array.isArray(bookingsData.data.items) ? bookingsData.data.items : [];
      } else if (Array.isArray(bookingsData?.data)) {
        bookingsList = bookingsData.data;
      }
      setBookings(bookingsList);
      
      // Handle payments response - backend returns { status: 1, data: { transactions: [...], pagination: {...} } }
      let paymentsList = [];
      if (paymentsData?.data?.transactions) {
        paymentsList = Array.isArray(paymentsData.data.transactions) ? paymentsData.data.transactions : [];
      } else if (paymentsData?.data?.items) {
        paymentsList = Array.isArray(paymentsData.data.items) ? paymentsData.data.items : [];
      } else if (Array.isArray(paymentsData?.data)) {
        paymentsList = paymentsData.data;
      }
      setPayments(paymentsList);
      
      // Handle support tickets response
      let ticketsList = [];
      if (ticketsData?.data?.items) {
        ticketsList = Array.isArray(ticketsData.data.items) ? ticketsData.data.items : [];
      } else if (Array.isArray(ticketsData?.data)) {
        ticketsList = ticketsData.data;
      }
      setSupportTickets(ticketsList);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Keep empty arrays on error
      setBookings([]);
      setPayments([]);
      setSupportTickets([]);
    } finally {
      setBookingsLoading(false);
      setPaymentsLoading(false);
      setTicketsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Get stable user ID
  const userId = user?.user_id || user?.id || user?.public_id;

  useEffect(() => {
    if (!isOpen) {
      // Reset data when modal closes
      setBookings([]);
      setPayments([]);
      setSupportTickets([]);
      lastFetchedUserIdRef.current = null;
      isFetchingRef.current = false;
      return;
    }

    if (!userId) {
      console.error('No user ID found in user object:', user);
      return;
    }

    // Only fetch if this is a different user or modal just opened
    if (lastFetchedUserIdRef.current !== userId && !isFetchingRef.current) {
      // Fetch user details
      fetchUserDetails(userId);
      
      // Fetch bookings, payments, and support tickets
      fetchUserData(userId);
    }
    // Only depend on isOpen and userId, not the entire user object or functions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId]);

  const handleStatusChange = async () => {
    if (!displayUser) return;

    // Determine current status and next action
    // "active" in UI maps to ACTIVE in backend
    // "suspended" or "blocked" in UI maps to SUSPENDED in backend
    const currentStatus = displayUser.status?.toLowerCase();
    const isCurrentlyActive = currentStatus === 'active';

    const newStatus = isCurrentlyActive ? 'SUSPENDED' : 'ACTIVE';
    const userId = displayUser.user_id || displayUser.id;

    try {
      await updateUserStatus(userId, newStatus);
      onClose();
    } catch (error) {
      // Error is handled in provider
      console.error(error);
    }
  };

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

  const isUserActive = displayUser.status?.toLowerCase() === 'active';

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
                      {displayUser.profile_picture_url ? (
                        <img 
                          src={displayUser.profile_picture_url.startsWith('http') 
                            ? displayUser.profile_picture_url 
                            : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || ''}${displayUser.profile_picture_url.startsWith('/') ? displayUser.profile_picture_url : '/' + displayUser.profile_picture_url}`}
                          alt={displayUser.name}
                          className="w-16 h-16 rounded-full object-cover"
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-16 h-16 bg-primary-light rounded-full flex items-center justify-center ${displayUser.profile_picture_url ? 'hidden' : ''}`}>
                        <KeenIcon icon="user" className="text-primary text-2xl" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold">{displayUser.name}</h4>
                        <p className="text-gray-600">{displayUser.email}</p>
                        <p className="text-gray-600">
                          {(() => {
                            const phone = displayUser.phone || displayUser.phone_number || '';
                            const countryCode = displayUser.phone_country_code || '+91';
                            // Remove duplicate country code if present
                            let cleanPhone = phone.replace(new RegExp(`^${countryCode.replace('+', '\\+')}\\s*`, 'g'), '').trim();
                            // If phone doesn't start with country code, add it
                            if (cleanPhone && !cleanPhone.startsWith('+')) {
                              return `${countryCode} ${cleanPhone}`;
                            }
                            return cleanPhone || 'N/A';
                          })()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">User ID</label>
                        <p className="text-sm text-gray-900">{displayUser.user_id || displayUser.id}</p>
                      </div>
                      <div className='ml-20'>
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <div className="mt-1">{getStatusBadge(displayUser.status)}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Join Date</label>
                        <p className="text-sm text-gray-900 whitespace-nowrap">
                          {displayUser.joined_at 
                            ? new Date(displayUser.joined_at).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : displayUser.joinDate || 'N/A'}
                        </p>
                      </div>
                      <div className='ml-20'>
                        <label className="text-sm font-medium text-gray-700">Last Active</label>
                        <p className="text-sm text-gray-900">
                          {displayUser.last_login_at && displayUser.last_login_at !== null && displayUser.last_login_at !== undefined
                            ? new Date(displayUser.last_login_at).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Never'}
                        </p>
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
                      {bookingsLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <ContentLoader />
                          </TableCell>
                        </TableRow>
                      ) : bookings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No bookings found
                          </TableCell>
                        </TableRow>
                      ) : (
                        bookings.map((booking: any) => {
                          // Handle different booking response formats from backend
                          const bookingId = booking.booking_id || booking.public_id || booking.order_id || booking.id;
                          const serviceName = booking.service || booking.service_name || booking.orderItems?.[0]?.subService?.name || 'N/A';
                          const providerName = booking.provider?.name || booking.provider_name || (booking.provider ? `${booking.provider.business_name || booking.provider.contact_name || 'N/A'}` : 'N/A');
                          const bookingDate = booking.scheduled_date || booking.created_at || booking.date;
                          const amount = booking.amount || booking.final_amount || 0;
                          const status = booking.status || 'pending';
                          
                          return (
                            <TableRow key={bookingId}>
                              <TableCell className="font-medium">{bookingId}</TableCell>
                              <TableCell>{serviceName}</TableCell>
                              <TableCell>{providerName}</TableCell>
                              <TableCell>
                                {bookingDate 
                                  ? new Date(bookingDate).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })
                                  : 'N/A'}
                              </TableCell>
                              <TableCell>₹{typeof amount === 'number' ? amount.toFixed(2) : amount}</TableCell>
                              <TableCell>{getStatusBadge(status)}</TableCell>
                            </TableRow>
                          );
                        })
                      )}
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
                      {paymentsLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <ContentLoader />
                          </TableCell>
                        </TableRow>
                      ) : payments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No payments found
                          </TableCell>
                        </TableRow>
                      ) : (
                        payments.map((payment: any) => {
                          // Handle different payment response formats
                          const paymentId = payment.transaction_id || payment.public_id || payment.id;
                          const amount = payment.amount || 0;
                          const method = payment.payment_method_display || payment.payment_mode || payment.method || payment.gateway || 'N/A';
                          const paymentDate = payment.created_at || payment.completed_at || payment.date;
                          const status = payment.status || 'pending';
                          
                          return (
                            <TableRow key={paymentId}>
                              <TableCell className="font-medium">{paymentId}</TableCell>
                              <TableCell>₹{typeof amount === 'number' ? amount.toFixed(2) : amount}</TableCell>
                              <TableCell>{method}</TableCell>
                              <TableCell>
                                {paymentDate 
                                  ? new Date(paymentDate).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })
                                  : 'N/A'}
                              </TableCell>
                              <TableCell>{getStatusBadge(status)}</TableCell>
                            </TableRow>
                          );
                        })
                      )}
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
                      {ticketsLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <ContentLoader />
                          </TableCell>
                        </TableRow>
                      ) : supportTickets.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No support tickets found
                          </TableCell>
                        </TableRow>
                      ) : (
                        supportTickets.map((ticket: any) => (
                          <TableRow key={ticket.dispute_id || ticket.public_id || ticket.id}>
                            <TableCell className="font-medium">{ticket.dispute_id || ticket.public_id || ticket.id}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{ticket.subject || ticket.title || 'N/A'}</div>
                                <div className="text-sm text-gray-600">{ticket.description || ticket.issue_description || ''}</div>
                              </div>
                            </TableCell>
                            <TableCell>{getPriorityBadge(ticket.priority?.toLowerCase() || 'medium')}</TableCell>
                            <TableCell>
                              {ticket.created_at 
                                ? new Date(ticket.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })
                                : ticket.date || 'N/A'}
                            </TableCell>
                            <TableCell>{getStatusBadge(ticket.status?.toLowerCase() || 'open')}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabPanel>
          </Tabs>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose} disabled={isUpdatingStatus}>
            Close
          </Button>
          <Button
            variant={isUserActive ? "destructive" : "default"}
            onClick={handleStatusChange}
            disabled={isUpdatingStatus}
            className={!isUserActive ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isUpdatingStatus ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Processing...
              </span>
            ) : (
              <>
                <KeenIcon icon={isUserActive ? "cross-circle" : "check-circle"} className="me-2" />
                {isUserActive ? "Block User" : "Unblock User"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { UserDetailModal };
