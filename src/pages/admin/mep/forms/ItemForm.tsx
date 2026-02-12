import React, { useState, useEffect, useCallback } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { getImageUrl } from '@/utils/imageUrl';
import { validateImageFile, getAllowedImageTypesString, getImageValidationHint } from '@/utils/imageValidation';
import { useCreateItem, useUpdateItem } from '@/services';
import { toast } from 'sonner';

interface IItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: any) => void;
  itemData?: any;
  availableProjectItems?: any[];
}

const ItemForm = ({ isOpen, onClose, onSave, itemData, availableProjectItems = [] }: IItemFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    project_item_id: '',
    description: '',
    quantity: undefined as number | undefined,
    unit: '',
    price: undefined as number | undefined,
    status: 'active' as 'active' | 'inactive',
    displayOrder: 1
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  const createItemMutation = useCreateItem({
    onSuccess: (data) => {
      toast.success(data.message || 'Item added successfully');
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add item');
    }
  });

  const updateItemMutation = useUpdateItem({
    onSuccess: (data) => {
      toast.success(data.message || 'Item updated successfully');
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update item');
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (itemData) {
        let statusValue = 'active';
        if (itemData.is_active === false || itemData.is_active === 'false') {
          statusValue = 'inactive';
        } else if (itemData.status) {
          statusValue = itemData.status.toLowerCase() === 'inactive' ? 'inactive' : 'active';
        }
        
        // Extract price from itemData.price or meta_data.price
        let price = itemData.price;
        if (!price && itemData.meta_data) {
          if (typeof itemData.meta_data === 'object' && itemData.meta_data.price) {
            price = typeof itemData.meta_data.price === 'number' ? itemData.meta_data.price : parseFloat(itemData.meta_data.price);
          }
        }
        
        setFormData({
          name: itemData.name || '',
          project_item_id: itemData.project_item_id || itemData.project_item_id || '',
          description: itemData.description || '',
          quantity: itemData.quantity,
          unit: itemData.unit || '',
          price: price || undefined,
          status: statusValue as 'active' | 'inactive',
          displayOrder: itemData.sort_order || itemData.displayOrder || itemData.display_order || 1
        });
        
        const imageUrl = itemData.image_url || itemData.imageUrl || itemData.image;
        if (imageUrl) {
          const fullImageUrl = getImageUrl(imageUrl);
          setImagePreview(fullImageUrl || null);
        } else {
          setImagePreview(null);
        }
      } else {
        setFormData({
          name: '',
          project_item_id: '',
          description: '',
          quantity: undefined,
          unit: '',
          price: undefined,
          status: 'active',
          displayOrder: 1
        });
        setImagePreview(null);
      }
      setErrors({});
      setImageFile(null);
      setIsDraggingImage(false);
    }
  }, [itemData, isOpen]);

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

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

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
      newErrors.name = 'Item name is required';
    }

    if (!formData.project_item_id) {
      newErrors.project_item_id = 'Project item is required';
    }

    if (newErrors.name || newErrors.project_item_id) {
      setErrors(newErrors);
      return false;
    }

    return true;
  };

  const handleClose = () => {
    setFormData({
      name: '',
      project_item_id: '',
      description: '',
      quantity: undefined,
      unit: '',
      price: undefined,
      status: 'active',
      displayOrder: 1
    });
    setImagePreview(null);
    setImageFile(null);
    setErrors({});
    setIsDraggingImage(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (itemData) {
      // Update existing item
      const itemId = itemData.id || itemData.item_id || itemData.public_id;
      if (!itemId) {
        toast.error('Item ID is missing');
        return;
      }

      // Prepare meta_data with price if provided, merge with existing meta_data
      const existingMetaData = itemData?.meta_data || {};
      const metaData: any = { ...existingMetaData };
      if (formData.price !== undefined && formData.price !== null) {
        metaData.price = formData.price;
      } else if (formData.price === undefined || formData.price === null) {
        // Remove price if it was cleared
        delete metaData.price;
      }
      
      updateItemMutation.mutate({
        id: itemId,
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        project_item_id: formData.project_item_id,
        quantity: formData.quantity,
        unit: formData.unit || undefined,
        image: imageFile || undefined,
        sort_order: formData.displayOrder,
        is_active: formData.status === 'active',
        meta_data: Object.keys(metaData).length > 0 ? metaData : undefined
      });
    } else {
      // Create new item
      if (!formData.name.trim()) {
        setErrors({ name: 'Item name is required' });
        return;
      }
      if (!formData.project_item_id) {
        setErrors({ project_item_id: 'Project item is required' });
        return;
      }

      // Prepare meta_data with price if provided
      const metaData: any = {};
      if (formData.price !== undefined && formData.price !== null) {
        metaData.price = formData.price;
      }
      
      createItemMutation.mutate({
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        project_item_id: formData.project_item_id,
        quantity: formData.quantity,
        unit: formData.unit || undefined,
        image: imageFile || undefined,
        sort_order: formData.displayOrder,
        is_active: formData.status === 'active',
        meta_data: Object.keys(metaData).length > 0 ? metaData : undefined
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="category" className="text-primary" />
            {itemData ? 'Edit Item' : 'Add New Item'}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Item Selection */}
            <div>
              <Label htmlFor="project_item_id">
                Project Item <span className="text-danger">*</span>
              </Label>
              <Select
                value={formData.project_item_id}
                onValueChange={(value) => handleInputChange('project_item_id', value)}
              >
                <SelectTrigger className={`mt-2 ${errors.project_item_id ? 'border-danger' : ''}`}>
                  <SelectValue placeholder="Select a project item" />
                </SelectTrigger>
                <SelectContent>
                  {availableProjectItems.map((projectItem) => (
                    <SelectItem key={projectItem.id} value={projectItem.id}>
                      {projectItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.project_item_id && (
                <p className="text-danger text-sm mt-1">{errors.project_item_id}</p>
              )}
            </div>

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
                placeholder="e.g., Wire, Pipe, Panel"
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
                placeholder="Short description for this item..."
                maxLength={600}
              />
            </div>

            {/* Item Image */}
            <div className="space-y-4">
              <Label>Item Image</Label>
              <div>
                {imagePreview ? (
                  <div className="space-y-3">
                    <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                      <img
                        src={imagePreview}
                        alt="Image preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
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

            {/* Quantity and Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity (Optional)</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.quantity || ''}
                  onChange={(e) => handleInputChange('quantity', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="mt-2"
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="unit">Unit (Optional)</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  className="mt-2"
                  placeholder="e.g., kg, m, pcs"
                />
              </div>
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price">Price (Optional)</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="pl-8"
                  placeholder="0.00"
                />
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
                disabled={createItemMutation.isLoading || updateItemMutation.isLoading}
              >
                <KeenIcon icon="cross" className="me-2" />
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createItemMutation.isLoading || updateItemMutation.isLoading}
              >
                {(createItemMutation.isLoading || updateItemMutation.isLoading) ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white me-2">
                      
                    </div>
                    {itemData ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <KeenIcon icon="check" className="me-2" />
                    {itemData ? 'Update Item' : 'Create Item'}
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

export { ItemForm };
