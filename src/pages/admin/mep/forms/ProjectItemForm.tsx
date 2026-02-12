import React, { useState, useEffect, useCallback } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
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
import { useCreateProjectItem, useUpdateProjectItem } from '@/services';

interface IProjectItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectItemData: any) => void;
  projectItemData?: any;
  availableProjects?: any[];
}

const ProjectItemForm = ({ isOpen, onClose, onSave, projectItemData, availableProjects = [] }: IProjectItemFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    project_id: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
    displayOrder: 1
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  const createProjectItemMutation = useCreateProjectItem({
    onSuccess: (data) => {
      toast.success(data.message || 'Project item added successfully');
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add project item');
    }
  });

  const updateProjectItemMutation = useUpdateProjectItem({
    onSuccess: (data) => {
      toast.success(data.message || 'Project item updated successfully');
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update project item');
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (projectItemData) {
        let statusValue = 'active';
        if (projectItemData.is_active === false || projectItemData.is_active === 'false') {
          statusValue = 'inactive';
        } else if (projectItemData.status) {
          statusValue = projectItemData.status.toLowerCase() === 'inactive' ? 'inactive' : 'active';
        }
        
        setFormData({
          name: projectItemData.name || '',
          project_id: projectItemData.project_id || projectItemData.project?.id || projectItemData.project?.project_id || projectItemData.project?.public_id || '',
          description: projectItemData.description || '',
          status: statusValue as 'active' | 'inactive',
          displayOrder: projectItemData.sort_order || projectItemData.displayOrder || projectItemData.display_order || 1
        });
        
        const imageUrl = projectItemData.image_url || projectItemData.imageUrl || projectItemData.image;
        if (imageUrl) {
          const fullImageUrl = getImageUrl(imageUrl);
          setImagePreview(fullImageUrl || null);
        } else {
          setImagePreview(null);
        }
      } else {
        setFormData({
          name: '',
          project_id: '',
          description: '',
          status: 'active',
          displayOrder: 1
        });
        setImagePreview(null);
      }
      setErrors({});
      setImageFile(null);
      setIsDraggingImage(false);
    }
  }, [projectItemData, isOpen]);

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
      newErrors.name = 'Project item name is required';
    }

    if (!formData.project_id) {
      newErrors.project_id = 'Project is required';
    }

    if (newErrors.name || newErrors.project_id) {
      setErrors(newErrors);
      return false;
    }

    return true;
  };

  const handleClose = () => {
    setFormData({
      name: '',
      project_id: '',
      description: '',
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

    if (projectItemData) {
      // Update existing project item
      const projectItemId = projectItemData.id || projectItemData.project_item_id || projectItemData.public_id;
      if (!projectItemId) {
        toast.error('Project item ID is missing');
        return;
      }

      updateProjectItemMutation.mutate({
        id: projectItemId,
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        project_id: formData.project_id,
        image: imageFile || undefined,
        sort_order: formData.displayOrder,
        is_active: formData.status === 'active'
      });
    } else {
      // Create new project item
      if (!formData.name.trim()) {
        setErrors({ name: 'Project item name is required' });
        return;
      }
      if (!formData.project_id) {
        setErrors({ project_id: 'Project is required' });
        return;
      }

      createProjectItemMutation.mutate({
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        project_id: formData.project_id,
        image: imageFile || undefined,
        sort_order: formData.displayOrder,
        is_active: formData.status === 'active'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="tag" className="text-primary" />
            {projectItemData ? 'Edit Project Item' : 'Add New Project Item'}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Selection */}
            <div>
              <Label htmlFor="project_id">
                Project <span className="text-danger">*</span>
              </Label>
              <Select
                value={formData.project_id}
                onValueChange={(value) => handleInputChange('project_id', value)}
              >
                <SelectTrigger className={`mt-2 ${errors.project_id ? 'border-danger' : ''}`}>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {availableProjects.length === 0 ? (
                    <SelectItem value="" disabled>
                      No projects available
                    </SelectItem>
                  ) : (
                    availableProjects.map((project) => (
                      <SelectItem 
                        key={project.id || project.project_id || project.public_id} 
                        value={project.id || project.project_id || project.public_id}
                      >
                        {project.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.project_id && (
                <p className="text-danger text-sm mt-1">{errors.project_id}</p>
              )}
            </div>

            {/* Project Item Name */}
            <div>
              <Label htmlFor="name">
                Project Item Name <span className="text-danger">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`mt-2 ${errors.name ? 'border-danger' : ''}`}
                placeholder="e.g., Floor 1, Unit A"
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
                placeholder="Short description for this project item..."
                maxLength={600}
              />
            </div>

            {/* Project Item Image */}
            <div className="space-y-4">
              <Label>Project Item Image</Label>
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
                disabled={createProjectItemMutation.isLoading || updateProjectItemMutation.isLoading}
              >
                <KeenIcon icon="cross" className="me-2" />
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createProjectItemMutation.isLoading || updateProjectItemMutation.isLoading}
              >
                {(createProjectItemMutation.isLoading || updateProjectItemMutation.isLoading) ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white me-2">
                      
                    </div>
                    {projectItemData ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <KeenIcon icon="check" className="me-2" />
                    {projectItemData ? 'Update Project Item' : 'Create Project Item'}
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

export { ProjectItemForm };
