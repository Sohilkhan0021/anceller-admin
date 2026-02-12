import React, { useState, useEffect } from 'react';
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
import { getImageUrl } from '@/utils/imageUrl';
import { validateImageFile, getAllowedImageTypesString, getImageValidationHint } from '@/utils/imageValidation';

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
    image: null as File | null,
    image_url: '',
    status: 'active' as 'active' | 'inactive',
    displayOrder: 1,
    base_price: '' as string | number,
    currency: 'INR',
    duration_minutes: '' as string | number
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch sub-service details when editing
  const subServiceId = subServiceData?.id || subServiceData?.sub_service_id || subServiceData?.public_id || null;
  const { data: subServiceDetails, isLoading: isLoadingDetails } = useSubServiceById(
    subServiceId,
    { enabled: !!subServiceId && isOpen }
  );

  useEffect(() => {
    if (isOpen) {
      // Priority: API response > passed subServiceData > reset form
      // Handle nested response structure: data.sub_service (from getSubServiceById)
      const responseData = (subServiceDetails as any)?.data;
      const apiData = responseData?.sub_service || responseData?.data?.sub_service || responseData?.data || responseData || subServiceDetails;
      
      // Debug: Log to see the structure
      if (import.meta.env.DEV && responseData) {
        console.log('SubService API Response:', { 
          responseData, 
          apiData,
          hasImageUrl: 'image_url' in (apiData || {}),
          imageUrlValue: apiData?.image_url,
          imageUrlType: typeof apiData?.image_url,
          allKeys: apiData ? Object.keys(apiData) : []
        });
      }
      if (apiData && apiData.name) {
        // Map API response to form data
        const categoryId = apiData.category?.category_id || apiData.service?.category?.category_id || apiData.category_id || '';
        const serviceId = apiData.service?.service_id || apiData.service_id || '';
        // Use sub-service's own image_url - handle null, undefined, and empty string
        // image_url can be null (explicitly cleared), undefined (not set), or a string (URL)
        const imageUrl = apiData.image_url !== undefined && apiData.image_url !== null && apiData.image_url !== '' 
          ? apiData.image_url 
          : (apiData.image || apiData.imageUrl || apiData.image_path || '');
        
        setFormData({
          name: apiData.name || '',
          serviceId: serviceId,
          categoryId: categoryId,
          icon: 'category',
          image: null,
          image_url: imageUrl,
          status: apiData.is_active === false ? 'inactive' : (apiData.status === 'inactive' ? 'inactive' : 'active'),
          displayOrder: apiData.sort_order || apiData.displayOrder || 1,
          base_price: apiData.base_price || '',
          currency: 'INR', // Currency is always INR
          duration_minutes: apiData.duration_minutes || apiData.estimated_duration_minutes || ''
        });
        
        // Set image preview if image exists
        const fullImageUrl = getImageUrl(imageUrl);
        setImagePreview(fullImageUrl);
      } else if (subServiceData && subServiceData.name) {
        // Fallback to passed subServiceData (for backward compatibility)
        // Use sub-service's own image_url only (no fallback to icon_url)
        const imageUrl = subServiceData.image_url || subServiceData.imageUrl || subServiceData.image || subServiceData.image_path || '';
        setFormData({
          name: subServiceData.name || '',
          serviceId: subServiceData.serviceId || subServiceData.service_id || '',
          categoryId: subServiceData.categoryId || subServiceData.category?.category_id || '',
          icon: subServiceData.icon || 'category',
          image: null,
          image_url: imageUrl,
          status: subServiceData.is_active === false ? 'inactive' : (subServiceData.status === 'inactive' ? 'inactive' : 'active'),
          displayOrder: subServiceData.displayOrder || subServiceData.sort_order || subServiceData.display_order || 1,
          base_price: subServiceData.base_price || '',
          currency: 'INR', // Currency is always INR
          duration_minutes: subServiceData.duration_minutes || subServiceData.estimated_duration_minutes || ''
        });
        
        // Set image preview
        const fullImageUrl = getImageUrl(imageUrl);
        setImagePreview(fullImageUrl);
      } else {
        // Reset form for new sub-service
        setFormData({
          name: '',
          serviceId: '',
          categoryId: '',
          icon: 'category',
          image: null,
          image_url: '',
          status: 'active',
          displayOrder: 1,
          base_price: '',
          currency: 'INR', // Currency is always INR
          duration_minutes: ''
        });
        setImagePreview(null);
      }
      setErrors({});
      setIsSubmitting(false); // Reset submitting state when dialog opens/closes
    }
  }, [subServiceDetails, subServiceData, isOpen]);

  // Reset submitting state when form closes
  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen]);

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
      // Validate image file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setErrors(prev => ({
          ...prev,
          image: validation.error || 'Invalid image file'
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
          image: file // Store the File object for upload
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
      image: null,
      image_url: ''
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
      newErrors.name = 'Item name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Item name must be at least 2 characters long';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Item name must not exceed 100 characters';
    }
    if (!formData.serviceId) {
      newErrors.serviceId = 'Sub-Service is required';
    }
    if (!formData.base_price || formData.base_price === '') {
      newErrors.base_price = 'Base price is required';
    } else if (isNaN(Number(formData.base_price)) || Number(formData.base_price) < 0) {
      newErrors.base_price = 'Base price must be a valid number greater than or equal to 0';
    }
    if (!formData.duration_minutes || formData.duration_minutes === '') {
      newErrors.duration_minutes = 'Duration (minutes) is required';
    } else if (isNaN(Number(formData.duration_minutes)) || Number(formData.duration_minutes) < 1) {
      newErrors.duration_minutes = 'Duration must be at least 1 minute';
    }

    // Category is optional - it will be auto-filled from service if not provided
    // Removed category validation requirement

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔵 Form submit triggered', { 
      isSubmitting, 
      formData: {
        name: formData.name,
        serviceId: formData.serviceId,
        base_price: formData.base_price,
        duration_minutes: formData.duration_minutes,
        status: formData.status
      }
    });

    const isValid = validateForm();
    console.log('🔵 Form validation result:', { isValid, errors });
    
    if (!isValid) {
      console.log('❌ Form validation failed, errors:', errors);
      return;
    }
    
    if (isSubmitting) {
      console.log('❌ Form is already submitting, ignoring');
      return;
    }

    // Set submitting state to prevent multiple clicks
    setIsSubmitting(true);
    console.log('✅ Starting form submission...');

    try {
      // CRITICAL: Ensure File object is preserved when passing to onSave
      console.log('🔵 SubServiceForm - Submitting form data:', {
        hasImage: !!formData.image,
        imageType: typeof formData.image,
        isFile: formData.image instanceof File,
        imageName: formData.image instanceof File ? formData.image.name : 'not a file',
        imageSize: formData.image instanceof File ? formData.image.size : 'not a file',
        image_url: formData.image_url,
        formData: {
          name: formData.name,
          serviceId: formData.serviceId,
          base_price: formData.base_price,
          duration_minutes: formData.duration_minutes,
          status: formData.status
        }
      });

      // Create a copy of formData to ensure File object is preserved
      const dataToSave = {
        ...formData,
        // Explicitly preserve the File object if it exists
        image: formData.image instanceof File ? formData.image : (formData.image || null)
      };

      console.log('🔵 Calling onSave with data:', dataToSave);
      
      // Wait for onSave to complete (it's async)
      await onSave(dataToSave);
      
      console.log('✅ onSave completed successfully');
    } catch (error) {
      // Error is already handled in handleSaveSubService, just reset submitting state
      console.error('❌ Form submission error:', error);
    } finally {
      // Always reset submitting state
      console.log('🔵 Resetting isSubmitting state');
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="category" className="text-primary" />
            {subServiceData ? 'Edit Item' : 'Add New Item'}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          {isLoadingDetails && subServiceId ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading item details...</p>
              </div>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Name */}
            <div>
              <Label htmlFor="name">
                Item Name <span className="text-danger">*</span>
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

            {/* Sub-Service */}
            <div>
              <Label htmlFor="serviceId">
                Sub-Service <span className="text-danger">*</span>
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
                <SelectTrigger id="serviceId" className={`mt-2 ${errors.serviceId ? 'border-danger' : ''}`}>
                  <SelectValue placeholder="Select sub-service" />
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
            {/* Commented out for edit mode - category should not be editable */}
            {/* {!subServiceData && (
              <div>
                <Label htmlFor="categoryId">
                  Category <span className="text-muted text-xs">(Auto-filled from service)</span>
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => handleInputChange('categoryId', value)}
                >
                  <SelectTrigger id="categoryId" className={`mt-2 ${errors.categoryId ? 'border-danger' : ''}`}>
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
            )} */}

            {/* Base Price and Currency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="base_price">
                  Base Price <span className="text-danger">*</span>
                </Label>
                <Input
                  id="base_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.base_price}
                  onChange={(e) => handleInputChange('base_price', e.target.value)}
                  className={`mt-2 ${errors.base_price ? 'border-danger' : ''}`}
                  placeholder="0.00"
                />
                {errors.base_price && (
                  <p className="text-danger text-sm mt-1">{errors.base_price}</p>
                )}
              </div>
              <div>
                <Label htmlFor="currency">
                  Currency <span className="text-danger">*</span>
                </Label>
                <Input
                  id="currency"
                  value="INR"
                  disabled
                  className="mt-2 bg-gray-100"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Currency is fixed to INR</p>
              </div>
            </div>

            {/* Duration */}
            <div>
              <Label htmlFor="duration_minutes">
                Duration (Minutes) <span className="text-danger">*</span>
              </Label>
              <Input
                id="duration_minutes"
                type="number"
                min="1"
                max="1440"
                value={formData.duration_minutes}
                onChange={(e) => handleInputChange('duration_minutes', e.target.value)}
                className={`mt-2 ${errors.duration_minutes ? 'border-danger' : ''}`}
                placeholder="e.g., 60"
              />
              {errors.duration_minutes && (
                <p className="text-danger text-sm mt-1">{errors.duration_minutes}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Duration in minutes (1-1440 minutes, max 24 hours)
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <Label htmlFor="image-upload">
                Image <span className="text-gray-600 text-xs">(Optional)</span>
              </Label>
              <div className="mt-2">
                <Input
                  id="image-upload"
                  type="file"
                  accept={getAllowedImageTypesString()}
                  onChange={handleImageChange}
                  className={`cursor-pointer ${errors.image ? 'border-danger' : ''}`}
                />
                {errors.image && (
                  <p className="text-danger text-sm mt-1">{errors.image}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: Square image. {getImageValidationHint()}
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
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                <KeenIcon icon="cross" className="me-2" />
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                onClick={(e) => {
                  console.log('Submit button clicked directly');
                  // Let the form handle submission, but log for debugging
                  if (isSubmitting) {
                    e.preventDefault();
                    console.log('❌ Button click prevented - already submitting');
                    return;
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white me-2"></div>
                    {subServiceData ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                <>
                  <KeenIcon icon="check" className="me-2" />
                  {subServiceData ? 'Update Item' : 'Create Item'}
                </>
              )}
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

