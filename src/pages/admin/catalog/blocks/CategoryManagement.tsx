import { useState } from 'react';
import React from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Droplet, 
  Wind, 
  Sparkles, 
  Hammer, 
  WashingMachine 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CategoryForm } from '../forms/CategoryForm';
import { useSnackbar } from 'notistack';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

interface ICategory {
  id: string;
  name: string;
  icon: string;
  lucideIcon?: string;
  description?: string;
  status: 'active' | 'inactive';
  displayOrder: number;
  iconUrl?: string;
}

// Icon component that can use both KeenIcon and Lucide icons
const CategoryIcon = ({ icon, lucideIcon, className }: { icon: string; lucideIcon?: string; className?: string }) => {
  // Try Lucide icon first if provided, otherwise use KeenIcon
  if (lucideIcon) {
    const LucideIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      'zap': Zap,
      'droplet': Droplet,
      'wind': Wind,
      'sparkles': Sparkles,
      'hammer': Hammer,
      'washing-machine': WashingMachine
    };
    const LucideIcon = LucideIconMap[lucideIcon];
    if (LucideIcon) {
      return <LucideIcon className={className || "text-primary"} />;
    }
  }
  return <KeenIcon icon={icon} className={className || "text-primary"} />;
};

interface ICategoryManagementProps {
  onCreateCategory?: (category: any) => void;
  onUpdateCategory?: (category: any) => void;
  onDeleteCategory?: (categoryId: string) => void;
}

const CategoryManagement = ({ 
  onCreateCategory, 
  onUpdateCategory, 
  onDeleteCategory 
}: ICategoryManagementProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // Mock data - in real app, this would come from API
  const [categories, setCategories] = useState<ICategory[]>([
    {
      id: '1',
      name: 'Electrical',
      icon: 'element-11',
      lucideIcon: 'zap',
      description: 'All electrical repair and installation services',
      status: 'active',
      displayOrder: 1
    },
    {
      id: '2',
      name: 'Plumbing',
      icon: 'water-drop',
      lucideIcon: 'droplet',
      description: 'Plumbing repair and installation services',
      status: 'active',
      displayOrder: 2
    },
    {
      id: '3',
      name: 'AC Services',
      icon: 'air-conditioner-2',
      lucideIcon: 'wind',
      description: 'AC installation, repair and maintenance',
      status: 'active',
      displayOrder: 3
    },
    {
      id: '4',
      name: 'Cleaning',
      icon: 'broom-2',
      lucideIcon: 'sparkles',
      description: 'Professional cleaning services',
      status: 'active',
      displayOrder: 4
    },
    {
      id: '5',
      name: 'Carpentry',
      icon: 'hammer-2',
      lucideIcon: 'hammer',
      description: 'Carpentry and woodwork services',
      status: 'inactive',
      displayOrder: 5
    },
    {
      id: '6',
      name: 'Appliance',
      icon: 'setting-2',
      lucideIcon: 'washing-machine',
      description: 'Home appliance repair services',
      status: 'active',
      displayOrder: 6
    }
  ]);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEditCategory = (category: ICategory) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleSaveCategory = (categoryData: any) => {
    if (editingCategory) {
      // Update existing
      setCategories(prev => prev.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, ...categoryData }
          : cat
      ));
      onUpdateCategory?.(categoryData);
      enqueueSnackbar('Category updated successfully', { 
        variant: 'solid', 
        state: 'success',
        icon: 'check-circle'
      });
    } else {
      // Create new
      const newCategory: ICategory = {
        ...categoryData,
        id: Date.now().toString(),
        displayOrder: categories.length + 1
      };
      setCategories(prev => [...prev, newCategory]);
      onCreateCategory?.(newCategory);
      enqueueSnackbar('Category created successfully', { 
        variant: 'solid', 
        state: 'success',
        icon: 'check-circle'
      });
    }
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  const handleToggleStatus = (categoryId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, status: cat.status === 'active' ? 'inactive' : 'active' }
        : cat
    ));
    const category = categories.find(c => c.id === categoryId);
    enqueueSnackbar(`Category ${category?.status === 'active' ? 'deactivated' : 'activated'}`, { 
      variant: 'solid', 
      state: 'info',
      icon: 'information-2'
    });
  };

  const handleDeleteClick = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryToDelete));
      onDeleteCategory?.(categoryToDelete);
      enqueueSnackbar('Category deleted successfully', { 
        variant: 'solid', 
        state: 'success',
        icon: 'check-circle'
      });
    }
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  const handleUpdateDisplayOrder = (categoryId: string, newOrder: number) => {
    setCategories(prev => {
      const updated = [...prev];
      const category = updated.find(c => c.id === categoryId);
      if (category) {
        const oldOrder = category.displayOrder;
        // Swap orders
        updated.forEach(cat => {
          if (cat.displayOrder === newOrder) {
            cat.displayOrder = oldOrder;
          }
        });
        category.displayOrder = newOrder;
      }
      return updated.sort((a, b) => a.displayOrder - b.displayOrder);
    });
    enqueueSnackbar('Display order updated', { 
      variant: 'solid', 
      state: 'info',
      icon: 'information-2'
    });
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-success text-white">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || category.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="card-title">Categories ({filteredCategories.length})</h3>
              <p className="text-sm text-gray-600">Manage service categories</p>
            </div>
            
            <Button size="sm" onClick={handleAddCategory}>
              <KeenIcon icon="plus" className="me-2" />
              Add Category
            </Button>
          </div>
        </div>
        
        <div className="card-body">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2">
              <div className="relative">
                <KeenIcon icon="magnifier" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Categories Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Order</TableHead>
                  <TableHead className="w-[80px]">Icon</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <Select
                        value={category.displayOrder.toString()}
                        onValueChange={(value) => handleUpdateDisplayOrder(category.id, parseInt(value))}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((_, index) => (
                            <SelectItem key={index + 1} value={(index + 1).toString()}>
                              {index + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="p-2 bg-primary-light rounded-lg w-fit">
                        <CategoryIcon icon={category.icon} lucideIcon={category.lucideIcon} className="text-primary w-5 h-5" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{category.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600 max-w-md truncate">
                        {category.description || '—'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(category.status)}
                        <Switch
                          checked={category.status === 'active'}
                          onCheckedChange={() => handleToggleStatus(category.id)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditCategory(category)}
                        >
                          <KeenIcon icon="pencil" className="me-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteClick(category.id)}
                        >
                          <KeenIcon icon="trash" className="me-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Category Form Modal */}
      <CategoryForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        categoryData={editingCategory}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone. 
              All sub-services under this category will also be affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { CategoryManagement };

