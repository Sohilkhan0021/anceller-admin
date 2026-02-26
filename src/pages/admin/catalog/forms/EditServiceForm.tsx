import React, { useState, useEffect, useCallback } from 'react';
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
import { toast } from 'sonner';
import { useUpdateService } from '@/services/service.hooks';
import { getImageUrl } from '@/utils/imageUrl';
import { ContentLoader } from '@/components/loaders';

interface IEditServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: any) => void;
  serviceData: any;
  availableCategories?: Array<{ id: string; name: string; public_id?: string; category_id?: string }>;
}

const EditServiceForm = ({ isOpen, onClose, onSave, serviceData, availableCategories = [] }: IEditServiceFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    status: 'active',
    displayOrder: 1,
    image_url: undefined as string | null | undefined // Track image URL for deletion
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const updateServiceMutation = useUpdateService({
    onSuccess: (data) => {
      toast.success(data.message || 'Service updated successfully');
      onSave(data);
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update service');
    }
  });


  useEffect(() => {
    if (isOpen) {
      if (serviceData && serviceData.name) {
        // Determine status - check both is_active and status fields
        let statusValue = 'active';
        if (serviceData.is_active === false || serviceData.is_active === 'false') {
          statusValue = 'inactive';
        } else if (serviceData.status) {
          statusValue = serviceData.status.toLowerCase() === 'inactive' ? 'inactive' : 'active';
        }
        
        // Extract category_id from serviceData - check multiple possible locations
        // Priority: categoryId (normalized) > category_id > category object fields
        let categoryId = serviceData.categoryId || 
                       serviceData.category_id || 
                       serviceData.category?.category_id || 
                       serviceData.category?.public_id || 
                       serviceData.category?.id || 
                       '';
        
        // If we have a categoryId, try to match it with availableCategories
        // The dropdown uses public_id || id as the value, so we need to find the matching category
        if (categoryId && availableCategories.length > 0) {
          // Try to find matching category by comparing all possible ID fields
          const matchingCategory = availableCategories.find(
            cat => {
              // Compare with all possible ID formats
              const catId = cat.public_id || cat.id || '';
              const catCategoryId = cat.category_id || '';
              return catId === categoryId || 
                     catCategoryId === categoryId ||
                     cat.id === categoryId ||
                     cat.public_id === categoryId;
            }
          );
          
          // If found, use the value format that matches the dropdown (public_id || id)
          if (matchingCategory) {
            categoryId = matchingCategory.public_id || matchingCategory.id || categoryId;
          }
        }
        
        // Debug log (remove in production)
        if (import.meta.env.DEV) {
          console.log('EditServiceForm - Category ID extraction:', {
            categoryId,
            serviceDataCategoryId: serviceData.categoryId,
            serviceDataCategory_id: serviceData.category_id,
            serviceDataCategory: serviceData.category,
            availableCategoriesCount: availableCategories.length,
            availableCategoryIds: availableCategories.map(c => ({ 
              id: c.id, 
              public_id: c.public_id, 
              category_id: c.category_id 
            }))
          });
        }
        
        setFormData({
          name: serviceData.name || '',
          description: serviceData.description || '',
          categoryId: categoryId,
          status: statusValue as 'active' | 'inactive',
          displayOrder: serviceData.sort_order || serviceData.displayOrder || serviceData.display_order || 1,
          image_url: serviceData.image_url || serviceData.imageUrl || serviceData.image || undefined
        });
        
        // Set image preview if existing image
        const imageUrl = serviceData.image_url || serviceData.imageUrl || serviceData.image;
        const fullImageUrl = getImageUrl(imageUrl);
        setImagePreview(fullImageUrl);
        
        // Clear errors when service data changes
        setErrors({});
        setImageFile(null);
        setIsDragging(false);
      } else {
        // Reset form for new service
        setFormData({
          name: '',
          description: '',
          categoryId: '',
          status: 'active',
          displayOrder: 1,
          image_url: undefined
        });
        setImagePreview(null);
        setImageFile(null);
        setErrors({});
        setIsDragging(false);
      }
    }
  }, [serviceData, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.warning('Please select an image file');
      return;
    }
    
    // Validate file size (1MB max)
    if (file.size > 1 * 1024 * 1024) {
      toast.warning('Image size must be less than 1MB');
      return;
    }
    
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(event.target.files);
    // Reset input value to allow re-uploading the same file
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    // Set image_url to null in formData so backend deletes the file
    setFormData(prev => ({
      ...prev,
      image_url: null
    }));
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files);
    }
  }, [handleImageUpload]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Sub-Service name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Sub-Service name must be at least 2 characters long';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Sub-Service name must not exceed 100 characters';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Service is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    return true;
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      status: 'active',
      displayOrder: 1,
      image_url: undefined
    });
    setImagePreview(null);
    setImageFile(null);
    setErrors({});
    setIsDragging(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.warning('Please fill all required fields');
      return;
    }

    if (!serviceData?.id && !serviceData?.service_id) {
      toast.error('Service ID is missing');
      return;
    }

    // Update service with FormData
    // Handle image deletion: if image_url is null, send null to delete; if new file, don't send image_url
    let imageUrlValue: string | null | undefined;
    if (imageFile) {
      // New file uploaded - don't send image_url (file takes precedence)
      imageUrlValue = undefined;
    } else if (formData.image_url !== undefined) {
      // image_url was explicitly set (could be null for deletion, or a string to keep existing)
      imageUrlValue = formData.image_url;
    } else {
      // No change - keep existing image_url
      imageUrlValue = serviceData?.image_url || undefined;
    }
    
    updateServiceMutation.mutate({
      id: serviceData.id || serviceData.service_id || serviceData.public_id,
      name: formData.name,
      description: formData.description || '',
      category_id: formData.categoryId, // Required: Sub-Service must belong to a Service
      image: imageFile || undefined,
      image_url: imageUrlValue, // Send null to delete image, undefined to keep existing, or string to set specific URL
      is_active: formData.status === 'active',
      sort_order: formData.displayOrder
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="edit" className="text-primary" />
            Edit Sub-Service
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div>
              <Label htmlFor="categoryId">
                Service <span className="text-danger">*</span>
              </Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => handleInputChange('categoryId', value)}
              >
                <SelectTrigger id="categoryId" className={`mt-2 ${errors.categoryId ? 'border-danger' : ''}`}>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => {
                    // Use public_id if available, otherwise use id (which could be public_id or category_id)
                    const categoryValue = category.public_id || category.id || '';
                    return (
                      <SelectItem key={categoryValue} value={categoryValue}>
                        {category.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-danger text-sm mt-1">{errors.categoryId}</p>
              )}
              {availableCategories.length === 0 && (
                <p className="text-warning text-sm mt-1">No services available. Please create a service first.</p>
              )}
            </div>

            <div>
              <Label htmlFor="name">Sub-Service Name *</Label>
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
              <Label htmlFor="description">Sub-Service Description *</Label>
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

          {/* Sub-Service Image */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Sub-Service Image</h3>
            
            <div>
              <Label htmlFor="image">
                Sub-Service Image <span className="text-gray-600 text-xs font-normal">(Optional)</span>
              </Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="space-y-3">
                    <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                      <img 
                        src={imagePreview} 
                        alt="Sub-Service preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('image-upload-edit')?.click()}
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
                    className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      isDragging 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-300 hover:border-primary'
                    }`}
                    onClick={() => document.getElementById('image-upload-edit')?.click()}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <KeenIcon icon="image" className={`text-2xl mb-2 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
                    <p className={`text-sm ${isDragging ? 'text-primary font-medium' : 'text-gray-600'}`}>
                      {isDragging ? 'Drop image here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500">Optional: PNG, JPG, WebP up to 1MB. You can skip this and add an image later.</p>
                  </div>
                )}
                <input
                  id="image-upload-edit"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Sub-Service Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Sub-Service Settings</h3>
            
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
                  </SelectContent>
                </Select>
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
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={updateServiceMutation.isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateServiceMutation.isLoading}>
              {updateServiceMutation.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white me-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <KeenIcon icon="check" className="me-2" />
                  Update Sub-Service
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

export { EditServiceForm };

