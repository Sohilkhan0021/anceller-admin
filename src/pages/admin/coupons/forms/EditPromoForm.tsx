import React, { useState, useEffect } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
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
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface IEditPromoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promoData: any) => void;
  promoData?: any;
}

const EditPromoForm = ({ isOpen, onClose, onSave, promoData }: IEditPromoFormProps) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: '',
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: '',
    usageCount: '0',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
    applicableServices: '',
    userRestrictions: '',
    terms: ''
  });

  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const promoTypes = [
    { value: 'percentage', label: 'Percentage Discount' },
    { value: 'fixed', label: 'Fixed Amount Discount' }
    // Removed: free_delivery, buy_one_get_one
  ];

  useEffect(() => {
    if (isOpen && promoData) {
      // Map API data to form data - handle both camelCase and snake_case
      const couponType = promoData.type || promoData.coupon_type || 'percentage';
      const normalizedType = couponType === 'PERCENTAGE' ? 'percentage' : (couponType === 'FLAT_AMOUNT' ? 'fixed' : couponType.toLowerCase());
      const discountValue = promoData.value || promoData.discount_value || '';
      const minAmount = promoData.minOrderAmount || promoData.min_order_amount || '';
      const maxDiscount = promoData.maxDiscount || promoData.max_discount || '';
      const usageLimit = promoData.usageLimit || promoData.max_usage || promoData.maxUsage || '';
      const usageCount = promoData.usageCount || promoData.usage_count || promoData.usage?.current || '0';
      const validFrom = promoData.startDate || promoData.valid_from;
      const validUntil = promoData.endDate || promoData.endDate || promoData.expiry || promoData.valid_until;
      
      setFormData({
        code: promoData.code || '',
        name: promoData.name || '',
        description: promoData.description || '',
        type: normalizedType,
        value: discountValue.toString(),
        minOrderAmount: minAmount ? minAmount.toString() : '',
        maxDiscount: maxDiscount ? maxDiscount.toString() : '',
        usageLimit: usageLimit ? usageLimit.toString() : '',
        usageCount: usageCount.toString(),
        startDate: validFrom ? new Date(validFrom) : new Date(),
        endDate: validUntil ? new Date(validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: promoData.isActive !== undefined ? promoData.isActive : (promoData.is_active !== false),
        applicableServices: promoData.applicableServices || '',
        userRestrictions: promoData.userRestrictions || '',
        terms: promoData.terms || ''
      });
      const start = validFrom ? new Date(validFrom) : new Date();
      const end = validUntil ? new Date(validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      // Ensure dates are not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (start < today) {
        setStartDate(today);
      } else {
        setStartDate(start);
      }
      
      if (end < today) {
        setEndDate(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000));
      } else {
        setEndDate(end);
      }
      
      setErrors({});
    } else if (isOpen) {
      // Reset form when opening without data
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setStartDate(today);
      setEndDate(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000));
      setErrors({});
    }
  }, [promoData, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when field is changed
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      // Prevent selecting past dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        setErrors(prev => ({
          ...prev,
          startDate: 'Start date cannot be in the past'
        }));
        return;
      }
      
      // If end date is before new start date, update end date
      if (endDate && selectedDate > endDate) {
        setEndDate(selectedDate);
      }
      
      setStartDate(date);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.startDate;
        return newErrors;
      });
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      // Prevent selecting past dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        setErrors(prev => ({
          ...prev,
          endDate: 'End date cannot be in the past'
        }));
        return;
      }
      
      // Ensure end date is after start date
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        if (selectedDate < start) {
          setErrors(prev => ({
            ...prev,
            endDate: 'End date must be after start date'
          }));
          return;
        }
      }
      
      setEndDate(date);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.endDate;
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate promo code
    if (!formData.code || formData.code.trim() === '') {
      newErrors.code = 'Promo code is required';
    } else if (formData.code.length < 3) {
      newErrors.code = 'Promo code must be at least 3 characters';
    } else if (formData.code.length > 20) {
      newErrors.code = 'Promo code must not exceed 20 characters';
    }

    // Validate promo name
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Promo name is required';
    }

    // Validate discount value
    if (!formData.value || formData.value.trim() === '') {
      newErrors.value = 'Discount value is required';
    } else {
      const value = parseFloat(formData.value);
      if (isNaN(value) || value < 0) {
        newErrors.value = 'Discount value must be a positive number';
      } else if (formData.type === 'percentage' && value > 100) {
        newErrors.value = 'Percentage discount cannot exceed 100%';
      }
    }

    // Validate min order amount
    if (formData.minOrderAmount && formData.minOrderAmount.trim() !== '') {
      const minAmount = parseFloat(formData.minOrderAmount);
      if (isNaN(minAmount) || minAmount < 0) {
        newErrors.minOrderAmount = 'Minimum order amount must be a positive number';
      }
    }

    // Validate max discount
    if (formData.maxDiscount && formData.maxDiscount.trim() !== '') {
      const maxDiscount = parseFloat(formData.maxDiscount);
      if (isNaN(maxDiscount) || maxDiscount < 0) {
        newErrors.maxDiscount = 'Maximum discount must be a positive number';
      } else if (formData.minOrderAmount && formData.minOrderAmount.trim() !== '') {
        const minAmount = parseFloat(formData.minOrderAmount);
        if (maxDiscount > minAmount) {
          newErrors.maxDiscount = 'Maximum discount cannot be greater than minimum order amount';
        }
      }
    }

    // Validate usage limit
    if (formData.usageLimit && formData.usageLimit.trim() !== '') {
      const usageLimit = parseInt(formData.usageLimit);
      const usageCount = parseInt(formData.usageCount || '0');
      if (isNaN(usageLimit) || usageLimit < 1) {
        newErrors.usageLimit = 'Usage limit must be at least 1';
      } else if (usageLimit < usageCount) {
        newErrors.usageLimit = 'Usage limit cannot be less than current usage count';
      }
    }

    // Validate usage count
    if (formData.usageCount && formData.usageCount.trim() !== '') {
      const usageCount = parseInt(formData.usageCount);
      if (isNaN(usageCount) || usageCount < 0) {
        newErrors.usageCount = 'Usage count must be a non-negative number';
      }
    }

    // Validate dates
    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (start < today) {
        newErrors.startDate = 'Start date cannot be in the past';
      }
    }

    if (!endDate) {
      newErrors.endDate = 'End date is required';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);
      if (end < today) {
        newErrors.endDate = 'End date cannot be in the past';
      } else if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (end < start) {
          newErrors.endDate = 'End date must be after start date';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Show first error message
      const firstError = Object.values(errors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }
    
    onSave({
      ...formData,
      startDate,
      endDate
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="pencil" className="text-primary" />
            Edit Promo Code
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Promo Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                    required
                    className={`mt-2 ${errors.code ? 'border-danger' : ''}`}
                    placeholder="e.g., SAVE20"
                    maxLength={20}
                  />
                  {errors.code && (
                    <p className="text-danger text-xs mt-1">{errors.code}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="name">Promo Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className={`mt-2 ${errors.name ? 'border-danger' : ''}`}
                    placeholder="e.g., Summer Sale 20% Off"
                  />
                  {errors.name && (
                    <p className="text-danger text-xs mt-1">{errors.name}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="mt-2"
                  placeholder="Describe the promo code offer..."
                />
              </div>
            </div>

            {/* Discount Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Discount Configuration</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Discount Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                    <SelectContent>
                      {promoTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="value">
                    {formData.type === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (₹)'} *
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => handleInputChange('value', e.target.value)}
                    required
                    className={`mt-2 ${errors.value ? 'border-danger' : ''}`}
                    placeholder={formData.type === 'percentage' ? 'e.g., 20' : 'e.g., 100'}
                    min="0"
                    max={formData.type === 'percentage' ? '100' : undefined}
                    step={formData.type === 'percentage' ? '0.01' : '1'}
                  />
                  {errors.value && (
                    <p className="text-danger text-xs mt-1">{errors.value}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minOrderAmount">Minimum Order Amount (₹)</Label>
                  <Input
                    id="minOrderAmount"
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => handleInputChange('minOrderAmount', e.target.value)}
                    className={`mt-2 ${errors.minOrderAmount ? 'border-danger' : ''}`}
                    placeholder="e.g., 500"
                    min="0"
                    step="0.01"
                  />
                  {errors.minOrderAmount && (
                    <p className="text-danger text-xs mt-1">{errors.minOrderAmount}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="maxDiscount">Maximum Discount (₹)</Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => handleInputChange('maxDiscount', e.target.value)}
                    className={`mt-2 ${errors.maxDiscount ? 'border-danger' : ''}`}
                    placeholder="e.g., 200"
                    min="0"
                    step="0.01"
                  />
                  {errors.maxDiscount && (
                    <p className="text-danger text-xs mt-1">{errors.maxDiscount}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Usage Limits */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Usage Limits</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="usageLimit">Total Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => handleInputChange('usageLimit', e.target.value)}
                    className={`mt-2 ${errors.usageLimit ? 'border-danger' : ''}`}
                    placeholder="e.g., 1000 (leave empty for unlimited)"
                    min="1"
                  />
                  {errors.usageLimit && (
                    <p className="text-danger text-xs mt-1">{errors.usageLimit}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="usageCount">Current Usage Count</Label>
                  <Input
                    id="usageCount"
                    type="number"
                    value={formData.usageCount}
                    onChange={(e) => handleInputChange('usageCount', e.target.value)}
                    className={`mt-2 ${errors.usageCount ? 'border-danger' : ''} bg-gray-100`}
                    placeholder="0"
                    min="0"
                    disabled={true}
                    readOnly={true}
                  />
                  <p className="text-xs text-gray-500 mt-1">This field is read-only and cannot be edited</p>
                  {errors.usageCount && (
                    <p className="text-danger text-xs mt-1">{errors.usageCount}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Validity Period */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Validity Period</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-2",
                          !startDate && "text-muted-foreground",
                          errors.startDate && "border-danger"
                        )}
                      >
                        <KeenIcon icon="calendar" className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={handleStartDateChange}
                        initialFocus
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.startDate && (
                    <p className="text-danger text-xs mt-1">{errors.startDate}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-2",
                          !endDate && "text-muted-foreground",
                          errors.endDate && "border-danger"
                        )}
                      >
                        <KeenIcon icon="calendar" className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={handleEndDateChange}
                        initialFocus
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const minDate = startDate ? new Date(startDate) : today;
                          minDate.setHours(0, 0, 0, 0);
                          return date < minDate;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.endDate && (
                    <p className="text-danger text-xs mt-1">{errors.endDate}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Restrictions & Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Restrictions & Settings</h3>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Active Promo Code</Label>
              </div>

              <div>
                <Label htmlFor="applicableServices">Applicable Services</Label>
                <Textarea
                  id="applicableServices"
                  value={formData.applicableServices}
                  onChange={(e) => handleInputChange('applicableServices', e.target.value)}
                  rows={2}
                  className="mt-2"
                  placeholder="Enter service IDs or categories (comma-separated)..."
                />
              </div>

              <div>
                <Label htmlFor="userRestrictions">User Restrictions</Label>
                <Textarea
                  id="userRestrictions"
                  value={formData.userRestrictions}
                  onChange={(e) => handleInputChange('userRestrictions', e.target.value)}
                  rows={2}
                  className="mt-2"
                  placeholder="e.g., New users only, First-time customers..."
                />
              </div>

              <div>
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={formData.terms}
                  onChange={(e) => handleInputChange('terms', e.target.value)}
                  rows={3}
                  className="mt-2"
                  placeholder="Enter terms and conditions for this promo code..."
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
                Update Promo Code
              </Button>
            </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { EditPromoForm };

