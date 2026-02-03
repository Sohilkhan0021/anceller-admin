import React, { useState, useCallback } from 'react';
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
import { useCreateService } from '@/services/service.hooks';
import { ContentLoader } from '@/components/loaders';

interface IAddServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: any) => void;
}

const AddServiceForm = ({ isOpen, onClose, onSave }: IAddServiceFormProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    displayOrder: 1
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const createServiceMutation = useCreateService({
    onSuccess: (data) => {
      enqueueSnackbar('Sub-Service created successfully', { 
        variant: 'solid', 
        state: 'success',
        icon: 'check-circle'
      });
      onSave(data);
      handleClose();
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to create sub-service', { 
        variant: 'solid', 
        state: 'danger',
        icon: 'cross-circle'
      });
    }
  });


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
      enqueueSnackbar('Please select an image file', { 
        variant: 'solid', 
        state: 'warning',
        icon: 'information-2'
      });
      return;
    }
    
    // Validate file size (1MB max)
    if (file.size > 1 * 1024 * 1024) {
      enqueueSnackbar('Image size must be less than 1MB', { 
        variant: 'solid', 
        state: 'warning',
        icon: 'information-2'
      });
      return;
    }
    
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  }, [enqueueSnackbar]);

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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    return true;
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      name: '',
      description: '',
      status: 'active',
      displayOrder: 1
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
      enqueueSnackbar('Please fill all required fields', { 
        variant: 'solid', 
        state: 'warning',
        icon: 'information-2'
      });
      return;
    }

    // Create service with FormData - image is optional
    createServiceMutation.mutate({
      name: formData.name,
      description: formData.description || '',
      image: imageFile || undefined, // Image is optional
      is_active: formData.status === 'active',
      sort_order: formData.displayOrder
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="category" className="text-primary" />
            Add New Sub-Service
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
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
                Sub-Service Image <span className="text-gray-600 text-xs font-normal">(Optional - can be added later)</span>
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
                    className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      isDragging 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-300 hover:border-primary'
                    }`}
                    onClick={() => document.getElementById('image-upload')?.click()}
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
                  id="image-upload"
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
            <Button type="button" variant="outline" onClick={handleClose} disabled={createServiceMutation.isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={createServiceMutation.isLoading}>
              {createServiceMutation.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white me-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <KeenIcon icon="check" className="me-2" />
                  Create Sub-Service
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

export { AddServiceForm };

