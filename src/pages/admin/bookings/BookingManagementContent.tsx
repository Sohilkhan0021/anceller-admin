import { useState, useCallback } from 'react';
import { BookingManagementHeader } from './blocks/BookingManagementHeader';
import { BookingManagementTable } from './blocks/BookingManagementTable';
import { AddBookingForm } from './forms/AddBookingForm';
import { EditBookingForm } from './forms/EditBookingForm';
import { useBookings } from '@/services';
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
  }>({
    search: '',
    status: '',
    payment_status: '',
    start_date: '',
    end_date: '',
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
  });

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: { 
    search: string; 
    status: string;
    payment_status: string;
    start_date: string;
    end_date: string;
  }) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handleAddBooking = () => {
    setIsAddFormOpen(true);
  };

  const handleEditBooking = (booking: IBooking) => {
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

  const handleSaveBooking = (bookingData: any) => {
    console.log('Saving booking:', bookingData);
    // TODO: Implement API call to save booking
    setIsAddFormOpen(false);
    // Refetch bookings after save
    refetch();
  };

  const handleUpdateBooking = (bookingData: any) => {
    console.log('Updating booking:', bookingData);
    // TODO: Implement API call to update booking
    setIsEditFormOpen(false);
    setEditBooking(null);
    // Refetch bookings after update
    refetch();
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
