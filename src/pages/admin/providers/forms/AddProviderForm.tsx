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
import { Switch } from '@/components/ui/switch';
import { useCategories } from '@/services/category.hooks';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { toast } from 'sonner';

interface IAddProviderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (providerData: any) => Promise<any>;
}

const addProviderSchema = Yup.object().shape({
  firstName: Yup.string()
    .max(30, 'First name must not exceed 30 characters')
    .trim()
    .required('First name is required'),
  lastName: Yup.string()
    .max(30, 'Last name must not exceed 30 characters')
    .trim()
    .required('Last name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must not exceed 255 characters')
    .required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  serviceCategory: Yup.string().required('Service category is required'),
  notes: Yup.string().max(1000, 'Notes must not exceed 1000 characters')
});

const AddProviderForm = ({ isOpen, onClose, onSave }: IAddProviderFormProps) => {
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      serviceCategory: '',
      experience: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      kycStatus: 'pending',
      status: 'active',
      isVerified: false,
      bankAccount: '',
      ifscCode: '',
      panNumber: '',
      aadhaarNumber: '',
      notes: ''
    },
    validationSchema: addProviderSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting, setFieldError, resetForm }) => {
      try {
        const response = await onSave(values);
        toast.success(response?.message || 'Provider created successfully');
        resetForm();
        onClose();
      } catch (error: any) {
        // Handle API validation errors - check both error.errors and error.response.data.errors
        const apiErrors = error?.errors || error?.response?.data?.errors;
        let mainErrorMessage = error?.response?.data?.message || error?.message || 'Failed to create provider';

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
              if (!mainErrorMessage) mainErrorMessage = msg;
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
              if (!mainErrorMessage) mainErrorMessage = errorMessage;
            });
          }
        } else if (error?.response?.data?.message || error?.message) {
          const errorMessage = error.response?.data?.message || error.message;
          if (errorMessage.toLowerCase().includes('email')) {
            setFieldError('email', 'Please enter a valid email address');
          } else if (errorMessage.toLowerCase().includes('phone')) {
            setFieldError('phone', errorMessage);
          } else if (errorMessage.toLowerCase().includes('first name') || errorMessage.toLowerCase().includes('first_name')) {
            setFieldError('firstName', errorMessage);
          } else if (errorMessage.toLowerCase().includes('last name') || errorMessage.toLowerCase().includes('last_name')) {
            setFieldError('lastName', errorMessage);
          }
        }

        toast.error(mainErrorMessage);
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Fetch categories from API
  const { categories, isLoading: isLoadingCategories } = useCategories({
    page: 1,
    limit: 100, // Get all categories
    status: 'active',
  }, {
    enabled: isOpen, // Only fetch when modal is open
  });

  const handleSelectChange = (field: string, value: any) => {
    formik.setFieldValue(field, value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="shop" className="text-primary" />
            Add New Provider
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
                    name="firstName"
                    value={formik.values.firstName}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, 30);
                      formik.setFieldValue('firstName', value);
                    }}
                    onBlur={formik.handleBlur}
                    required
                    maxLength={30}
                    className={`mt-2 ${formik.touched.firstName && formik.errors.firstName ? 'border-danger' : ''}`}
                  />
                  <div className="flex justify-between mt-1">
                    {formik.touched.firstName && formik.errors.firstName ? (
                      <p className="text-danger text-xs">{formik.errors.firstName}</p>
                    ) : <div></div>}
                    <p className="text-xs text-gray-500">
                      {formik.values.firstName.length} / 30
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formik.values.lastName}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, 30);
                      formik.setFieldValue('lastName', value);
                    }}
                    onBlur={formik.handleBlur}
                    required
                    maxLength={30}
                    className={`mt-2 ${formik.touched.lastName && formik.errors.lastName ? 'border-danger' : ''}`}
                  />
                  <div className="flex justify-between mt-1">
                    {formik.touched.lastName && formik.errors.lastName ? (
                      <p className="text-danger text-xs">{formik.errors.lastName}</p>
                    ) : <div></div>}
                    <p className="text-xs text-gray-500">
                      {formik.values.lastName.length} / 30
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
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
                    required
                    maxLength={255}
                    className={`mt-2 ${formik.touched.email && formik.errors.email ? 'border-danger' : ''}`}
                    placeholder="provider@example.com"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-danger text-xs mt-1">{formik.errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                    className={`mt-2 ${formik.touched.phone && formik.errors.phone ? 'border-danger' : ''}`}
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <p className="text-danger text-xs mt-1">{formik.errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Service Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="serviceCategory">Service Category *</Label>
                  <Select
                    value={formik.values.serviceCategory}
                    onValueChange={(value) => handleSelectChange('serviceCategory', value)}
                    disabled={isLoadingCategories}
                  >
                    <SelectTrigger className={`mt-2 ${formik.touched.serviceCategory && formik.errors.serviceCategory ? 'border-danger' : ''}`}>
                      <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select service category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingCategories ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : categories.length === 0 ? (
                        <SelectItem value="no-categories" disabled>
                          No categories available
                        </SelectItem>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category.id || category.public_id} value={category.id || category.public_id || ''}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {formik.touched.serviceCategory && formik.errors.serviceCategory && (
                    <p className="text-danger text-xs mt-1">{formik.errors.serviceCategory}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="experience">Experience (Years)</Label>
                  <Input
                    id="experience"
                    name="experience"
                    type="number"
                    min={0}
                    max={100}
                    value={formik.values.experience}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="mt-2"
                    placeholder="e.g., 5"
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
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formik.values.state}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    value={formik.values.pincode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* KYC Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">KYC Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="panNumber">PAN Number</Label>
                  <Input
                    id="panNumber"
                    name="panNumber"
                    value={formik.values.panNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="mt-2"
                    placeholder="ABCDE1234F"
                  />
                </div>

                <div>
                  <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                  <Input
                    id="aadhaarNumber"
                    name="aadhaarNumber"
                    value={formik.values.aadhaarNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="mt-2"
                    placeholder="1234 5678 9012"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="kycStatus">KYC Status</Label>
                <Select value={formik.values.kycStatus} onValueChange={(value) => handleSelectChange('kycStatus', value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select KYC status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bank Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Bank Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankAccount">Account Number</Label>
                  <Input
                    id="bankAccount"
                    name="bankAccount"
                    value={formik.values.bankAccount}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    name="ifscCode"
                    value={formik.values.ifscCode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="mt-2"
                    placeholder="SBIN0001234"
                  />
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formik.values.status} onValueChange={(value) => handleSelectChange('status', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    checked={formik.values.isVerified}
                    onCheckedChange={(checked) => handleSelectChange('isVerified', checked)}
                  />
                  <Label>Email Verified</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={3}
                  className={`mt-2 ${formik.touched.notes && formik.errors.notes ? 'border-danger' : ''}`}
                  placeholder="Additional notes about the provider..."
                />
                {formik.touched.notes && formik.errors.notes && (
                  <p className="text-danger text-xs mt-1">{formik.errors.notes}</p>
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
                    Create Provider
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

export { AddProviderForm };