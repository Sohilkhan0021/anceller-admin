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
import { ProviderSearchSelect } from '@/components/ProviderSearchSelect';

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch full booking details if bookingData has an ID
  const bookingId = bookingData?.id || bookingData?.booking_id || null;
  const { booking: fullBookingDetails, isLoading: isLoadingDetails } = useBookingDetail(
    bookingId,
    { enabled: isOpen && !!bookingId }
  );

  // Note: ProviderSearchSelect doesn't pre-populate the name, but the provider ID will be set correctly

  // Check if booking is editable (not canceled or completed)
  const bookingStatus = (fullBookingDetails?.status || bookingData?.status || 'pending').toLowerCase();
  const isEditable = bookingStatus !== 'cancelled' && bookingStatus !== 'canceled' && bookingStatus !== 'completed';

  // Payment methods mapping - backend gateway values to display names
  const paymentMethodOptions = [
    { value: 'razorpay', label: 'Razorpay' },
    { value: 'stripe', label: 'Stripe' },
    { value: 'upi', label: 'UPI' },
    { value: 'netbanking', label: 'Net Banking' },
    { value: 'wallet', label: 'Wallet' },
    { value: 'cash_on_delivery', label: 'Cash on Delivery (COD)' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
  ];

  // Helper function to normalize payment method value
  const normalizePaymentMethod = (value: string | undefined | null): string => {
    if (!value) return '';
    const normalized = value.toLowerCase().trim();
    
    // Map common variations to standard values
    const mapping: Record<string, string> = {
      'credit card': 'credit_card',
      'debit card': 'debit_card',
      'cod': 'cash_on_delivery',
      'cash on delivery': 'cash_on_delivery',
      'net banking': 'netbanking',
      'netbanking': 'netbanking',
    };
    
    return mapping[normalized] || normalized;
  };

  const statusOptions = [
    'pending',
    'accepted',
    'in-progress',
    'completed',
    'cancelled'
  ];

  // Map backend status to frontend status format for display
  const mapStatusFromBackend = (status: string | undefined | null): string => {
    if (!status) return 'pending';
    const normalized = status.toUpperCase().trim();
    const statusMap: Record<string, string> = {
      'ACTIVE': 'accepted',
      'UPCOMING': 'pending',
      'IN_PROGRESS': 'in-progress',
      'COMPLETED': 'completed',
      'CANCELED': 'cancelled',
      'CANCELLED': 'cancelled',
      'RESCHEDULED': 'pending',
      'FAILED': 'pending'
    };
    
    return statusMap[normalized] || 'pending';
  };

  useEffect(() => {
    // Only populate form when dialog is open and we have data
    if (!isOpen) {
      return;
    }

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

      // Extract provider ID - try multiple possible fields
      // ProviderSearchSelect might need public_id, so try that first
      const providerId = booking.provider?.public_id
        || booking.provider?.provider_id 
        || booking.provider?.id
        || booking.providerId
        || booking.provider_id
        || (booking as any).jobAssignments?.[0]?.provider?.public_id
        || (booking as any).jobAssignments?.[0]?.provider?.provider_id
        || '';

      // Map backend status to frontend format
      const backendStatus = booking.status || '';
      let normalizedStatus = mapStatusFromBackend(backendStatus);
      
      // Ensure status matches one of the valid options
      if (!statusOptions.includes(normalizedStatus)) {
        normalizedStatus = 'pending'; // Default to pending if status doesn't match
      }

      setFormData({
        userId: booking.user?.user_id || booking.userId || booking.user_id || '',
        providerId: providerId,
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
        paymentMethod: normalizePaymentMethod(
          booking.payment?.gateway
          || booking.payment_method
          || booking.paymentMethod
          || booking.payment_gateway
          || ''
        ),
        status: normalizedStatus,
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
    } else {
      // Reset form when dialog closes or no data
      if (!isOpen) {
        setFormData({
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
        setSelectedDate(undefined);
        setErrors({});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingData, fullBookingDetails, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.userId || formData.userId.trim() === '') {
      newErrors.userId = 'User ID is required';
    }

    // Provider is optional - removed required validation

    if (!formData.serviceId || formData.serviceId.trim() === '') {
      newErrors.serviceId = 'Service ID is required';
    }

    if (!formData.serviceName || formData.serviceName.trim() === '') {
      newErrors.serviceName = 'Service name is required';
    }

    if (!selectedDate || isNaN(selectedDate.getTime())) {
      newErrors.bookingDate = 'Booking date is required';
    }

    if (!formData.bookingTime || formData.bookingTime.trim() === '') {
      newErrors.bookingTime = 'Booking time is required';
    }

    if (!formData.address || formData.address.trim() === '') {
      newErrors.address = 'Address is required';
    }

    if (!formData.city || formData.city.trim() === '') {
      newErrors.city = 'City is required';
    }

    if (!formData.state || formData.state.trim() === '') {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode || formData.pincode.trim() === '') {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    if (!formData.amount || formData.amount.trim() === '') {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) < 0) {
      newErrors.amount = 'Amount must be a valid positive number';
    }

    if (!formData.paymentMethod || formData.paymentMethod.trim() === '') {
      newErrors.paymentMethod = 'Payment method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('EditBookingForm - Submit button clicked', {
      isEditable,
      formData,
      selectedDate
    });
    
    if (!isEditable) {
      console.warn('EditBookingForm - Booking is not editable');
      return;
    }

    if (!validateForm()) {
      console.warn('EditBookingForm - Form validation failed', errors);
      return;
    }

    console.log('EditBookingForm - Calling onSave with data:', {
      ...formData,
      bookingDate: selectedDate
    });
    
    onSave({ ...formData, bookingDate: selectedDate });
  };
  
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('EditBookingForm - Update button clicked');
    // Let the form's onSubmit handle it - don't prevent default
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
          ) : !isEditable ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-warning text-4xl mb-4">
                <KeenIcon icon="information" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Booking Cannot Be Edited
              </h3>
              <p className="text-sm text-gray-600 text-center mb-4">
                This booking is {bookingStatus} and cannot be edited. Only pending, accepted, or in-progress bookings can be edited.
              </p>
              <Button type="button" onClick={onClose}>
                Close
              </Button>
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
                      onChange={(e) => {
                        handleInputChange('userId', e.target.value);
                        if (errors.userId) {
                          setErrors(prev => ({ ...prev, userId: '' }));
                        }
                      }}
                      required
                      maxLength={16}
                      className={`mt-2 ${errors.userId ? 'border-danger' : ''}`}
                      placeholder="Enter user ID"
                    />
                    {errors.userId && (
                      <p className="text-danger text-sm mt-1">{errors.userId}</p>
                    )}
                  </div>

                  <div>
                    <ProviderSearchSelect
                      value={formData.providerId}
                      onChange={(providerId) => {
                        handleInputChange('providerId', providerId);
                        if (errors.providerId) {
                          setErrors(prev => ({ ...prev, providerId: '' }));
                        }
                      }}
                      label="Provider"
                      placeholder="Search provider by name, phone, or ID..."
                    />
                    {errors.providerId && (
                      <p className="text-danger text-sm mt-1">{errors.providerId}</p>
                    )}
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
                    <Select 
                      value={formData.paymentMethod} 
                      onValueChange={(value) => {
                        handleInputChange('paymentMethod', value);
                        if (errors.paymentMethod) {
                          setErrors(prev => ({ ...prev, paymentMethod: '' }));
                        }
                      }}
                    >
                      <SelectTrigger className={`mt-2 ${errors.paymentMethod ? 'border-danger' : ''}`}>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethodOptions.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.paymentMethod && (
                      <p className="text-danger text-sm mt-1">{errors.paymentMethod}</p>
                    )}
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
                <Button 
                  type="submit" 
                  onClick={(e) => {
                    console.log('Button clicked - event:', e);
                    handleButtonClick(e);
                  }}
                  className="cursor-pointer"
                  style={{ position: 'relative', zIndex: 10 }}
                >
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

