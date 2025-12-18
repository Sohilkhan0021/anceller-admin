import { useState, useEffect, useCallback } from 'react';
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
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/services';
import { ICategory, ICreateCategoryRequest, IUpdateCategoryRequest } from '@/services/category.types';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';

// interface ICategory {
//   id: string;
//   name: string;
//   icon: string;
//   lucideIcon?: string;
//   description?: string;
//   status: 'active' | 'inactive';
//   displayOrder: number;
//   iconUrl?: string;
// }

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Create category mutation
  const { mutate: createCategory, isLoading: isCreating } = useCreateCategory({
    onSuccess: (data) => {
      toast.success(data.message || 'Category created successfully');
      setIsFormOpen(false);
      setEditingCategory(null);
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create category');
    }
  });

  // Update category mutation
  const { mutate: updateCategory, isLoading: isUpdating } = useUpdateCategory({
    onSuccess: (data) => {
      toast.success(data.message || 'Category updated successfully');
      setIsFormOpen(false);
      setEditingCategory(null);
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update category');
    }
  });

  // Delete category mutation
  const { mutate: deleteCategory, isLoading: isDeleting } = useDeleteCategory({
    onSuccess: (data) => {
      toast.success(data.message || 'Category deleted successfully');
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete category');
    }
  });

  // Fetch categories with filters
  const {
    categories,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useCategories({
    page: currentPage,
    limit: pageSize,
    status: statusFilter === 'all' ? '' : statusFilter,
    search: debouncedSearch,
  });

  // Handle status filter change
  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEditCategory = (category: ICategory) => {
    // Ensure we have an ID for the request
    const categoryWithId = {
      ...category,
      id: category.id || (category as any).public_id || (category as any).category_id
    };
    setEditingCategory(categoryWithId);
    setIsFormOpen(true);
  };

  const handleSaveCategory = (categoryData: any) => {
    if (editingCategory) {
      // Update existing
      const request: IUpdateCategoryRequest = {
        id: editingCategory.id,
        name: categoryData.name,
        description: categoryData.description,
        icon: categoryData.iconFile,
        sort_order: categoryData.displayOrder,
        is_active: categoryData.status === 'active',
        meta_data: JSON.stringify({ preset_icon: categoryData.icon })
      };

      updateCategory(request);
      // Note: We don't close the form here; it's handled in onSuccess
    } else {
      // Create new
      const request: ICreateCategoryRequest = {
        name: categoryData.name,
        description: categoryData.description,
        icon: categoryData.iconFile,
        sort_order: categoryData.displayOrder,
        is_active: categoryData.status === 'active',
        meta_data: JSON.stringify({ preset_icon: categoryData.icon })
      };

      createCategory(request);
      // Note: We don't close the form here; it's handled in onSuccess
    }
  };

  const handleToggleStatus = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      // TODO: Implement API call to update status
      toast.info(`Category ${category.status === 'active' ? 'deactivated' : 'activated'}`);
      // Refetch after status change
      refetch();
    }
  };

  const handleDeleteClick = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete);
    }
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  const handleUpdateDisplayOrder = (categoryId: string, newOrder: number) => {
    // TODO: Implement API call to update display order
    toast.info('Display order updated');
    // Refetch after order change
    refetch();
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-success text-white">Active</Badge>
    ) : (
      <Badge variant="outline">Inactive</Badge>
    );
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="card-title">
                Categories {pagination ? `(${pagination.total})` : `(${categories.length})`}
              </h3>
              <p className="text-sm text-gray-600">Manage service categories</p>
            </div>

            <Button size="sm" onClick={handleAddCategory}>
              <KeenIcon icon="plus" className="me-2" />
              Add Category
            </Button>
          </div>
        </div>

        <div className="card-body">
          {/* Error State */}
          {isError && (
            <Alert variant="danger" className="mb-4">
              <div className="flex items-center justify-between">
                <span>
                  {error?.message || 'Failed to load categories. Please try again.'}
                </span>
                <button
                  onClick={() => refetch()}
                  className="text-sm underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            </Alert>
          )}

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
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
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

          {/* Loading State */}
          {isLoading && !isFetching ? (
            <div className="p-8">
              <ContentLoader />
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center">
              <KeenIcon icon="category" className="text-gray-400 text-4xl mx-auto mb-4" />
              <p className="text-gray-600">No categories found</p>
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <>
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
                    {categories.map((category, index) => {
                      // Handle displayOrder - might be undefined or use snake_case from API
                      const displayOrder = category.displayOrder ??
                        (category as any).display_order ??
                        (index + 1);

                      return (
                        <TableRow key={category.id}>
                          <TableCell>
                            <Select
                              value={displayOrder.toString()}
                              onValueChange={(value) => handleUpdateDisplayOrder(category.id, parseInt(value))}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: pagination?.total || categories.length }, (_, index) => (
                                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                                    {index + 1}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="p-2 bg-primary-light rounded-lg w-fit">
                              <CategoryIcon icon={category.icon || ''} lucideIcon={category.lucideIcon} className="text-primary w-5 h-5" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{category.name || 'N/A'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600 max-w-md truncate">
                              {category.description || '—'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(category.status || 'inactive')}
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
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} categories
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(pagination.page - 1)}
                      disabled={!pagination.hasPreviousPage || isFetching}
                    >
                      <KeenIcon icon="arrow-left" className="me-1" />
                      Previous
                    </Button>
                    <div className="text-sm text-gray-600">
                      Page {pagination.page} of {pagination.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(pagination.page + 1)}
                      disabled={!pagination.hasNextPage || isFetching}
                    >
                      Next
                      <KeenIcon icon="arrow-right" className="ms-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
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

