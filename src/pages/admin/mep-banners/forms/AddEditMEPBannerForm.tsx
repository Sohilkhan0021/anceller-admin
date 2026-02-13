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
import { IMEPBanner } from '@/services/mepBanner.types';
import { getImageUrl } from '@/utils/imageUrl';
import { validateImageFile, getAllowedImageTypesString, getImageValidationHint } from '@/utils/imageValidation';
import { toast } from 'sonner';

interface IAddEditMEPBannerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bannerData: any) => Promise<void> | void;
  mepBannerData?: IMEPBanner | null;
}

const AddEditMEPBannerForm = ({ isOpen, onClose, onSave, mepBannerData }: IAddEditMEPBannerFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    is_active: true,
    banner_type: 'offer' as 'offer' | 'buy_banner'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mepBannerData) {
      setFormData({
        title: mepBannerData.title || '',
        is_active: mepBannerData.is_active ?? true,
        banner_type: (mepBannerData.banner_type || 'offer') as 'offer' | 'buy_banner'
      });
      if (mepBannerData.image_url) {
        const imageUrl = getImageUrl(mepBannerData.image_url);
        setImagePreview(imageUrl || null);
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData({
        title: '',
        is_active: true,
        banner_type: 'offer' as 'offer' | 'buy_banner'
      });
      setImagePreview(null);
    }
    setErrors({});
    setImageFile(null);
  }, [mepBannerData, isOpen]);

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

  const compressImage = (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

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
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setErrors(prev => ({
          ...prev,
          image: validation.error || 'Invalid image file'
        }));
        toast.error(validation.error || 'Invalid image file');
        return;
      }

      try {
        let processedFile = file;
        if (file.size > 500 * 1024) {
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

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must not exceed 200 characters';
    }

    if (!mepBannerData && !imageFile) {
      newErrors.image = 'MEP banner image is required';
    }

    if (imageFile) {
      const validation = validateImageFile(imageFile);
      if (!validation.isValid) {
        newErrors.image = validation.error || 'Invalid image file';
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
        mep_banner_id: mepBannerData?.mep_banner_id,
        banner_type: formData.banner_type
      };
      await onSave(submitData);
      setFormData({
        title: '',
        is_active: true,
        banner_type: 'offer' as 'offer' | 'buy_banner'
      });
      setImageFile(null);
      setImagePreview(null);
      setErrors({});
    } catch (error: any) {
      console.error('Failed to save MEP banner:', error);
      setErrors({
        submit: error?.message || 'Failed to save MEP banner. Please try again.'
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
            {mepBannerData ? 'Edit MEP Banner' : 'Add a MEP Banner'}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">
                MEP Banner Title <span className="text-danger">*</span>
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
                placeholder="Enter MEP banner title"
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
                    Offer (MEP Banner)
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
                    Buy Banner (MEP Sub-Banner)
                  </Label>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Select "Offer" to show as MEP banner, or "Buy Banner" to show as MEP sub-banner on user side
              </p>
            </div>

            <div>
              <Label htmlFor="image-upload">
                MEP Banner Image <span className="text-danger">*</span>
              </Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative w-full">
                    <div className="w-full h-64 border-2 border-gray-300 rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="MEP banner preview"
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
                    <p className="text-sm text-gray-600">Click to upload MEP banner image</p>
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

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="status" className="text-base font-medium">
                  Status
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.is_active ? 'MEP banner is active and will be displayed' : 'MEP banner is inactive and will be hidden'}
                </p>
              </div>
              <Switch
                id="status"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
            </div>

            {errors.submit && (
              <div className="p-3 bg-danger-light border border-danger rounded-lg">
                <p className="text-danger text-sm">{errors.submit}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    {mepBannerData ? 'Updating...' : 'Creating...'}
                  </span>
                ) : (
                  <>
                    <KeenIcon icon="check" className="me-2" />
                    {mepBannerData ? 'Update MEP Banner' : 'Create MEP Banner'}
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

export { AddEditMEPBannerForm };
