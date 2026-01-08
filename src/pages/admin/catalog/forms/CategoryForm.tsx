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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useSnackbar } from 'notistack';
import { useUpdateCategory, useCreateCategory } from '@/services/category.hooks';

interface ICategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: any) => void;
  categoryData?: any;
}

const CategoryForm = ({ isOpen, onClose, onSave, categoryData }: ICategoryFormProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    name: '',
    icon: 'category',
    description: '',
    status: 'active' as 'active' | 'inactive',
    displayOrder: 1
  });

  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDraggingIcon, setIsDraggingIcon] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  const createCategoryMutation = useCreateCategory({
    onSuccess: (data) => {
      enqueueSnackbar('Category created successfully', { 
        variant: 'solid', 
        state: 'success',
        icon: 'check-circle'
      });
      onSave(data);
      handleClose();
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to create category', { 
        variant: 'solid', 
        state: 'danger',
        icon: 'cross-circle'
      });
    }
  });

  const updateCategoryMutation = useUpdateCategory({
    onSuccess: (data) => {
      enqueueSnackbar('Category updated successfully', { 
        variant: 'solid', 
        state: 'success',
        icon: 'check-circle'
      });
      onSave(data);
      handleClose();
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to update category', { 
        variant: 'solid', 
        state: 'danger',
        icon: 'cross-circle'
      });
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

  // Get Lucide icon component for selected icon
  const getLucideIcon = (iconValue: string) => {
    const option = iconOptions.find(opt => opt.value === iconValue);
    return option?.lucideIcon || Grid;
  };

  useEffect(() => {
    if (categoryData) {
      setFormData({
        name: categoryData.name || '',
        icon: categoryData.icon || 'category',
        description: categoryData.description || '',
        status: categoryData.status || (categoryData.is_active === false ? 'inactive' : 'active'),
        displayOrder: categoryData.sort_order || categoryData.displayOrder || 1
      });
      
      // Set icon preview
      const iconUrl = categoryData.icon_url || categoryData.iconUrl;
      if (iconUrl) {
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';
        const fullIconUrl = iconUrl.startsWith('http') 
          ? iconUrl 
          : `${baseUrl}${iconUrl.startsWith('/') ? iconUrl : '/' + iconUrl}`;
        setIconPreview(fullIconUrl);
      } else {
        setIconPreview(null);
      }
      
      // Set image preview
      const imageUrl = categoryData.image_url || categoryData.imageUrl;
      if (imageUrl) {
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';
        const fullImageUrl = imageUrl.startsWith('http') 
          ? imageUrl 
          : `${baseUrl}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
        setImagePreview(fullImageUrl);
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData({
        name: '',
        icon: 'category',
        description: '',
        status: 'active',
        displayOrder: 1
      });
      setIconPreview(null);
      setImagePreview(null);
    }
    setErrors({});
    setIconFile(null);
    setImageFile(null);
    setIsDraggingIcon(false);
    setIsDraggingImage(false);
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

  const handleIconUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        icon: 'Only PNG, JPG, or SVG files are allowed'
      }));
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        icon: 'Icon size must be less than 5MB'
      }));
      return;
    }

    // Validate square dimensions (approximate check)
    const img = new Image();
    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const ratio = width / height;

      if (ratio < 0.9 || ratio > 1.1) {
        setErrors(prev => ({
          ...prev,
          icon: 'Icon must be square (1:1 ratio)'
        }));
        return;
      }

      setIconFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setIconPreview(result);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.icon;
          return newErrors;
        });
      };
      reader.readAsDataURL(file);
    };
    img.onerror = () => {
      setErrors(prev => ({
        ...prev,
        icon: 'Invalid image file'
      }));
    };
    img.src = URL.createObjectURL(file);
  }, []);

  const handleIconFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleIconUpload(event.target.files);
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleImageUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({
        ...prev,
        image: 'Please select an image file'
      }));
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        image: 'Image size must be less than 5MB'
      }));
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

  const handleRemoveIcon = () => {
    setIconFile(null);
    setIconPreview(null);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Drag and drop handlers for icon
  const handleIconDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingIcon(true);
  }, []);

  const handleIconDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingIcon(false);
  }, []);

  const handleIconDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleIconDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingIcon(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleIconUpload(e.dataTransfer.files);
    }
  }, [handleIconUpload]);

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
      newErrors.name = 'Category name is required';
    }

    // Check for duplicate name (excluding current category)
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
    setIconPreview(null);
    setImagePreview(null);
    setIconFile(null);
    setImageFile(null);
    setErrors({});
    setIsDraggingIcon(false);
    setIsDraggingImage(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (categoryData) {
      // Update existing category
      if (!categoryData.id && !categoryData.category_id) {
        enqueueSnackbar('Category ID is missing', { 
          variant: 'solid', 
          state: 'danger',
          icon: 'cross-circle'
        });
        return;
      }

      updateCategoryMutation.mutate({
        id: categoryData.id || categoryData.category_id || categoryData.public_id,
        name: formData.name,
        description: formData.description || '',
        icon: iconFile || undefined,
        image: imageFile || undefined,
        sort_order: formData.displayOrder,
        is_active: formData.status === 'active',
      });
    } else {
      // Create new category
      createCategoryMutation.mutate({
        name: formData.name,
        description: formData.description || '',
        icon: iconFile || undefined,
        image: imageFile || undefined,
        sort_order: formData.displayOrder,
        is_active: formData.status === 'active',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="category" className="text-primary" />
            {categoryData ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Name */}
            <div>
              <Label htmlFor="name">
                Category Name <span className="text-danger">*</span>
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
                placeholder="Short tagline or description for this category..."
              />
            </div>

            {/* Icon Selection */}
            <div className="space-y-4">
              <Label>Category Icon</Label>

              {/* Icon Preset Selection */}
              <div>
                <Label htmlFor="icon-select" className="text-sm text-gray-600">
                  Select Preset Icon
                </Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => handleInputChange('icon', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => {
                      const LucideIconComponent = icon.lucideIcon || Grid;
                      return (
                        <SelectItem key={icon.value} value={icon.value}>
                          <div className="flex items-center gap-2">
                            <LucideIconComponent className="h-4 w-4" />
                            {icon.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Icon Preview */}
              {formData.icon && !iconPreview && (() => {
                const SelectedLucideIcon = getLucideIcon(formData.icon);
                return (
                  <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                    <div className="p-3 bg-primary-light rounded-lg">
                      <SelectedLucideIcon className="text-primary h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Selected Icon</p>
                      <p className="text-xs text-gray-600">Or upload a custom icon below</p>
                    </div>
                  </div>
                );
              })()}

              {/* Custom Icon Upload */}
              <div>
                <Label htmlFor="icon-upload" className="text-sm text-gray-600">
                  Or Upload Custom Icon (PNG/SVG, Square 1:1 ratio)
                </Label>
                <div className="mt-2">
                  {iconPreview ? (
                    <div className="space-y-3">
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <img
                          src={iconPreview}
                          alt="Icon preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('icon-upload')?.click()}
                        >
                          <KeenIcon icon="pencil" className="me-2" />
                          Change Icon
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveIcon}
                        >
                          <KeenIcon icon="cross" className="me-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        isDraggingIcon 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => document.getElementById('icon-upload')?.click()}
                      onDragEnter={handleIconDragEnter}
                      onDragOver={handleIconDragOver}
                      onDragLeave={handleIconDragLeave}
                      onDrop={handleIconDrop}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <KeenIcon icon="file-up" className={`text-3xl mb-2 ${isDraggingIcon ? 'text-primary' : 'text-gray-400'}`} />
                        <p className={`text-sm ${isDraggingIcon ? 'text-primary font-medium' : 'text-gray-600'}`}>
                          {isDraggingIcon ? 'Drop icon here' : <><span className="font-semibold">Click to upload</span> or drag and drop</>}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, SVG, JPG (Square images only)
                        </p>
                        <p className="text-xs text-danger mt-1 font-medium">
                          Icon must be square (1:1 ratio)
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    id="icon-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    className="hidden"
                    onChange={handleIconFileInputChange}
                  />
                  {errors.icon && (
                    <p className="text-danger text-sm mt-1">{errors.icon}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Category Image */}
            <div className="space-y-4">
              <Label>Category Image</Label>
              <div>
                {imagePreview ? (
                  <div className="space-y-3">
                    <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                      <img
                        src={imagePreview}
                        alt="Image preview"
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
                    <p className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB</p>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
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
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white me-2"></div>
                    {categoryData ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <KeenIcon icon="check" className="me-2" />
                    {categoryData ? 'Update Category' : 'Create Category'}
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

