import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
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
import { SubServiceForm } from '../forms/SubServiceForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useSubServices, useDeleteSubService } from '@/services';
import { ISubService } from '@/services/subservice.types';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';
import { useServices } from '@/services/service.hooks';

// interface ISubService {
//   id: string;
//   name: string;
//   categoryId: string;
//   icon: string;
//   image?: string; 
//   status: 'active' | 'inactive';
//   displayOrder: number;
// }

interface ISubServiceManagementProps {
  categories?: any[];
  onCreateSubService?: (subService: any) => void;
  onUpdateSubService?: (subService: any) => void;
  onDeleteSubService?: (subServiceId: string) => void;
}

const SubServiceManagement = ({
  categories = [],
  onCreateSubService,
  onUpdateSubService,
  onDeleteSubService
}: ISubServiceManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubService, setEditingSubService] = useState<ISubService | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subServiceToDelete, setSubServiceToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { services } = useServices();

  // Mock categories (for backward compatibility)
  const mockCategories = [
    { id: '1', name: 'Electrical' },
    { id: '2', name: 'Plumbing' },
    { id: '3', name: 'AC Services' },
    { id: '4', name: 'Cleaning' },
    { id: '5', name: 'Carpentry' },
    { id: '6', name: 'Appliance' }
  ];

  const availableCategories = categories.length > 0 ? categories : mockCategories;

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch sub-services with filters
  const {
    subServices,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useSubServices({
    page: currentPage,
    limit: pageSize,
    status: statusFilter === 'all' ? '' : statusFilter,
    service_id: serviceFilter === 'all' ? '' : serviceFilter,
    search: debouncedSearch,
  });

  // Delete sub-service mutation
  const { mutate: deleteSubService, isLoading: isDeleting } = useDeleteSubService({
    onSuccess: (data) => {
      toast.success(data.message || 'Sub-service deleted successfully');
      setDeleteDialogOpen(false);
      setSubServiceToDelete(null);
      refetch(); // Refresh the list
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete sub-service');
    }
  });

  // Handle filter changes
  const handleServiceFilterChange = useCallback((value: string) => {
    setServiceFilter(value);
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  const handleAddSubService = () => {
    setEditingSubService(null);
    setIsFormOpen(true);
  };

  const handleEditSubService = (subService: ISubService) => {
    setEditingSubService(subService);
    setIsFormOpen(true);
  };

  const handleSaveSubService = (subServiceData: any) => {
    if (editingSubService) {
      onUpdateSubService?.(subServiceData);
      toast.success('Sub-service updated successfully');
    } else {
      onCreateSubService?.(subServiceData);
      toast.success('Sub-service created successfully');
    }
    setIsFormOpen(false);
    setEditingSubService(null);
    // Refetch sub-services after save
    refetch();
  };

  const handleToggleStatus = (subServiceId: string) => {
    const subService = subServices.find(s => s.id === subServiceId);
    if (subService) {
      // TODO: Implement API call to update status
      toast.info(`Sub-service ${subService.status === 'active' ? 'deactivated' : 'activated'}`);
      // Refetch after status change
      refetch();
    }
  };

  const handleDeleteClick = (subServiceId: string) => {
    setSubServiceToDelete(subServiceId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (subServiceToDelete) {
      deleteSubService(subServiceToDelete);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-success text-white">Active</Badge>
    ) : (
      <Badge variant="outline">Inactive</Badge>
    );
  };

  const getCategoryName = (categoryId?: string, serviceId?: string) => {
    if (categoryId) {
      return availableCategories.find(c => c.id === categoryId)?.name || 'Unknown';
    }
    if (serviceId) {
      // If we have serviceId, we might need to look it up differently
      // For now, return serviceId or Unknown
      return serviceId || 'Unknown';
    }
    return 'Unknown';
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="card-title">
                Sub-Services {pagination ? `(${pagination.total})` : `(${subServices.length})`}
              </h3>
              <p className="text-sm text-gray-600">Manage sub-services (name and icon only)</p>
            </div>

            <Button size="sm" onClick={handleAddSubService}>
              <KeenIcon icon="plus" className="me-2" />
              Add Sub-Service
            </Button>
          </div>
        </div>

        <div className="card-body">
          {/* Error State */}
          {isError && (
            <Alert variant="danger" className="mb-4">
              <div className="flex items-center justify-between">
                <span>
                  {error?.message || 'Failed to load sub-services. Please try again.'}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <div className="relative">
                <KeenIcon icon="magnifier" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search sub-services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Select value={serviceFilter} onValueChange={handleServiceFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {availableCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          ) : subServices.length === 0 ? (
            <div className="p-8 text-center">
              <KeenIcon icon="category" className="text-gray-400 text-4xl mx-auto mb-4" />
              <p className="text-gray-600">No sub-services found</p>
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <>
              {/* Sub-Services Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Order</TableHead>
                      <TableHead className="w-[80px]">Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[150px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subServices.map((subService, index) => {
                      // Handle displayOrder - might be undefined
                      const displayOrder = subService.displayOrder ?? (index + 1);

                      return (
                        <TableRow key={subService.id}>
                          <TableCell>
                            <div className="text-sm font-medium text-center">{displayOrder}</div>
                          </TableCell>
                          <TableCell>
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                              {subService.image ? (
                                <img
                                  src={subService.image}
                                  alt={subService.name || 'Sub-service'}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    // Fallback to placeholder if image fails to load
                                    target.src = `https://via.placeholder.com/100x100?text=${encodeURIComponent((subService.name || 'S').substring(0, 1))}`;
                                    target.onerror = null; // Prevent infinite loop
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                  <KeenIcon icon={subService.icon || 'category'} className="text-2xl" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{subService.name || 'N/A'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {getCategoryName(subService.categoryId, subService.serviceId)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(subService.status || 'inactive')}
                              <Switch
                                checked={subService.status === 'active'}
                                onCheckedChange={() => handleToggleStatus(subService.id)}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditSubService(subService)}
                              >
                                <KeenIcon icon="pencil" className="me-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteClick(subService.id)}
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
                    {pagination.total} sub-services
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

      {/* Sub-Service Form Modal */}
      <SubServiceForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSubService(null);
        }}
        onSave={handleSaveSubService}
        subServiceData={editingSubService}
        availableServices={services}
        availableCategories={availableCategories}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Sub-Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this sub-service? This action cannot be undone.
              All services under this sub-service will also be affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { SubServiceManagement };

