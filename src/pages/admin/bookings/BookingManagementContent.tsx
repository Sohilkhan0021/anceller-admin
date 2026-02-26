import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { BookingManagementHeader } from './blocks/BookingManagementHeader';
import { BookingManagementTable } from './blocks/BookingManagementTable';
import { AddBookingForm } from './forms/AddBookingForm';
import { EditBookingForm } from './forms/EditBookingForm';
import { useBookings, useUpdateBookingStatus, useAssignProvider, useUpdateBooking } from '@/services';
import { IBooking } from '@/services/booking.types';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';

const BookingManagementContent = () => {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editBooking, setEditBooking] = useState<IBooking | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState<{ 
    search: string; 
    status: string;
    payment_status: string;
    start_date: string;
    end_date: string;
    category_id?: string;
  }>({
    search: '',
    status: '',
    payment_status: '',
    start_date: '',
    end_date: '',
    category_id: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Fetch bookings with filters
  const { 
    bookings, 
    pagination, 
    isLoading, 
    isError, 
    error, 
    refetch,
    isFetching 
  } = useBookings({
    page: currentPage,
    limit: pageSize,
    status: filters.status,
    payment_status: filters.payment_status,
    start_date: filters.start_date,
    end_date: filters.end_date,
    search: filters.search,
    category_id: filters.category_id,
  });

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: { 
    search: string; 
    status: string;
    payment_status: string;
    start_date: string;
    end_date: string;
    category_id?: string;
  }) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handleAddBooking = () => {
    setIsAddFormOpen(true);
  };

  const handleEditBooking = (booking: IBooking) => {
    // Prevent editing of canceled or completed bookings
    const status = (booking.status || '').toLowerCase();
    if (status === 'cancelled' || status === 'canceled' || status === 'completed') {
      toast.error(`Cannot edit ${status} bookings. Only pending, accepted, or in-progress bookings can be edited.`);
      return;
    }
    setEditBooking(booking);
    setIsEditFormOpen(true);
  };

  const handleCloseAddForm = () => {
    setIsAddFormOpen(false);
  };

  const handleCloseEditForm = () => {
    setIsEditFormOpen(false);
    setEditBooking(null);
  };

  // Mutations for booking updates
  const updateStatusMutation = useUpdateBookingStatus({
    onSuccess: (data) => {
      toast.success(data.message || 'Booking status updated successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update booking status');
    }
  });

  const assignProviderMutation = useAssignProvider({
    onSuccess: (data) => {
      toast.success(data.message || 'Provider assigned successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to assign provider');
    }
  });

  const updateBookingMutation = useUpdateBooking({
    onSuccess: (data) => {
      toast.success(data.message || 'Booking updated successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update booking');
    }
  });

  const handleSaveBooking = (bookingData: any) => {
    console.log('Saving booking:', bookingData);
    // TODO: Implement API call to save booking
    setIsAddFormOpen(false);
    // Refetch bookings after save
    refetch();
  };

  // Map frontend status to backend status format
  const mapStatusToBackend = (status: string): string => {
    const normalized = (status || '').toLowerCase().trim();
    const statusMap: Record<string, string> = {
      'pending': 'ACTIVE',
      'accepted': 'ACTIVE',
      'in-progress': 'IN_PROGRESS',
      'in_progress': 'IN_PROGRESS',
      'completed': 'COMPLETED',
      'cancelled': 'CANCELED',
      'canceled': 'CANCELED',
      'rescheduled': 'RESCHEDULED',
      'failed': 'FAILED',
      'upcoming': 'UPCOMING',
      'active': 'ACTIVE'
    };
    
    return statusMap[normalized] || normalized.toUpperCase();
  };

  const handleUpdateBooking = async (bookingData: any) => {
    if (!editBooking?.id) {
      toast.error('Booking ID is missing');
      return;
    }

    const bookingId = editBooking.id;
    const originalStatus = (editBooking.status || '').toLowerCase();
    const newStatus = (bookingData.status || '').toLowerCase();
    const originalProviderId = editBooking.providerId || '';
    const newProviderId = bookingData.providerId || '';

    try {
      // Prepare update data for all fields
      const updateData: any = {};

      // Address fields
      if (bookingData.address || bookingData.city || bookingData.state || bookingData.pincode) {
        if (bookingData.address) updateData.address = bookingData.address;
        if (bookingData.city) updateData.city = bookingData.city;
        if (bookingData.state) updateData.state = bookingData.state;
        if (bookingData.pincode) updateData.pincode = bookingData.pincode;
      }

      // Date and time
      if (bookingData.bookingDate) {
        const date = bookingData.bookingDate instanceof Date 
          ? bookingData.bookingDate 
          : new Date(bookingData.bookingDate);
        if (!isNaN(date.getTime())) {
          updateData.scheduled_date = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        }
      }
      if (bookingData.bookingTime) {
        updateData.scheduled_time = bookingData.bookingTime; // HH:MM format
      }

      // Amount fields
      if (bookingData.amount) {
        const amount = parseFloat(bookingData.amount);
        if (!isNaN(amount)) {
          updateData.final_amount = amount;
          // If only final_amount is provided, we'll let backend calculate or use existing values
        }
      }

      // Payment method
      if (bookingData.paymentMethod) {
        updateData.payment_gateway = bookingData.paymentMethod;
      }

      // Notes
      if (bookingData.notes) {
        updateData.notes = bookingData.notes;
      }
      if (bookingData.specialInstructions) {
        updateData.special_instructions = bookingData.specialInstructions;
      }

      // Status (if changed, will be handled separately for status history)
      if (newStatus && newStatus !== originalStatus) {
        updateData.status = mapStatusToBackend(newStatus);
        updateData.reason = 'Updated by admin';
      }

      // Update booking with all fields
      if (Object.keys(updateData).length > 0) {
        await updateBookingMutation.mutateAsync({
          bookingId,
          updateData
        });
      }

      // Assign provider separately if changed (this has its own notification logic)
      if (newProviderId && newProviderId !== originalProviderId) {
        await assignProviderMutation.mutateAsync({
          bookingId,
          providerId: newProviderId,
          notes: bookingData.notes || 'Provider assigned via admin edit'
        });
      }

      setIsEditFormOpen(false);
      setEditBooking(null);
    } catch (error: any) {
      // Error is already handled by mutation callbacks
      console.error('Error updating booking:', error);
    }
  };

  return (
    <div className="grid gap-5 lg:gap-7.5">
      {/* Header with filters */}
      <BookingManagementHeader 
        onAddBooking={handleAddBooking}
        onFiltersChange={handleFiltersChange}
        initialFilters={filters}
      />

      {/* Error State */}
      {isError && (
        <Alert variant="danger">
          <div className="flex items-center justify-between">
            <span>
              {error?.message || 'Failed to load bookings. Please try again.'}
            </span>
            <button
              onClick={() => refetch()}
              className="text-sm underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && !isFetching ? (
        <div className="card">
          <div className="card-body">
            <ContentLoader />
          </div>
        </div>
      ) : (
        /* Booking Management Table */
        <BookingManagementTable 
          bookings={bookings}
          pagination={pagination}
          isLoading={isFetching}
          onEditBooking={handleEditBooking}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Add Booking Form */}
      <AddBookingForm 
        isOpen={isAddFormOpen}
        onClose={handleCloseAddForm}
        onSave={handleSaveBooking}
      />

      {/* Edit Booking Form */}
      <EditBookingForm 
        isOpen={isEditFormOpen}
        onClose={handleCloseEditForm}
        onSave={handleUpdateBooking}
        bookingData={editBooking}
      />
    </div>
  );
};

export { BookingManagementContent };
