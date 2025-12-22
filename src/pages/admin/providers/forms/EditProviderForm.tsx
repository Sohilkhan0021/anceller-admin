import { useState, useEffect } from 'react';
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

interface IEditProviderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (providerData: any) => void;
  providerData: any;
}

const EditProviderForm = ({ isOpen, onClose, onSave, providerData }: IEditProviderFormProps) => {
  const [formData, setFormData] = useState({
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
  });

  // Fetch categories from API
  const { categories, isLoading: isLoadingCategories } = useCategories({
    page: 1,
    limit: 100, // Get all categories
    status: 'active',
  }, {
    enabled: isOpen, // Only fetch when modal is open
  });

  useEffect(() => {
    if (providerData && isOpen) {
      // Map provider data from API response to form fields
      // Handle both list view (basic provider) and detail view (with user object)
      const user = providerData.user || {};
      const serviceCategories = providerData.service_categories || providerData.serviceCategories || [];
      const primaryCategory = serviceCategories.find((sc: any) => sc.is_primary) || serviceCategories[0];
      
      // Extract name from user object or provider name field
      const fullName = user.name || providerData.name || '';
      const nameParts = fullName.split(' ');
      const firstName = user.first_name || nameParts[0] || providerData.first_name || providerData.firstName || '';
      const lastName = user.last_name || nameParts.slice(1).join(' ') || providerData.last_name || providerData.lastName || '';
      
      // Extract phone - remove country code if present
      const phoneRaw = user.phone || user.phone_number || providerData.phone || providerData.phone_number || '';
      const phone = phoneRaw.replace(/^\+\d{1,3}\s*/, ''); // Remove country code
      
      setFormData({
        firstName,
        lastName,
        email: user.email || providerData.email || '',
        phone,
        serviceCategory: primaryCategory?.category_id || primaryCategory?.public_id || primaryCategory?.id || providerData.serviceCategory || '',
        experience: providerData.experience || '',
        address: providerData.address || '',
        city: providerData.city || '',
        state: providerData.state || '',
        pincode: providerData.pincode || providerData.zipCode || '',
        kycStatus: (providerData.kyc_status || providerData.kycStatus || 'pending').toLowerCase(),
        status: (providerData.status || 'active').toLowerCase(),
        isVerified: user.is_email_verified || providerData.isVerified || false,
        bankAccount: providerData.bank_account_number || providerData.bankAccount || '',
        ifscCode: providerData.bank_ifsc || providerData.ifscCode || '',
        panNumber: providerData.pan_number || providerData.panNumber || '',
        aadhaarNumber: providerData.aadhaarNumber || providerData.aadhaar_number || '',
        notes: providerData.notes || ''
      });
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
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
      });
    }
  }, [providerData, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...providerData, ...formData });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col z-[100]">
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="edit" className="text-primary" />
            Edit Provider
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex-1 overflow-y-auto pt-6">
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
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="mt-2"
                />
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

          {/* Service Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Service Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serviceCategory">Service Category *</Label>
                <Select 
                  value={formData.serviceCategory} 
                  onValueChange={(value) => handleInputChange('serviceCategory', value)}
                  disabled={isLoadingCategories}
                >
                  <SelectTrigger className="mt-2">
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
              </div>
              
              <div>
                <Label htmlFor="experience">Experience (Years)</Label>
                <Input
                  id="experience"
                  type="number"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
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
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
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
                  value={formData.panNumber}
                  onChange={(e) => handleInputChange('panNumber', e.target.value)}
                  className="mt-2"
                  placeholder="ABCDE1234F"
                />
              </div>
              
              <div>
                <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                <Input
                  id="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)}
                  className="mt-2"
                  placeholder="1234 5674 9012"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="kycStatus">KYC Status</Label>
              <Select value={formData.kycStatus} onValueChange={(value) => handleInputChange('kycStatus', value)}>
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
                  value={formData.bankAccount}
                  onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  value={formData.ifscCode}
                  onChange={(e) => handleInputChange('ifscCode', e.target.value)}
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
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
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
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="mt-2"
                placeholder="Additional notes about the provider..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white pb-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <KeenIcon icon="check" className="me-2" />
              Update Provider
            </Button>
          </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { EditProviderForm };

