import { useState } from 'react';
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

interface IAddBookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookingData: any) => void;
}

const AddBookingForm = ({ isOpen, onClose, onSave }: IAddBookingFormProps) => {
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

  const paymentMethods = [
    'Credit Card',
    'Debit Card',
    'UPI',
    'Net Banking',
    'Wallet',
    'COD'
  ];

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
    // Reset form
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
    setSelectedDate(new Date());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="calendar-8" className="text-primary" />
            Add New Booking
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
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
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
              Create Booking
            </Button>
          </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { AddBookingForm };

