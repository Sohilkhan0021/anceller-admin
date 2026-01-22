import React, { useState, useEffect } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useBookingDetail } from '@/services/booking.hooks';
import { ContentLoader } from '@/components/loaders';

interface IEditBookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookingData: any) => void;
  bookingData?: any;
}

const EditBookingForm = ({ isOpen, onClose, onSave, bookingData }: IEditBookingFormProps) => {
  const [formData, setFormData] = useState({
    userId: '',
    providerId: '',
    serviceId: '',
    serviceName: '',
    bookingDate: new Date(),
    bookingTime: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    amount: '',
    paymentMethod: '',
    status: 'pending',
    specialInstructions: '',
    notes: ''
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Fetch full booking details if bookingData has an ID
  const bookingId = bookingData?.id || bookingData?.booking_id || null;
  const { booking: fullBookingDetails, isLoading: isLoadingDetails } = useBookingDetail(
    bookingId,
    { enabled: isOpen && !!bookingId }
  );

  const paymentMethods = [
    'Credit Card',
    'Debit Card',
    'UPI',
    'Net Banking',
    'Wallet',
    'COD'
  ];

  const statusOptions = [
    'pending',
    'accepted',
    'in-progress',
    'completed',
    'cancelled'
  ];

  useEffect(() => {
    // Use full booking details if available, otherwise use bookingData prop
    const dataToUse = fullBookingDetails || bookingData;

    if (dataToUse) {
      // Extract data from full booking details structure
      const booking = fullBookingDetails || bookingData;

      // Parse scheduled date and time
      let bookingDate = new Date();
      let bookingTime = '';

      // Helper function to safely parse date
      const parseDate = (dateValue: any): Date | null => {
        if (!dateValue) return null;
        const parsed = new Date(dateValue);
        return isNaN(parsed.getTime()) ? null : parsed;
      };

      if (booking.scheduled_date) {
        const parsed = parseDate(booking.scheduled_date);
        if (parsed) bookingDate = parsed;
      } else if (booking.dateTime) {
        const parsed = parseDate(booking.dateTime);
        if (parsed) {
          bookingDate = parsed;
          bookingTime = parsed.toTimeString().slice(0, 5); // HH:mm format
        }
      } else if (booking.bookingDate) {
        const parsed = parseDate(booking.bookingDate);
        if (parsed) bookingDate = parsed;
      }

      // Extract time from scheduled_time_start if available
      if (booking.scheduled_time_start) {
        const timeDate = parseDate(booking.scheduled_time_start);
        if (timeDate) {
          bookingTime = timeDate.toTimeString().slice(0, 5);
        }
      } else if (booking.bookingTime) {
        bookingTime = booking.bookingTime;
      }

      // Extract address components
      const addressObj = booking.address || {};
      const addressString = typeof addressObj === 'string'
        ? addressObj
        : addressObj.full_address || addressObj.address || '';

      // Parse address string if it's a single string (format: "street, city, state postal_code")
      let city = addressObj.city || '';
      let state = addressObj.state || '';
      let pincode = addressObj.postal_code || '';

      if (!city && addressString) {
        // Try to parse from address string
        const parts = addressString.split(',').map((p: string) => p.trim());
        if (parts.length >= 2) {
          city = parts[parts.length - 2] || '';
          const lastPart = parts[parts.length - 1] || '';
          const statePostal = lastPart.split(' ');
          state = statePostal[0] || '';
          pincode = statePostal[1] || '';
        }
      }

      // Get service name from items if available
      const serviceName = booking.items?.[0]?.service_name
        || booking.items?.[0]?.sub_service?.name
        || booking.service
        || booking.serviceName
        || '';

      // Get service ID
      const serviceId = booking.items?.[0]?.sub_service?.sub_service_id
        || booking.serviceId
        || '';

      setFormData({
        userId: booking.user?.user_id || booking.userId || booking.user_id || '',
        providerId: booking.provider?.provider_id || booking.providerId || '',
        serviceId: serviceId,
        serviceName: serviceName,
        bookingDate: bookingDate,
        bookingTime: bookingTime,
        address: addressString,
        city: city,
        state: state,
        pincode: pincode,
        amount: booking.pricing?.total?.toString()
          || booking.amount?.toString()
          || booking.final_amount?.toString()
          || '',
        paymentMethod: booking.payment?.gateway
          || booking.payment_method
          || booking.paymentMethod
          || '',
        status: (booking.status || 'pending').toLowerCase(),
        specialInstructions: booking.special_instructions
          || booking.specialInstructions
          || '',
        notes: booking.notes || booking.admin_notes || ''
      });

      // Only set selectedDate if bookingDate is valid
      if (bookingDate && !isNaN(bookingDate.getTime())) {
        setSelectedDate(bookingDate);
      } else {
        setSelectedDate(undefined);
      }
    }
  }, [bookingData, fullBookingDetails, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, bookingDate: selectedDate });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="pencil" className="text-primary" />
            Edit Booking
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <ContentLoader />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Booking Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Booking Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="userId">User ID *</Label>
                    <Input
                      id="userId"
                      value={formData.userId}
                      onChange={(e) => handleInputChange('userId', e.target.value)}
                      required
                      maxLength={16}
                      className="mt-2"
                      placeholder="Enter user ID"
                    />
                  </div>

                  <div>
                    <Label htmlFor="providerId">Provider ID *</Label>
                    <Input
                      id="providerId"
                      value={formData.providerId}
                      onChange={(e) => handleInputChange('providerId', e.target.value)}
                      required
                      maxLength={16}
                      className="mt-2"
                      placeholder="Enter provider ID"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="serviceId">Service ID *</Label>
                    <Input
                      id="serviceId"
                      value={formData.serviceId}
                      onChange={(e) => handleInputChange('serviceId', e.target.value)}
                      required
                      maxLength={16}
                      className="mt-2"
                      placeholder="Enter service ID"
                    />
                  </div>

                  <div>
                    <Label htmlFor="serviceName">Service Name *</Label>
                    <Input
                      id="serviceName"
                      value={formData.serviceName}
                      onChange={(e) => handleInputChange('serviceName', e.target.value)}
                      required
                      className="mt-2"
                      maxLength={32}
                      placeholder="e.g., Electrical Wiring"
                    />
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Date & Time</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bookingDate">Booking Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-2",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <KeenIcon icon="calendar" className="mr-2 h-4 w-4" />
                          {selectedDate && !isNaN(selectedDate.getTime()) ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="bookingTime">Booking Time *</Label>
                    <Input
                      id="bookingTime"
                      type="time"
                      value={formData.bookingTime}
                      onChange={(e) => handleInputChange('bookingTime', e.target.value)}
                      required
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Service Address</h3>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                    rows={3}
                    maxLength={250}
                    className="mt-2"
                    placeholder="Enter complete address..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      required
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount (₹) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      min={0}
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      required
                      className="mt-2"
                      placeholder="e.g., 500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method} value={method.toLowerCase()}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Booking Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Booking Settings</h3>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="specialInstructions">Special Instructions</Label>
                  <Textarea
                    id="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                    rows={3}
                    className="mt-2"
                    placeholder="Any special instructions for the service..."
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Admin Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="mt-2"
                    placeholder="Internal notes about this booking..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  <KeenIcon icon="check" className="me-2" />
                  Update Booking
                </Button>
              </div>
            </form>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { EditBookingForm };

