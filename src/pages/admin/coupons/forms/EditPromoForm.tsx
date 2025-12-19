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

  const promoTypes = [
    { value: 'percentage', label: 'Percentage Discount' },
    { value: 'fixed', label: 'Fixed Amount Discount' },
    { value: 'free_delivery', label: 'Free Delivery' },
    { value: 'buy_one_get_one', label: 'Buy One Get One' }
  ];

  useEffect(() => {
    if (promoData) {
      setFormData({
        code: promoData.code || '',
        name: promoData.name || '',
        description: promoData.description || '',
        type: promoData.type || 'percentage',
        value: promoData.value || '',
        minOrderAmount: promoData.minOrderAmount || '',
        maxDiscount: promoData.maxDiscount || '',
        usageLimit: promoData.usageLimit || '',
        usageCount: promoData.usageCount || '0',
        startDate: promoData.startDate ? new Date(promoData.startDate) : new Date(),
        endDate: promoData.endDate ? new Date(promoData.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: promoData.isActive !== undefined ? promoData.isActive : true,
        applicableServices: promoData.applicableServices || '',
        userRestrictions: promoData.userRestrictions || '',
        terms: promoData.terms || ''
      });
      setStartDate(promoData.startDate ? new Date(promoData.startDate) : new Date());
      setEndDate(promoData.endDate ? new Date(promoData.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    }
  }, [promoData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
                    className="mt-2"
                    placeholder="e.g., SAVE20"
                    maxLength={20}
                  />
                </div>

                <div>
                  <Label htmlFor="name">Promo Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="mt-2"
                    placeholder="e.g., Summer Sale 20% Off"
                  />
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
                    className="mt-2"
                    placeholder={formData.type === 'percentage' ? 'e.g., 20' : 'e.g., 100'}
                    min="0"
                    max={formData.type === 'percentage' ? '100' : undefined}
                  />
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
                    className="mt-2"
                    placeholder="e.g., 500"
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="maxDiscount">Maximum Discount (₹)</Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => handleInputChange('maxDiscount', e.target.value)}
                    className="mt-2"
                    placeholder="e.g., 200"
                    min="0"
                  />
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
                    className="mt-2"
                    placeholder="e.g., 1000 (leave empty for unlimited)"
                    min="1"
                  />
                </div>

                <div>
                  <Label htmlFor="usageCount">Current Usage Count</Label>
                  <Input
                    id="usageCount"
                    type="number"
                    value={formData.usageCount}
                    onChange={(e) => handleInputChange('usageCount', e.target.value)}
                    className="mt-2"
                    placeholder="0"
                    min="0"
                  />
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
                          !startDate && "text-muted-foreground"
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
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-2",
                          !endDate && "text-muted-foreground"
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
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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

