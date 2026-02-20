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
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { getImageUrl } from '@/utils/imageUrl';
import { validateImageFile, getAllowedImageTypesString, getImageValidationHint } from '@/utils/imageValidation';
import { useCreateProject, useUpdateProject } from '@/services';

interface IProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (projectData: any) => void;
  projectData?: any;
}

const ProjectForm = ({ isOpen, onClose, onSave, projectData }: IProjectFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
    displayOrder: 1,
    image_url: undefined as string | null | undefined
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  const createProjectMutation = useCreateProject({
    onSuccess: (data) => {
      toast.success(data.message || 'Project added successfully');
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add project');
    }
  });

  const updateProjectMutation = useUpdateProject({
    onSuccess: (data) => {
      toast.success(data.message || 'Project updated successfully');
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update project');
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (projectData) {
        let statusValue = 'active';
        if (projectData.is_active === false || projectData.is_active === 'false') {
          statusValue = 'inactive';
        } else if (projectData.status) {
          statusValue = projectData.status.toLowerCase() === 'inactive' ? 'inactive' : 'active';
        }
        
        setFormData({
          name: projectData.name || '',
          description: projectData.description || '',
          status: statusValue as 'active' | 'inactive',
          displayOrder: projectData.sort_order || projectData.displayOrder || projectData.display_order || 1,
          image_url: projectData.image_url || projectData.imageUrl || projectData.image || undefined
        });
        
        const imageUrl = projectData.image_url || projectData.imageUrl || projectData.image;
        if (imageUrl) {
          const fullImageUrl = getImageUrl(imageUrl);
          setImagePreview(fullImageUrl || null);
        } else {
          setImagePreview(null);
        }
      } else {
        setFormData({
          name: '',
          description: '',
          status: 'active',
          displayOrder: 1,
          image_url: undefined
        });
        setImagePreview(null);
      }
      setErrors({});
      setImageFile(null);
      setIsDraggingImage(false);
    }
  }, [projectData, isOpen]);

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
    // Set image_url to null in formData so backend deletes the file
    setFormData(prev => ({
      ...prev,
      image_url: null
    }));
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
      newErrors.name = 'Project name is required';
    }

    if (newErrors.name) {
      setErrors(newErrors);
      return false;
    }

    return true;
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      status: 'active',
      displayOrder: 1,
      image_url: undefined
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

    if (projectData) {
      // Update existing project
      const projectId = projectData.id || projectData.project_id || projectData.public_id;
      if (!projectId) {
        toast.error('Project ID is missing');
        return;
      }

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
        imageUrlValue = projectData?.image_url || undefined;
      }
      
      updateProjectMutation.mutate({
        id: projectId,
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        image: imageFile || undefined,
        // Send null to delete image, undefined to keep existing, or string to set specific URL
        image_url: imageUrlValue as string | undefined,
        sort_order: formData.displayOrder,
        is_active: formData.status === 'active'
      });
    } else {
      // Create new project
      if (!formData.name.trim()) {
        setErrors({ name: 'Project name is required' });
        return;
      }

      createProjectMutation.mutate({
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
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
            <KeenIcon icon="category" className="text-primary" />
            {projectData ? 'Edit Project' : 'Add New Project'}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div>
              <Label htmlFor="name">
                Project Name <span className="text-danger">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`mt-2 ${errors.name ? 'border-danger' : ''}`}
                placeholder="e.g., Building A, Tower B"
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
                placeholder="Short description for this project..."
                maxLength={600}
              />
            </div>

            {/* Project Image */}
            <div className="space-y-4">
              <Label>Project Image</Label>
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
                disabled={createProjectMutation.isLoading || updateProjectMutation.isLoading}
              >
                <KeenIcon icon="cross" className="me-2" />
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createProjectMutation.isLoading || updateProjectMutation.isLoading}
              >
                {(createProjectMutation.isLoading || updateProjectMutation.isLoading) ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white me-2">
                      
                    </div>
                    {projectData ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <KeenIcon icon="check" className="me-2" />
                    {projectData ? 'Update Project' : 'Create Project'}
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

export { ProjectForm };
