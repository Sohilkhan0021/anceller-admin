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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useSubServiceById } from '@/services/subservice.hooks';

interface ISubServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subServiceData: any) => void;
  subServiceData?: any;
  availableCategories?: any[];
  availableServices?: any[];
}

const SubServiceForm = ({ isOpen, onClose, onSave, subServiceData, availableCategories = [],availableServices = [] }: ISubServiceFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    serviceId: '',
    categoryId: '',
    icon: 'category', // Keep for backward compatibility
    image: '',
    status: 'active' as 'active' | 'inactive',
    displayOrder: 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch sub-service details when editing
  const subServiceId = subServiceData?.id || subServiceData?.sub_service_id || null;
  const { data: subServiceDetails, isLoading: isLoadingDetails } = useSubServiceById(
    subServiceId,
    { enabled: !!subServiceId && isOpen }
  );

  useEffect(() => {
    if (subServiceDetails?.data) {
      // Map API response to form data
      const apiData = subServiceDetails.data;
      const categoryId = apiData.category?.category_id || apiData.service?.category?.category_id || '';
      const serviceId = apiData.service?.service_id || '';
      const imageUrl = apiData.image_url || '';
      
      setFormData({
        name: apiData.name || '',
        serviceId: serviceId,
        categoryId: categoryId,
        icon: 'category',
        image: imageUrl,
        status: apiData.is_active ? 'active' : 'inactive',
        displayOrder: apiData.sort_order || 1
      });
      
      // Set image preview if image exists
      if (imageUrl) {
        // If it's a full URL, use it directly; otherwise construct the full URL
        const fullImageUrl = imageUrl.startsWith('http') 
          ? imageUrl 
          : `${import.meta.env.VITE_API_URL || ''}${imageUrl}`;
        setImagePreview(fullImageUrl);
      } else {
        setImagePreview(null);
      }
    } else if (subServiceData) {
      // Fallback to passed subServiceData (for backward compatibility)
      setFormData({
        name: subServiceData.name || '',
        serviceId: subServiceData.serviceId || subServiceData.service_id || '',
        categoryId: subServiceData.categoryId || subServiceData.category?.category_id || '',
        icon: subServiceData.icon || 'category',
        image: subServiceData.image || subServiceData.image_url || '',
        status: subServiceData.status || (subServiceData.is_active ? 'active' : 'inactive'),
        displayOrder: subServiceData.displayOrder || subServiceData.sort_order || 1
      });
      setImagePreview(subServiceData.image || subServiceData.image_url || null);
    } else {
      // Reset form for new sub-service
      setFormData({
        name: '',
        serviceId: '',
        categoryId: '',
        icon: 'category',
        image: '',
        status: 'active',
        displayOrder: 1
      });
      setImagePreview(null);
    }
    setErrors({});
  }, [subServiceDetails, subServiceData, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          image: 'Please select a valid image file'
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: 'Image size should be less than 5MB'
        }));
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData(prev => ({
          ...prev,
          image: result // Store as base64 or you can upload to server
        }));
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.image) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
      }
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
    // Reset file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Sub-service name is required';
    }
    if (!formData.serviceId) {
      newErrors.serviceId = 'Service is required';
    }

    // Category is optional - it will be auto-filled from service if not provided
    // Removed category validation requirement

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

    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="category" className="text-primary" />
            {subServiceData ? 'Edit Sub-Service' : 'Add New Sub-Service'}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          {isLoadingDetails && subServiceId ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading sub-service details...</p>
              </div>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sub-Service Name */}
            <div>
              <Label htmlFor="name">
                Sub-Service Name <span className="text-danger">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`mt-2 ${errors.name ? 'border-danger' : ''}`}
                placeholder="e.g., Fan Installation, AC Deep Service"
              />
              {errors.name && (
                <p className="text-danger text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Service */}
            <div>
              <Label>
                Service <span className="text-danger">*</span>
              </Label>

              <Select
                value={formData.serviceId}
                onValueChange={(value) => {
                  handleInputChange('serviceId', value);
                  // Auto-fill category from selected service
                  const selectedService = availableServices.find(s => s.id === value);
                  if (selectedService && selectedService.category_id) {
                    handleInputChange('categoryId', selectedService.category_id);
                  }
                }}
              >
                <SelectTrigger className={`mt-2 ${errors.serviceId ? 'border-danger' : ''}`}>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>

                <SelectContent>
                  {availableServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.serviceId && (
                <p className="text-danger text-sm mt-1">{errors.serviceId}</p>
              )}
            </div>


            {/* Category - Auto-filled from service, but can be overridden */}
            <div>
              <Label htmlFor="categoryId">
                Category <span className="text-muted text-xs">(Auto-filled from service)</span>
              </Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => handleInputChange('categoryId', value)}
              >
                <SelectTrigger className={`mt-2 ${errors.categoryId ? 'border-danger' : ''}`}>
                  <SelectValue placeholder="Select category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-danger text-sm mt-1">{errors.categoryId}</p>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <Label htmlFor="image-upload">
                Image <span className="text-muted text-xs">(Optional)</span>
              </Label>
              <div className="mt-2">
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={`cursor-pointer ${errors.image ? 'border-danger' : ''}`}
                />
                {errors.image && (
                  <p className="text-danger text-sm mt-1">{errors.image}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: Square image, max 5MB (JPG, PNG, GIF)
                </p>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4 flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-300 bg-white flex-shrink-0">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Image Preview</p>
                    <p className="text-xs text-gray-600 mb-3">
                      This image will be displayed in the sub-service table
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveImage}
                    >
                      <KeenIcon icon="trash" className="me-2" />
                      Remove Image
                    </Button>
                  </div>
                </div>
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
                {subServiceData ? 'Update Sub-Service' : 'Create Sub-Service'}
              </Button>
            </div>
          </form>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { SubServiceForm };

