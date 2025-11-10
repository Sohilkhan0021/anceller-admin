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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface IPromoCodeFormProps {
  isOpen: boolean;
  onClose: () => void;
  editMode?: boolean;
  promoData?: any;
}

const PromoCodeForm = ({ isOpen, onClose, editMode = false, promoData }: IPromoCodeFormProps) => {
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    maxUsage: '',
    expiry: new Date(),
    description: '',
    minOrderAmount: '',
    applicableServices: [] as string[],
    isActive: true
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const serviceOptions = [
    'Electrical',
    'Plumbing',
    'AC Services',
    'Cleaning',
    'Carpentry',
    'Appliance'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Form submitted:', formData);
    onClose();
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      applicableServices: prev.applicableServices.includes(service)
        ? prev.applicableServices.filter(s => s !== service)
        : [...prev.applicableServices, service]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="gift" className="text-primary" />
            {editMode ? 'Edit Promo Code' : 'Create New Promo Code'}
          </DialogTitle>
        </DialogHeader>

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
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  placeholder="e.g., WELCOME20"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="type">Discount Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="value">Discount Value *</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', e.target.value)}
                  placeholder={formData.type === 'percentage' ? '20' : '100'}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="maxUsage">Maximum Usage *</Label>
                <Input
                  id="maxUsage"
                  type="number"
                  value={formData.maxUsage}
                  onChange={(e) => handleInputChange('maxUsage', e.target.value)}
                  placeholder="100"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="expiry">Expiry Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the promo code purpose..."
                rows={3}
              />
            </div>
          </div>

          {/* Rules & Conditions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Rules & Conditions</h3>
            
            <div>
              <Label htmlFor="minOrderAmount">Minimum Order Amount (₹)</Label>
              <Input
                id="minOrderAmount"
                type="number"
                value={formData.minOrderAmount}
                onChange={(e) => handleInputChange('minOrderAmount', e.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <Label>Applicable Services</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {serviceOptions.map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={service}
                      checked={formData.applicableServices.includes(service)}
                      onChange={() => handleServiceToggle(service)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={service} className="text-sm">
                      {service}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label>Active immediately</Label>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <KeenIcon icon="gift" className="text-primary text-xl" />
                <div>
                  <div className="font-semibold text-lg">{formData.code || 'PROMO_CODE'}</div>
                  <div className="text-sm text-gray-600">
                    {formData.type === 'percentage' 
                      ? `${formData.value || '0'}% off` 
                      : `₹${formData.value || '0'} off`
                    }
                  </div>
                  <div className="text-xs text-gray-500">
                    Valid until {selectedDate ? format(selectedDate, "MMM dd, yyyy") : 'Select date'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <KeenIcon icon="check" className="me-2" />
              {editMode ? 'Update Promo Code' : 'Create Promo Code'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { PromoCodeForm };


