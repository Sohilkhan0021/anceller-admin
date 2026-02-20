import { useState, useEffect } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { IBanner } from '@/services/banner.types';
import { getImageUrl } from '@/utils/imageUrl';
import { validateImageFile, getAllowedImageTypesString, getImageValidationHint } from '@/utils/imageValidation';
import { useCategories } from '@/services';

interface IAddEditBannerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bannerData: any) => Promise<void> | void;
  bannerData?: IBanner | null;
}

const AddEditBannerForm = ({ isOpen, onClose, onSave, bannerData }: IAddEditBannerFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    is_active: true,
    banner_type: 'offer' as 'offer' | 'buy_banner',
    category_id: '' as string | null
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories for dropdown
  const { categories, isLoading: isLoadingCategories } = useCategories({
    page: 1,
    limit: 100,
    status: 'active'
  }, {
    enabled: isOpen // Only fetch when form is open
  });

  useEffect(() => {
    if (bannerData) {
      setFormData({
        title: bannerData.title || '',
        is_active: bannerData.is_active ?? true,
        banner_type: (bannerData.banner_type || 'offer') as 'offer' | 'buy_banner',
        category_id: bannerData.category_id || null
      });
      if (bannerData.image_url) {
        const imageUrl = getImageUrl(bannerData.image_url);
        setImagePreview(imageUrl || null);
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData({
        title: '',
        is_active: true,
        banner_type: 'offer' as 'offer' | 'buy_banner',
        category_id: null
      });
      setImagePreview(null);
    }
    setErrors({});
    setImageFile(null);
  }, [bannerData, isOpen]);

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

  const compressImage = (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            file.type,
            quality
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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

      try {
        // Compress image if it's larger than 500KB to avoid 413 errors
        let processedFile = file;
        if (file.size > 500 * 1024) { // 500KB
          // Show loading state
          setErrors(prev => ({
            ...prev,
            image: 'Compressing image...'
          }));

          processedFile = await compressImage(file, 1920, 0.85);
        }

        setImageFile(processedFile);
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setImagePreview(result);
          // Clear image error
          if (errors.image) {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.image;
              return newErrors;
            });
          }
        };
        reader.readAsDataURL(processedFile);
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          image: 'Failed to process image. Please try another file.'
        }));
        console.error('Image compression error:', error);
      }
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    // Clear image error
    if (errors.image) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.image;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate title
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must not exceed 200 characters';
    }

    // Image is required only for new banners (not when editing)
    if (!bannerData && !imageFile) {
      newErrors.image = 'Banner image is required';
    }

    // Validate image file if provided
    if (imageFile) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
      if (!validTypes.includes(imageFile.type)) {
        newErrors.image = 'Only PNG, JPG, GIF, or WEBP files are allowed';
      }

      // Validate file size (max 1MB)
      const maxSize = 1 * 1024 * 1024; // 1MB
      if (imageFile.size > maxSize) {
        newErrors.image = 'Image size must be less than 1MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        image: imageFile,
        banner_id: bannerData?.banner_id,
        banner_type: formData.banner_type,
        category_id: formData.category_id || null
      };
      await onSave(submitData);
      // Reset form on success
      setFormData({
        title: '',
        is_active: true,
        banner_type: 'offer' as 'offer' | 'buy_banner',
        category_id: null
      });
      setImageFile(null);
      setImagePreview(null);
      setErrors({});
    } catch (error: any) {
      console.error('Failed to save banner:', error);
      // Show error message to user
      setErrors({
        submit: error?.message || 'Failed to save banner. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="image" className="text-primary" />
            {bannerData ? 'Edit Banner' : 'Add a Banner'}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Input */}
            <div>
              <Label htmlFor="title">
                Banner Title <span className="text-danger">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 200) {
                    handleInputChange('title', value);
                  }
                }}
                maxLength={200}
                placeholder="Enter banner title"
                className={`mt-2 ${errors.title ? 'border-danger' : ''}`}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.title.length}/200 characters
              </p>
              {errors.title && (
                <p className="text-danger text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Banner Type Selection */}
            <div>
              <Label htmlFor="banner_type">
                Banner Type <span className="text-danger">*</span>
              </Label>
              <div className="mt-2 flex gap-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="banner_type_offer"
                    name="banner_type"
                    value="offer"
                    checked={formData.banner_type === 'offer'}
                    onChange={(e) => handleInputChange('banner_type', e.target.value)}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="banner_type_offer" className="font-normal cursor-pointer">
                    Offer (Banner)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="banner_type_buy"
                    name="banner_type"
                    value="buy_banner"
                    checked={formData.banner_type === 'buy_banner'}
                    onChange={(e) => handleInputChange('banner_type', e.target.value)}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="banner_type_buy" className="font-normal cursor-pointer">
                    Buy Banner (Sub-Banner)
                  </Label>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Select "Offer" to show as banner, or "Buy Banner" to show as sub-banner on user side
              </p>
            </div>

            {/* Category Selection */}
            <div>
              <Label htmlFor="category_id">
                Service Category (Optional)
              </Label>
              <Select
                value={formData.category_id || 'none'}
                onValueChange={(value) => handleInputChange('category_id', value === 'none' ? null : value)}
                disabled={isLoadingCategories}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select a service category"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (No category)</SelectItem>
                  {categories
                    .map((category) => {
                      // Use public_id for API, fallback to id or category_id
                      const categoryId = category.public_id || category.id || category.category_id;
                      return categoryId ? { id: categoryId, name: category.name } : null;
                    })
                    .filter((item): item is { id: string; name: string } => item !== null)
                    .map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Select a service category to redirect users when they click this banner
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <Label htmlFor="image-upload">
                Banner Image <span className="text-danger">*</span>
              </Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative w-full">
                    <div className="w-full h-64 border-2 border-gray-300 rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Banner preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        <KeenIcon icon="notepad-edit" className="me-2" />
                        Change Image
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="text-danger hover:text-danger"
                      >
                        <KeenIcon icon="trash" className="me-2" />
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
                    <p className="text-sm text-gray-600">Click to upload banner image</p>
                    <p className="text-xs text-gray-500">{getImageValidationHint()}</p>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept={getAllowedImageTypesString()}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {errors.image && (
                  <p className="text-danger text-sm mt-1">{errors.image}</p>
                )}
              </div>
            </div>

            {/* Status Switch */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="status" className="text-base font-medium">
                  Status
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.is_active ? 'Banner is active and will be displayed' : 'Banner is inactive and will be hidden'}
                </p>
              </div>
              <Switch
                id="status"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 bg-danger-light border border-danger rounded-lg">
                <p className="text-danger text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    {bannerData ? 'Updating...' : 'Creating...'}
                  </span>
                ) : (
                  <>
                    <KeenIcon icon="check" className="me-2" />
                    {bannerData ? 'Update Banner' : 'Create Banner'}
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

export { AddEditBannerForm };
