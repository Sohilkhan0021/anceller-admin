import { useState, useEffect } from 'react';
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

interface ICategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: any) => void;
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

  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        status: categoryData.status || 'active',
        displayOrder: categoryData.displayOrder || 1
      });
      if (categoryData.iconUrl) {
        setIconPreview(categoryData.iconUrl);
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
    }
    setErrors({});
    setIconFile(null);
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

  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          icon: 'Only PNG, JPG, or SVG files are allowed'
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
          setFormData(prev => ({
            ...prev,
            iconUrl: result
          }));
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.icon;
            return newErrors;
          });
        };
        reader.readAsDataURL(file);
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const handleRemoveIcon = () => {
    setIconFile(null);
    setIconPreview(null);
    setFormData(prev => ({
      ...prev,
      icon: 'category'
    }));
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const categoryDataToSave = {
      ...formData,
      iconFile: iconFile || undefined,
      iconUrl: iconPreview || undefined
    };

    onSave(categoryDataToSave);
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
                    <label
                      htmlFor="icon-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <KeenIcon icon="file-up" className="text-3xl text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, SVG, JPG (Square images only)
                        </p>
                      </div>
                    </label>
                  )}
                  <input
                    id="icon-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    className="hidden"
                    onChange={handleIconUpload}
                  />
                  {errors.icon && (
                    <p className="text-danger text-sm mt-1">{errors.icon}</p>
                  )}
                </div>
              </div>
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
              <Button type="button" variant="outline" onClick={onClose}>
                <KeenIcon icon="cross" className="me-2" />
                Cancel
              </Button>
              <Button type="submit">
                <KeenIcon icon="check" className="me-2" />
                {categoryData ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { CategoryForm };

