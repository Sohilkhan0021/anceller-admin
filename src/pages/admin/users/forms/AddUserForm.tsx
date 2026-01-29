import { useState } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
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
import * as Yup from 'yup';
import { useFormik } from 'formik';

interface IAddUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => Promise<void> | void;
}

const addUserSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(100, 'First name must not exceed 100 characters')
    .matches(/^[a-zA-Z\s]{0,98}[a-zA-Z0-9\s]{0,2}$/, 'Only letters, spaces, and up to 2 special characters allowed')
    .trim()
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(100, 'Last name must not exceed 100 characters')
    .matches(/^[a-zA-Z\s]{0,98}[a-zA-Z0-9\s]{0,2}$/, 'Only letters, spaces, and up to 2 special characters allowed')
    .trim()
    .required('Last name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must not exceed 255 characters')
    .matches(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/, 'Please enter a valid email address')
    .required('Email is required'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number (starting with 6-9)'),
  countryCode: Yup.string()
    .matches(/^\+\d{1,4}$/, 'Country code must be in E.164 format (e.g., +91)')
    .default('+91'),
  address: Yup.string()
    .min(10, 'Address must be at least 10 characters long')
    .max(500, 'Address must not exceed 500 characters'),
  city: Yup.string()
    .min(2, 'City must be at least 2 characters long')
    .max(50, 'City must not exceed 50 characters'),
  state: Yup.string()
    .min(2, 'State must be at least 2 characters long')
    .max(50, 'State must not exceed 50 characters'),
  pincode: Yup.string()
    .matches(/^\d{6}$/, 'Pincode must be exactly 6 digits')
    .required('Pincode is required'),
  status: Yup.string().required('Status is required'),
  notes: Yup.string().max(1000, 'Notes must not exceed 1000 characters')
});

const AddUserForm = ({ isOpen, onClose, onSave }: IAddUserFormProps) => {
  const formik = useFormik({
    initialValues: {
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
    },
    validationSchema: addUserSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        await onSave(values);
        formik.resetForm();
        onClose();
      } catch (error: any) {
        // Handle API validation errors - check both error.errors and error.response.data.errors
        const apiErrors = error?.errors || error?.response?.data?.errors;

        if (apiErrors) {
          if (Array.isArray(apiErrors)) {
            apiErrors.forEach((err: any) => {
              const field = err.field;
              const msg = err.message || 'Invalid value';
              const fieldName = field === 'email' ? 'email' :
                field === 'phone_number' ? 'phone' :
                  field === 'first_name' ? 'firstName' :
                    field === 'last_name' ? 'lastName' :
                      field === 'postal_code' ? 'pincode' : field;

              if (fieldName === 'email') {
                setFieldError('email', 'Please enter a valid email address');
              } else {
                setFieldError(fieldName, msg);
              }
            });
          } else if (typeof apiErrors === 'object') {
            Object.keys(apiErrors).forEach((field) => {
              const fieldName = field === 'email' ? 'email' :
                field === 'phone_number' ? 'phone' :
                  field === 'first_name' ? 'firstName' :
                    field === 'last_name' ? 'lastName' :
                      field === 'postal_code' ? 'pincode' : field;
              const errorMessage = Array.isArray(apiErrors[field])
                ? apiErrors[field][0]
                : apiErrors[field];
              if (fieldName === 'email') {
                setFieldError('email', 'Please enter a valid email address');
              } else {
                setFieldError(fieldName, errorMessage || 'Invalid value');
              }
            });
          }
        } else if (error?.response?.data?.message || error?.message) {
          // Handle single error message
          const errorMessage = error.response?.data?.message || error.message;
          // Try to extract field from error message
          if (errorMessage.toLowerCase().includes('email')) {
            setFieldError('email', 'Please enter a valid email address');
          } else if (errorMessage.toLowerCase().includes('phone')) {
            setFieldError('phone', errorMessage);
          } else if (errorMessage.toLowerCase().includes('first name') || errorMessage.toLowerCase().includes('first_name')) {
            setFieldError('firstName', errorMessage);
          } else if (errorMessage.toLowerCase().includes('last name') || errorMessage.toLowerCase().includes('last_name')) {
            setFieldError('lastName', errorMessage);
          } else {
            // Show general error on email field as fallback
            setFieldError('email', 'Please enter a valid email address');
          }
        } else {
          console.error('Failed to create user:', error);
        }
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleInputChange = (field: string, value: any) => {
    formik.setFieldValue(field, value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="user" className="text-primary" />
            Add New User
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={formik.handleSubmit} className="space-y-6" noValidate>
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter first name"
                    value={formik.values.firstName}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length > 100) {
                        toast.error("First name must not exceed 100 characters");
                        return;
                      }
                      const specialChars = value.match(/[^a-zA-Z\s]/g) || [];
                      if (specialChars.length > 2) {
                        toast.error("Only 2 special characters are allowed in First Name");
                        return;
                      }
                      formik.handleChange(e);
                    }}
                    onBlur={formik.handleBlur}
                    maxLength={100}
                    className={`mt-2 ${formik.touched.firstName && formik.errors.firstName ? 'border-danger' : ''}`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formik.values.firstName.length}/100 characters
                  </p>
                  {formik.touched.firstName && formik.errors.firstName && (
                    <p className="text-danger text-xs mt-1 break-words max-w-full">
                      {formik.errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter last name"
                    value={formik.values.lastName}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length > 100) {
                        toast.error("Last name must not exceed 100 characters");
                        return;
                      }
                      const specialChars = value.match(/[^a-zA-Z\s]/g) || [];
                      if (specialChars.length > 2) {
                        toast.error("Only 2 special characters are allowed in Last Name");
                        return;
                      }
                      formik.handleChange(e);
                    }}
                    onBlur={formik.handleBlur}
                    maxLength={100}
                    className={`mt-2 ${formik.touched.lastName && formik.errors.lastName ? 'border-danger' : ''}`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formik.values.lastName.length}/100 characters
                  </p>
                  {formik.touched.lastName && formik.errors.lastName && (
                    <p className="text-danger text-xs mt-1 break-words max-w-full">
                      {formik.errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formik.values.email}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Limit to 255 characters to prevent UI breaking
                      if (value.length <= 255) {
                        formik.handleChange(e);
                        // Validate email format in real-time
                        if (value.length > 0) {
                          formik.setFieldTouched('email', true, false);
                        }
                      }
                    }}
                    onBlur={formik.handleBlur}
                    maxLength={255}
                    className={`mt-2 ${formik.touched.email && formik.errors.email ? 'border-danger' : ''}`}
                    placeholder="enter@example.com"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <div className="mt-1 min-h-[20px]">
                      <p className="text-danger text-xs break-words overflow-wrap-anywhere max-w-full">
                        {formik.errors.email}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    type="tel"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`mt-2 ${formik.touched.phone && formik.errors.phone ? 'border-danger' : ''}`}
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <p className="text-danger text-xs mt-1 break-words max-w-full">
                      {formik.errors.phone}
                    </p>
                  )}
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
                  placeholder="Enter full address"
                  value={formik.values.address}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 500) {
                      formik.handleChange(e);
                    } else {
                      toast.error("Address must not exceed 500 characters");
                    }
                  }}
                  onBlur={formik.handleBlur}
                  maxLength={500}
                  rows={3}
                  className={`mt-2 ${formik.touched.address && formik.errors.address ? 'border-danger' : ''}`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formik.values.address.length}/500 characters
                </p>
                {formik.touched.address && formik.errors.address && (
                  <p className="text-danger text-xs mt-1 break-words max-w-full">
                    {formik.errors.address}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Enter city"
                    value={formik.values.city}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 50) {
                        formik.handleChange(e);
                      } else {
                        toast.error("City must not exceed 50 characters");
                      }
                    }}
                    onBlur={formik.handleBlur}
                    maxLength={50}
                    className={`mt-2 ${formik.touched.city && formik.errors.city ? 'border-danger' : ''}`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formik.values.city.length}/50 characters
                  </p>
                  {formik.touched.city && formik.errors.city && (
                    <p className="text-danger text-xs mt-1 break-words max-w-full">
                      {formik.errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="Enter state"
                    value={formik.values.state}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 50) {
                        formik.handleChange(e);
                      } else {
                        toast.error("State must not exceed 50 characters");
                      }
                    }}
                    onBlur={formik.handleBlur}
                    maxLength={50}
                    className={`mt-2 ${formik.touched.state && formik.errors.state ? 'border-danger' : ''}`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formik.values.state.length}/50 characters
                  </p>
                  {formik.touched.state && formik.errors.state && (
                    <p className="text-danger text-xs mt-1 break-words max-w-full">
                      {formik.errors.state}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    placeholder="Enter Pincode (6 digits)"
                    value={formik.values.pincode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                      if (value.length <= 6) {
                        formik.setFieldValue('pincode', value);
                      }
                    }}
                    onBlur={formik.handleBlur}
                    maxLength={6}
                    pattern="[0-9]{6}"
                    className={`mt-2 ${formik.touched.pincode && formik.errors.pincode ? 'border-danger' : ''}`}
                  />
                  {formik.touched.pincode && formik.errors.pincode && (
                    <p className="text-danger text-xs mt-1 break-words max-w-full">
                      {formik.errors.pincode}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formik.values.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger className={`mt-2 ${formik.touched.status && formik.errors.status ? 'border-danger' : ''}`}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {formik.touched.status && formik.errors.status && (
                    <p className="text-danger text-xs mt-1 break-words max-w-full">
                      {formik.errors.status}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    checked={formik.values.isVerified}
                    onCheckedChange={(checked) => handleInputChange('isVerified', checked)}
                  />
                  <Label>Email Verified</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formik.values.notes}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 1000) {
                      formik.handleChange(e);
                    } else {
                      toast.error("Notes must not exceed 1000 characters");
                    }
                  }}
                  onBlur={formik.handleBlur}
                  maxLength={1000}
                  rows={3}
                  className={`mt-2 ${formik.touched.notes && formik.errors.notes ? 'border-danger' : ''}`}
                  placeholder="Additional notes about the user..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formik.values.notes.length}/1000 characters
                </p>
                {formik.touched.notes && formik.errors.notes && (
                  <p className="text-danger text-xs mt-1 break-words max-w-full">
                    {formik.errors.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={formik.isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={formik.isSubmitting}>
                {formik.isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white me-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <KeenIcon icon="check" className="me-2" />
                    Create User
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { AddUserForm };


