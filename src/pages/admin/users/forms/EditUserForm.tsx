import { useState, useEffect, useRef } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
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
import { Switch } from '@/components/ui/switch';
import { useUserManage } from '@/providers/userManageProvider';
import { ContentLoader } from '@/components/loaders';

interface IEditUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => void;
  userData: any;
}

const EditUserForm = ({ isOpen, onClose, onSave, userData }: IEditUserFormProps) => {
  const { fetchUserDetails, currentUserDetails, userDetailsLoading } = useUserManage();
  const fetchedUserIdRef = useRef<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    status: 'active',
    isVerified: true,
    notes: ''
  });
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);

  // Helper function to extract phone number without country code and spaces
  const extractPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    // Remove all spaces, dashes, and parentheses
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    // Remove country codes (common formats: +91, +1, etc.)
    cleaned = cleaned.replace(/^\+?\d{1,4}/, '');
    return cleaned;
  };

  useEffect(() => {
    if (!isOpen) {
      // Reset form when dialog closes
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        status: 'active',
        isVerified: true,
        notes: ''
      });
      return;
    }

    // Use currentUserDetails if available (from fetchUserDetails), otherwise fallback to userData prop
    const dataToUse = currentUserDetails || userData;

    if (dataToUse) {
      // Handle phone number - strip +91 prefix if present (handle multiple +91 cases)
      let phoneValue = dataToUse.phone || dataToUse.phone_number || '';
      if (phoneValue && typeof phoneValue === 'string') {
        // Remove all instances of +91 prefix and any spaces
        phoneValue = phoneValue.replace(/^\+91\s*/g, '').replace(/\s*\+91\s*/g, '').trim();
        // If it still starts with +91, remove it one more time
        if (phoneValue.startsWith('+91')) {
          phoneValue = phoneValue.substring(3).trim();
        }
        // Also handle phone_country_code if present
        if (dataToUse.phone_country_code && phoneValue.includes(dataToUse.phone_country_code)) {
          phoneValue = phoneValue.replace(new RegExp(`^${dataToUse.phone_country_code.replace('+', '\\+')}\\s*`, 'g'), '').trim();
        }
      }

      // Handle name - split if first_name/last_name not available
      let firstName = dataToUse.firstName || dataToUse.first_name || '';
      let lastName = dataToUse.lastName || dataToUse.last_name || '';

      // If name exists but first_name/last_name don't, try to split name
      if ((!firstName && !lastName) && dataToUse.name) {
        const nameParts = dataToUse.name.trim().split(/\s+/);
        if (nameParts.length > 0) {
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ') || '';
        }
      }

      // Handle status - normalize to lowercase
      let statusValue = dataToUse.status || 'active';
      if (typeof statusValue === 'string') {
        statusValue = statusValue.toLowerCase();
      }

      setFormData({
        firstName: firstName,
        lastName: lastName,
        email: dataToUse.email || '',
        phone: phoneValue,
        address: dataToUse.address || '',
        city: dataToUse.city || '',
        state: dataToUse.state || '',
        pincode: dataToUse.pincode || dataToUse.postal_code || '',
        status: statusValue,
        isVerified: dataToUse.isVerified || dataToUse.is_verified || false,
        notes: dataToUse.notes || ''
      });
      // Reset email validation state when form is populated
      setEmailError('');
      setEmailTouched(false);
    }
  }, [isOpen, userData, currentUserDetails]);

  const validateEmail = (email: string) => {
    if (!email) {
      return 'Email is required';
    }
    if (email.length > 255) {
      return 'Email must not exceed 255 characters';
    }
    // Enhanced email regex with proper validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Validate email in real-time
    if (field === 'email') {
      if (emailTouched) {
        const error = validateEmail(value);
        setEmailError(error);
      }
      // Limit to 255 characters to prevent UI breaking
      if (value.length <= 255) {
        if (value.length > 0) {
          setEmailTouched(true);
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email before submit
    setEmailTouched(true);
    const emailValidationError = validateEmail(formData.email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    onSave({ ...userData, ...formData });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="edit" className="text-primary" />
            Edit User
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          {userDetailsLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <ContentLoader />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Limit to 100 characters
                        if (value.length > 100) {
                          toast.error("First name must not exceed 100 characters");
                          return;
                        }
                        // Allow only letters, spaces, and up to 2 special characters
                        const specialChars = value.match(/[^a-zA-Z\s]/g) || [];
                        if (specialChars.length > 2) {
                          toast.error("Only 2 special characters are allowed in First Name");
                          return;
                        }
                        handleInputChange('firstName', value);
                      }}
                      maxLength={100}
                      required
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.firstName.length}/100 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Limit to 100 characters
                        if (value.length > 100) {
                          toast.error("Last name must not exceed 100 characters");
                          return;
                        }
                        // Allow only letters, spaces, and up to 2 special characters
                        const specialChars = value.match(/[^a-zA-Z\s]/g) || [];
                        if (specialChars.length > 2) {
                          toast.error("Only 2 special characters are allowed in Last Name");
                          return;
                        }
                        handleInputChange('lastName', value);
                      }}
                      maxLength={100}
                      required
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.lastName.length}/100 characters
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      // type="email"
                      value={formData.email}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Limit to 255 characters to prevent UI breaking
                        if (value.length <= 255) {
                          handleInputChange('email', value);
                          // Validate email format in real-time
                          if (value.length > 0) {
                            setEmailTouched(true);
                          }
                        }
                      }}
                      onBlur={() => {
                        setEmailTouched(true);
                        const error = validateEmail(formData.email);
                        setEmailError(error);
                      }}
                      maxLength={255}
                      className={`mt-2 ${emailTouched && emailError ? 'border-danger' : ''}`}
                      placeholder="user@example.com"
                      required
                    />
                    {emailTouched && emailError && (
                      <div className="mt-1 min-h-[20px]">
                        <p className="text-danger text-xs break-words overflow-wrap-anywhere max-w-full">
                          {emailError}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 500) {
                        handleInputChange('address', value);
                      } else {
                        toast.error("Address must not exceed 500 characters");
                      }
                    }}
                    maxLength={500}
                    rows={3}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.address.length}/500 characters
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 50) {
                          handleInputChange('city', value);
                        } else {
                          toast.error("City must not exceed 50 characters");
                        }
                      }}
                      maxLength={50}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.city.length}/50 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 50) {
                          handleInputChange('state', value);
                        } else {
                          toast.error("State must not exceed 50 characters");
                        }
                      }}
                      maxLength={50}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.state.length}/50 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                        if (value.length <= 6) {
                          handleInputChange('pincode', value);
                        }
                      }}
                      maxLength={6}
                      pattern="[0-9]{6}"
                      className="mt-2"
                      placeholder="6 digits"
                    />
                    {formData.pincode && formData.pincode.length !== 6 && (
                      <p className="text-xs text-danger mt-1">Pincode must be exactly 6 digits</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      checked={formData.isVerified}
                      onCheckedChange={(checked) => handleInputChange('isVerified', checked)}
                    />
                    <Label>Email Verified</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 1000) {
                        handleInputChange('notes', value);
                      } else {
                        toast.error("Notes must not exceed 1000 characters");
                      }
                    }}
                    maxLength={1000}
                    rows={3}
                    className="mt-2"
                    placeholder="Additional notes about the user..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.notes.length}/1000 characters
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  <KeenIcon icon="check" className="me-2" />
                  Update User
                </Button>
              </div>
            </form>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { EditUserForm };


