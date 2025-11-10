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
import { useSnackbar } from 'notistack';

interface IAddServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: any) => void;
}

const AddServiceForm = ({ isOpen, onClose, onSave }: IAddServiceFormProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    name: '',
    subServiceId: '', // Service belongs to a sub-service
    category: '', // Auto-filled from sub-service
    description: '',
    basePrice: '',
    duration: '60',
    status: 'active',
    isPopular: false,
    materials: '',
    requirements: '',
    notes: '',
    image: '',
    displayOrder: 1,
    skills: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Mock sub-services - in real app, this would come from API based on selected category
  const subServices = [
    { id: '1', name: 'Fan Installation', categoryId: 'electrical', category: 'Electrical' },
    { id: '2', name: 'Electrical Wiring', categoryId: 'electrical', category: 'Electrical' },
    { id: '3', name: 'Switch Board Repair', categoryId: 'electrical', category: 'Electrical' },
    { id: '4', name: 'Pipe Repair', categoryId: 'plumbing', category: 'Plumbing' },
    { id: '5', name: 'Tap Repair', categoryId: 'plumbing', category: 'Plumbing' },
    { id: '6', name: 'AC Deep Service', categoryId: 'ac', category: 'AC Services' },
    { id: '7', name: 'Home Cleaning', categoryId: 'cleaning', category: 'Cleaning' },
    { id: '8', name: 'Furniture Repair', categoryId: 'carpentry', category: 'Carpentry' },
    { id: '9', name: 'Door Repair', categoryId: 'carpentry', category: 'Carpentry' },
    { id: '10', name: 'Washing Machine Repair', categoryId: 'appliance', category: 'Appliance' }
  ];

  // Get sub-services filtered by category when category is selected
  const availableSubServices = formData.category 
    ? subServices.filter(sub => sub.categoryId === formData.category.toLowerCase())
    : subServices;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({
          ...prev,
          image: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.subServiceId) {
      newErrors.subServiceId = 'Sub-service is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
      newErrors.basePrice = 'Price must be greater than 0';
    }

    if (!formData.duration) {
      newErrors.duration = 'Duration is required';
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
      enqueueSnackbar('Please fill all required fields', { 
        variant: 'solid', 
        state: 'warning',
        icon: 'information-2'
      });
      return;
    }

    onSave(formData);
    enqueueSnackbar('Service created successfully', { 
      variant: 'solid', 
      state: 'success',
      icon: 'check-circle'
    });
    onClose();
    // Reset form
    setFormData({
      name: '',
      subServiceId: '',
      category: '',
      description: '',
      basePrice: '',
      duration: '60',
      status: 'active',
      isPopular: false,
      materials: '',
      requirements: '',
      notes: '',
      image: '',
      displayOrder: 1,
      skills: ''
    });
    setImagePreview(null);
    setImageFile(null);
    setErrors({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="category" className="text-primary" />
            Add New Service
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`mt-2 ${errors.name ? 'border-danger' : ''}`}
                  placeholder="e.g., Standard Fan Installation, Premium AC Service"
                />
                {errors.name && (
                  <p className="text-danger text-sm mt-1">{errors.name}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => {
                    handleInputChange('category', value);
                    handleInputChange('subServiceId', ''); // Reset sub-service when category changes
                  }}
                >
                  <SelectTrigger className={`mt-2 ${errors.category ? 'border-danger' : ''}`}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="ac">AC Services</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="carpentry">Carpentry</SelectItem>
                    <SelectItem value="appliance">Appliance</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-danger text-sm mt-1">{errors.category}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="subServiceId">Sub-Service *</Label>
                <Select 
                  value={formData.subServiceId} 
                  onValueChange={(value) => {
                    const selectedSubService = subServices.find(s => s.id === value);
                    handleInputChange('subServiceId', value);
                    if (selectedSubService) {
                      handleInputChange('category', selectedSubService.categoryId);
                    }
                  }}
                  disabled={!formData.category}
                >
                  <SelectTrigger className={`mt-2 ${errors.subServiceId ? 'border-danger' : ''}`}>
                    <SelectValue placeholder={formData.category ? "Select sub-service" : "Select category first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubServices.map((subService) => (
                      <SelectItem key={subService.id} value={subService.id}>
                        {subService.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subServiceId && (
                  <p className="text-danger text-sm mt-1">{errors.subServiceId}</p>
                )}
                {!formData.category && (
                  <p className="text-xs text-gray-500 mt-1">Please select a category first</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Service Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className={`mt-2 ${errors.description ? 'border-danger' : ''}`}
                placeholder="Describe the service in detail..."
              />
              {errors.description && (
                <p className="text-danger text-sm mt-1">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Service Image */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Service Image</h3>
            
            <div>
              <Label htmlFor="image">Service Image</Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="space-y-3">
                    <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                      <img 
                        src={imagePreview} 
                        alt="Service preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        <KeenIcon icon="pencil" className="me-2" />
                        Change Image
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={handleRemoveImage}
                      >
                        <KeenIcon icon="cross" className="me-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <KeenIcon icon="image" className="text-gray-400 text-2xl mb-2" />
                    <p className="text-sm text-gray-600">Click to upload service image</p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Duration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Pricing & Duration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="basePrice">Base Price (₹) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => handleInputChange('basePrice', e.target.value)}
                  className={`mt-2 ${errors.basePrice ? 'border-danger' : ''}`}
                  placeholder="e.g., 500"
                />
                {errors.basePrice && (
                  <p className="text-danger text-sm mt-1">{errors.basePrice}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="duration">Estimated Duration (minutes) *</Label>
                <Select 
                  value={formData.duration} 
                  onValueChange={(value) => handleInputChange('duration', value)}
                >
                  <SelectTrigger className={`mt-2 ${errors.duration ? 'border-danger' : ''}`}>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="180">3 hours</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                  </SelectContent>
                </Select>
                {errors.duration && (
                  <p className="text-danger text-sm mt-1">{errors.duration}</p>
                )}
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Service Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="skills">Required Skills / Tags (Display Only)</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => handleInputChange('skills', e.target.value)}
                  className="mt-2"
                  placeholder="e.g., Licensed, Certified, Experienced"
                />
                <p className="text-xs text-gray-500 mt-1">For display purposes only</p>
              </div>

              <div>
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  min="1"
                  value={formData.displayOrder}
                  onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 1)}
                  className="mt-2"
                  placeholder="1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="materials">Materials / Recommended Consumption</Label>
              <Textarea
                id="materials"
                value={formData.materials}
                onChange={(e) => handleInputChange('materials', e.target.value)}
                rows={3}
                className="mt-2"
                placeholder="List materials or recommended consumption/parts..."
              />
            </div>

            <div>
              <Label htmlFor="requirements">Special Requirements</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                rows={3}
                className="mt-2"
                placeholder="Any special requirements or conditions..."
              />
            </div>
          </div>

          {/* Service Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Service Settings</h3>
            
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
                    <SelectItem value="maintenance">Under Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  checked={formData.isPopular}
                  onCheckedChange={(checked) => handleInputChange('isPopular', checked)}
                />
                <Label>Popular Service</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Admin Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="mt-2"
                placeholder="Internal notes about this service..."
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
              Create Service
            </Button>
          </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { AddServiceForm };

