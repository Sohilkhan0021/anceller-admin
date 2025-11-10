import { useState } from 'react';
import { BookingManagementHeader } from './blocks/BookingManagementHeader';
import { BookingManagementTable } from './blocks/BookingManagementTable';
import { AddBookingForm } from './forms/AddBookingForm';
import { EditBookingForm } from './forms/EditBookingForm';

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

const BookingManagementContent = () => {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editBooking, setEditBooking] = useState<IBooking | null>(null);

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
  };

  const handleUpdateBooking = (bookingData: any) => {
    console.log('Updating booking:', bookingData);
    // TODO: Implement API call to update booking
    setIsEditFormOpen(false);
    setEditBooking(null);
  };

  return (
    <div className="grid gap-5 lg:gap-7.5">
      {/* Header with filters */}
      <BookingManagementHeader onAddBooking={handleAddBooking} />

      {/* Booking Management Table */}
      <BookingManagementTable 
        onEditBooking={handleEditBooking}
      />

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
