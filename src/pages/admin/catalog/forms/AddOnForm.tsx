import { useState, useEffect } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

interface IAddOnFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (addOnData: any) => void;
  addOnData?: any;
  availableServices?: any[];
}

const AddOnForm = ({ isOpen, onClose, onSave, addOnData, availableServices = [] }: IAddOnFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    isPerUnit: false,
    status: 'active' as 'active' | 'inactive',
    appliesTo: [] as string[]
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (addOnData) {
      setFormData({
        name: addOnData.name || '',
        price: addOnData.price?.toString() || '',
        isPerUnit: addOnData.isPerUnit || false,
        status: addOnData.status || 'active',
        appliesTo: addOnData.appliesTo || []
      });
    } else {
      setFormData({
        name: '',
        price: '',
        isPerUnit: false,
        status: 'active',
        appliesTo: []
      });
    }
    setErrors({});
  }, [addOnData, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      appliesTo: prev.appliesTo.includes(serviceId)
        ? prev.appliesTo.filter(id => id !== serviceId)
        : [...prev.appliesTo, serviceId]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Add-on name is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.appliesTo.length === 0) {
      newErrors.appliesTo = 'Select at least one service';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const addOnDataToSave = {
      ...formData,
      price: parseFloat(formData.price)
    };

    onSave(addOnDataToSave);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="plus" className="text-primary" />
            {addOnData ? 'Edit Add-On' : 'Add New Add-On'}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Add-On Name */}
            <div>
              <Label htmlFor="name">
                Add-On Name <span className="text-danger">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`mt-2 ${errors.name ? 'border-danger' : ''}`}
                placeholder="e.g., Extra Power Outlet, Pipe Extra Length"
              />
              {errors.name && (
                <p className="text-danger text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">
                  Price (₹) <span className="text-danger">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className={`mt-2 ${errors.price ? 'border-danger' : ''}`}
                  placeholder="200"
                />
                {errors.price && (
                  <p className="text-danger text-sm mt-1">{errors.price}</p>
                )}
              </div>

              {/* Per Unit Toggle */}
              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  id="isPerUnit"
                  checked={formData.isPerUnit}
                  onCheckedChange={(checked) => handleInputChange('isPerUnit', checked)}
                />
                <Label htmlFor="isPerUnit" className="cursor-pointer">
                  Per Unit Pricing
                  <span className="text-xs text-gray-500 block">
                    Charge per quantity instead of flat price
                  </span>
                </Label>
              </div>
            </div>

            {/* Applies To Services */}
            <div>
              <Label>
                Applies To Services <span className="text-danger">*</span>
              </Label>
              <div className={`mt-2 border rounded-lg p-4 max-h-60 overflow-y-auto ${errors.appliesTo ? 'border-danger' : 'border-gray-200'}`}>
                {availableServices.length === 0 ? (
                  <p className="text-sm text-gray-500">No services available</p>
                ) : (
                  <div className="space-y-3">
                    {availableServices.map((service) => (
                      <div key={service.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`service-${service.id}`}
                          checked={formData.appliesTo.includes(service.id)}
                          onCheckedChange={() => handleServiceToggle(service.id)}
                        />
                        <Label
                          htmlFor={`service-${service.id}`}
                          className="cursor-pointer flex-1"
                        >
                          <div className="font-medium">{service.name}</div>
                          <div className="text-xs text-gray-600">{service.category}</div>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.appliesTo && (
                <p className="text-danger text-sm mt-1">{errors.appliesTo}</p>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={formData.status === 'active'}
                onCheckedChange={(checked) => 
                  handleInputChange('status', checked ? 'active' : 'inactive')
                }
              />
              <Label htmlFor="status" className="cursor-pointer">
                {formData.status === 'active' ? 'Active' : 'Inactive'}
              </Label>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                <KeenIcon icon="cross" className="me-2" />
                Cancel
              </Button>
              <Button type="submit">
                <KeenIcon icon="check" className="me-2" />
                {addOnData ? 'Update Add-On' : 'Create Add-On'}
              </Button>
            </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { AddOnForm };

