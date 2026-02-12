import React, { useState, useEffect, useCallback } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Zap,
  Droplet,
  Wind,
  Sparkles,
  Hammer,
  Settings,
  Grid,
  Home,
  ShoppingBag,
  Wrench
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';
// Icon selection components commented out - icon not working
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useUpdateCategory, useCreateCategory } from '@/services/category.hooks';
import { getImageUrl } from '@/utils/imageUrl';
import { validateImageFile, getAllowedImageTypesString, getImageValidationHint } from '@/utils/imageValidation';

interface ICategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (categoryData: any) => void;
  categoryData?: any;
}

const CategoryForm = ({ isOpen, onClose, onSave, categoryData }: ICategoryFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    icon: 'category',
    description: '',
    status: 'active' as 'active' | 'inactive',
    displayOrder: 1
  });

  // Icon-related state commented out - icon not working
  // const [iconFile, setIconFile] = useState<File | null>(null);
  // const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // const [isDraggingIcon, setIsDraggingIcon] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  const createCategoryMutation = useCreateCategory({
    onSuccess: (data) => {
      toast.success(data.message || 'Service added successfully');
      handleClose();
      // Don't call onSave here - let CategoryManagement handle the refetch
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add service');
    }
  });

  const updateCategoryMutation = useUpdateCategory({
    onSuccess: (data) => {
      toast.success(data.message || 'Service updated successfully');
      handleClose();
      // Don't call onSave here - let CategoryManagement handle the refetch
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update service');
    }
  });

  // Common icon options with Lucide icons
  const iconOptions = [
    { value: 'element-11', label: 'Electrical', lucideIcon: Zap },
    { value: 'water-drop', label: 'Water/Plumbing', lucideIcon: Droplet },
    { value: 'air-conditioner-2', label: 'AC', lucideIcon: Wind },
    { value: 'broom-2', label: 'Cleaning', lucideIcon: Sparkles },
    { value: 'hammer-2', label: 'Carpentry', lucideIcon: Hammer },
    { value: 'setting-2', label: 'Appliance', lucideIcon: Settings },
    { value: 'category', label: 'General', lucideIcon: Grid },
    { value: 'home-2', label: 'Home', lucideIcon: Home },
    { value: 'shop', label: 'Shop', lucideIcon: ShoppingBag },
    { value: 'tools', label: 'Tools', lucideIcon: Wrench }
  ];

  // Get Lucide icon component for selected icon - commented out
  // const getLucideIcon = (iconValue: string) => {
  //   const option = iconOptions.find(opt => opt.value === iconValue);
  //   return option?.lucideIcon || Grid;
  // };

  useEffect(() => {
    if (isOpen) {
      if (categoryData) {
        // Fetch and populate existing category data
        // Determine status - check both is_active and status fields
        let statusValue = 'active';
        if (categoryData.is_active === false || categoryData.is_active === 'false') {
          statusValue = 'inactive';
        } else if (categoryData.status) {
          statusValue = categoryData.status.toLowerCase() === 'inactive' ? 'inactive' : 'active';
        }
        
        setFormData({
          name: categoryData.name || '',
          icon: categoryData.icon || 'category',
          description: categoryData.description || '',
          status: statusValue as 'active' | 'inactive',
          displayOrder: categoryData.sort_order || categoryData.displayOrder || categoryData.display_order || 1
        });
        
        // Set image preview from existing service
        const imageUrl = categoryData.image_url || categoryData.imageUrl || categoryData.image;
        if (imageUrl) {
          // Use the centralized getImageUrl utility to properly construct the full URL
          // This handles both absolute URLs (http://...) and relative paths
          const fullImageUrl = getImageUrl(imageUrl);
          setImagePreview(fullImageUrl || null);
        } else {
          setImagePreview(null);
        }
        
        // Icon preview commented out - icon section not working
        // setIconPreview(null);
      } else {
        // Reset form for new service
        setFormData({
          name: '',
          icon: 'category',
          description: '',
          status: 'active',
          displayOrder: 1
        });
        // setIconPreview(null);
        setImagePreview(null);
      }
      setErrors({});
      // setIconFile(null);
      setImageFile(null);
      // setIsDraggingIcon(false);
      setIsDraggingImage(false);
    }
  }, [categoryData, isOpen]);

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

  // Icon upload handlers commented out - icon not working
  // const handleIconUpload = useCallback((files: FileList | null) => { ... }, []);
  // const handleIconFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => { ... };

  const handleImageUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate image file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setErrors(prev => ({
        ...prev,
        image: validation.error || 'Invalid image file'
      }));
      toast.error(validation.error || 'Invalid image file');
      return;
    }
    
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.image;
        return newErrors;
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleImageFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(event.target.files);
    if (event.target) {
      event.target.value = '';
    }
  };

  // const handleRemoveIcon = () => { ... }; // Commented out - icon not working

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Drag and drop handlers for icon - commented out
  // const handleIconDragEnter = useCallback((e: React.DragEvent) => { ... }, []);
  // const handleIconDragLeave = useCallback((e: React.DragEvent) => { ... }, []);
  // const handleIconDragOver = useCallback((e: React.DragEvent) => { ... }, []);
  // const handleIconDrop = useCallback((e: React.DragEvent) => { ... }, [handleIconUpload]);

  // Drag and drop handlers for image
  const handleImageDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(true);
  }, []);

  const handleImageDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
  }, []);

  const handleImageDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files);
    }
  }, [handleImageUpload]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required';
    }

    // Check for duplicate name (excluding current service)
    // In real app, this would be an API check

    if (newErrors.name) {
      setErrors(newErrors);
      return false;
    }

    return true;
  };

  const handleClose = () => {
    setFormData({
      name: '',
      icon: 'category',
      description: '',
      status: 'active',
      displayOrder: 1
    });
    // setIconPreview(null);
    setImagePreview(null);
    // setIconFile(null);
    setImageFile(null);
    setErrors({});
    // setIsDraggingIcon(false);
    setIsDraggingImage(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (categoryData) {
      // Update existing service
      const categoryId = categoryData.id || categoryData.category_id || categoryData.public_id;
      if (!categoryId) {
        toast.error('Service ID is missing');
        return;
      }

      updateCategoryMutation.mutate({
        id: categoryId,
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        // icon: iconFile || undefined, // Commented out - icon not working
        image: imageFile || undefined,
        sort_order: formData.displayOrder,
        is_active: formData.status === 'active' // Explicitly set is_active
      });
    } else {
      // Create new service - ensure name is not empty
      if (!formData.name.trim()) {
        setErrors({ name: 'Service name is required' });
        return;
      }

      createCategoryMutation.mutate({
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        // icon: iconFile || undefined, // Commented out - icon not working
        image: imageFile || undefined,
        sort_order: formData.displayOrder,
        is_active: formData.status === 'active' // Explicitly set is_active
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="category" className="text-primary" />
            {categoryData ? 'Edit Service' : 'Add New Service'}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Name */}
            <div>
              <Label htmlFor="name">
                Service Name <span className="text-danger">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`mt-2 ${errors.name ? 'border-danger' : ''}`}
                placeholder="e.g., Electrical, Plumbing"
              />
              {errors.name && (
                <p className="text-danger text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="mt-2"
                placeholder="Short tagline or description for this service..."
                maxLength={600}
              />
            </div>

            {/* Icon Selection - COMMENTED OUT - Icon not working */}
            {/* <div className="space-y-4">
              <Label>Service Icon</Label>
              ... icon selection code commented out ...
            </div> */}

            {/* Category Image - COMMENTED OUT - 1:1 image upload section */}
            {/* <div className="space-y-4">
              <Label>Service Image</Label>
              ... 1:1 image upload code commented out ...
            </div> */}

            {/* Category Image - Regular image upload (not 1:1 ratio required) */}
            <div className="space-y-4">
              <Label>Service Image</Label>
              <div>
                {imagePreview ? (
                  <div className="space-y-3">
                    <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                      <img
                        src={imagePreview}
                        alt="Image preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // If image fails to load, clear the preview
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          setImagePreview(null);
                        }}
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
                      isDraggingImage 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-300 hover:border-primary'
                    }`}
                    onClick={() => document.getElementById('image-upload')?.click()}
                    onDragEnter={handleImageDragEnter}
                    onDragOver={handleImageDragOver}
                    onDragLeave={handleImageDragLeave}
                    onDrop={handleImageDrop}
                  >
                    <KeenIcon icon="image" className={`text-2xl mb-2 ${isDraggingImage ? 'text-primary' : 'text-gray-400'}`} />
                    <p className={`text-sm ${isDraggingImage ? 'text-primary font-medium' : 'text-gray-600'}`}>
                      {isDraggingImage ? 'Drop image here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500">{getImageValidationHint()}</p>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept={getAllowedImageTypesString()}
                  onChange={handleImageFileInputChange}
                  className="hidden"
                />
                {errors.image && (
                  <p className="text-danger text-sm mt-1">{errors.image}</p>
                )}
              </div>
            </div>

            {/* Display Order */}
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
                onClick={handleClose}
                disabled={createCategoryMutation.isLoading || updateCategoryMutation.isLoading}
              >
                <KeenIcon icon="cross" className="me-2" />
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createCategoryMutation.isLoading || updateCategoryMutation.isLoading}
              >
                {(createCategoryMutation.isLoading || updateCategoryMutation.isLoading) ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white me-2">
                      
                    </div>
                    {categoryData ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <KeenIcon icon="check" className="me-2" />
                    {categoryData ? 'Update Service' : 'Create Service'}
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

export { CategoryForm };

