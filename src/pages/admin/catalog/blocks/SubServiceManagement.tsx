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
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { useSubServices, useDeleteSubService, useUpdateSubService } from '@/services';
import { subServiceService } from '@/services/subservice.service';
import { ISubService } from '@/services/subservice.types';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';
import { useServices } from '@/services/service.hooks';
import { getImageUrl } from '@/utils/imageUrl';

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

  // Update sub-service mutation
  const { mutate: updateSubService, isLoading: isUpdating } = useUpdateSubService({
    onSuccess: async (data) => {
      console.log('Sub-service update success - Full response:', JSON.stringify(data, null, 2));
      console.log('Sub-service update success - Image URL:', data?.data?.image_url);
      console.log('Sub-service update success - Response structure:', {
        status: data?.status,
        message: data?.message,
        hasData: !!data?.data,
        dataKeys: data?.data ? Object.keys(data.data) : [],
        image_url: data?.data?.image_url,
        sub_service_id: data?.data?.sub_service_id
      });

      // VERIFY: Check if response has all expected fields
      const responseData = data?.data;
      if (!responseData) {
        console.error('ERROR: Response data is missing!');
        toast.error('Update failed: Invalid response from server');
        return;
      }

      const responseKeys = Object.keys(responseData);
      const subServiceId = responseData.sub_service_id || editingSubService?.id;

      // If response is incomplete (only has sub_service_id), fetch the full sub-service data
      // This handles cases where the backend returns a minimal response
      if (responseKeys.length < 5 || responseKeys.length === 1) {
        console.warn('WARNING: Response is incomplete, fetching full sub-service data', {
          keys: responseKeys,
          subServiceId,
          note: 'This is expected behavior - backend may return minimal response after update'
        });

        // Always show success and refetch - the list will have the correct data with image
        // The refetch will get the updated sub-service with the image_url from the database
        toast.success('Sub-service updated successfully');
        refetch(); // Refresh the list to show updated data including image
        setIsFormOpen(false);
        setEditingSubService(null);

        // Optionally try to fetch full data for logging, but don't block on it
        if (subServiceId) {
          subServiceService.getSubServiceById(subServiceId)
            .then((fullSubService) => {
              console.log('Fetched full sub-service data after update:', fullSubService);
              if (fullSubService?.data?.image_url) {
                console.log('Image URL confirmed:', fullSubService.data.image_url);
              }
            })
            .catch((fetchError) => {
              console.warn('Could not fetch full sub-service data (non-critical):', fetchError);
            });
        }

        return;
      }

      // Check if image_url is present (can be null if no image was uploaded)
      const hasImageUrl = 'image_url' in responseData;
      if (!hasImageUrl) {
        console.warn('WARNING: image_url field missing from response');
      }

      // Success - show appropriate message
      if (responseData.image_url) {
        // toast.success(`Sub-service updated successfully. Image: ${responseData.image_url}`);
        toast.success(`Sub-service updated successfully`);
      } else {
        toast.success('Sub-service updated successfully');
      }

      refetch(); // Refresh the list to show updated data including image
      setIsFormOpen(false);
      setEditingSubService(null);
    },
    onError: (error: Error) => {
      console.error('Sub-service update error', { error: error.message, stack: error.stack });
      toast.error(error.message || 'Failed to update sub-service');
    }
  });

  // Create sub-service state
  const [isCreating, setIsCreating] = useState(false);

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
    // Ensure all fields are properly mapped for editing
    const subServiceWithData: any = {
      ...subService,
      id: subService.id || subService.public_id || (subService as any).sub_service_id || (subService as any).public_id,
      // Map all fields properly
      name: subService.name,
      serviceId: subService.serviceId || subService.service_id || (subService as any).service?.service_id,
      categoryId: subService.categoryId || (subService as any).category?.category_id || (subService as any).category_id,
      image_url: (subService as any).image_url || (subService as any).imageUrl || (subService as any).image,
      status: subService.status || ((subService as any).is_active === false ? 'inactive' : 'active'),
      displayOrder: subService.displayOrder || subService.display_order || (subService as any).sort_order || 1,
      is_active: subService.status === 'active' || ((subService as any).is_active !== false && subService.status !== 'inactive')
    };
    setEditingSubService(subServiceWithData);
    setIsFormOpen(true);
  };

  const handleSaveSubService = async (subServiceData: any) => {
    if (editingSubService) {
      // Update existing sub-service
      const subServiceId = editingSubService.id || editingSubService.public_id || (editingSubService as any).sub_service_id;
      if (!subServiceId) {
        toast.error('Sub-service ID is missing');
        return;
      }

      // Debug: Log the incoming form data to see what we're receiving
      console.log('handleSaveSubService - Received form data:', {
        hasImage: !!subServiceData.image,
        imageType: typeof subServiceData.image,
        isFile: subServiceData.image instanceof File,
        imageValue: subServiceData.image,
        imageKeys: subServiceData.image && typeof subServiceData.image === 'object' ? Object.keys(subServiceData.image) : 'not an object',
        image_url: subServiceData.image_url
      });

      // Format data for API
      const updateData: any = {
        service_id: subServiceData.serviceId,
        name: subServiceData.name,
        description: subServiceData.description || '',
        is_active: subServiceData.status === 'active',
        sort_order: subServiceData.displayOrder || 1,
        base_price: subServiceData.base_price ? parseFloat(subServiceData.base_price.toString()) : 0,
        currency: 'INR', // Currency is always INR
        duration_minutes: subServiceData.duration_minutes ? parseInt(subServiceData.duration_minutes.toString(), 10) : 1,
      };

      // Include image if a new file was uploaded
      // CRITICAL: Check if image is a File object (not an empty object or null)
      if (subServiceData.image && subServiceData.image instanceof File) {
        updateData.image = subServiceData.image;
        console.log(' Sub-service update: New image file provided', {
          fileName: subServiceData.image.name,
          fileSize: subServiceData.image.size,
          fileType: subServiceData.image.type,
          isFile: subServiceData.image instanceof File,
          note: 'File will be uploaded - backend will set image_url after processing'
        });
        // Explicitly do NOT set image_url when sending a file - backend will handle it
      } else if (subServiceData.image && typeof subServiceData.image === 'object' && Object.keys(subServiceData.image).length === 0) {
        // Image is an empty object {} - this means no new file was selected, keep existing image_url
        console.log('Sub-service update: Empty image object detected - keeping existing image_url');
        // Don't include image or image_url - backend will keep the existing one
      } else if (subServiceData.image === null || subServiceData.image === undefined) {
        // No image file provided - use existing image_url if available
        if (subServiceData.image_url !== undefined) {
          updateData.image_url = subServiceData.image_url || null;
          console.log('Sub-service update: No new file, using image_url', { image_url: updateData.image_url });
        } else {
          console.log('Sub-service update: No image file and no image_url - backend will keep existing');
        }
      } else if (subServiceData.image_url !== undefined) {
        // Always send image_url if it's defined (even if null/empty) to preserve or clear it
        // This is only used when NOT uploading a new file
        updateData.image_url = subServiceData.image_url || null;
        console.log('Sub-service update: image_url provided (no file upload)', { image_url: updateData.image_url });
      }

      // base_price, currency, and duration_minutes are now always included (required fields)

      updateSubService({
        subServiceId,
        data: updateData
      });
    } else {
      // Create new sub-service
      setIsCreating(true);
      try {
        const createData: any = {
          service_id: subServiceData.serviceId,
          name: subServiceData.name,
          description: subServiceData.description || '',
          is_active: subServiceData.status === 'active',
          sort_order: subServiceData.displayOrder || 1,
          base_price: subServiceData.base_price ? parseFloat(subServiceData.base_price.toString()) : 0,
          currency: subServiceData.currency || 'INR',
          duration_minutes: subServiceData.duration_minutes ? parseInt(subServiceData.duration_minutes.toString(), 10) : 1,
        };

        // Include image if uploaded
        if (subServiceData.image instanceof File) {
          createData.image = subServiceData.image;
          console.log('Sub-service create: Image file provided', {
            fileName: subServiceData.image.name,
            fileSize: subServiceData.image.size,
            fileType: subServiceData.image.type,
            isFile: subServiceData.image instanceof File
          });
        } else if (subServiceData.image_url) {
          createData.image_url = subServiceData.image_url;
          console.log('Sub-service create: image_url provided', { image_url: subServiceData.image_url });
        } else {
          console.log('Sub-service create: No image provided');
        }

        console.log('Sub-service create: Sending data to service', {
          hasImage: !!createData.image,
          hasImageUrl: !!createData.image_url,
          imageType: createData.image instanceof File ? 'File' : typeof createData.image
        });

        await subServiceService.createSubService(createData);
        toast.success('Sub-service created successfully');
        refetch();
        setIsFormOpen(false);
        setEditingSubService(null);
        onCreateSubService?.(subServiceData);
      } catch (error: any) {
        toast.error(error.message || 'Failed to create sub-service');
      } finally {
        setIsCreating(false);
      }
    }
  };

  const handleToggleStatus = useCallback((subServiceId: string, checked: boolean) => {
    updateSubService({
      subServiceId,
      data: {
        is_active: checked
      }
    });
  }, [updateSubService]);

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

  const getCategoryName = (subService: ISubService) => {
    // First try to get categoryName from the normalized data
    if ((subService as any).categoryName) {
      return (subService as any).categoryName;
    }
    // Then try to get from nested service.category structure
    if ((subService as any).service?.category?.name) {
      return (subService as any).service.category.name;
    }
    // Then try to get from nested category structure
    if ((subService as any).category?.name) {
      return (subService as any).category.name;
    }
    // Fallback to availableCategories lookup
    if (subService.categoryId) {
      return availableCategories.find(c => c.id === subService.categoryId)?.name || 'Unknown';
    }
    return 'Unknown';
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="flex flex-row items-center justify-between w-full gap-4">
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
                            {(() => {
                              // Use sub-service's own image_url only (no fallback to icon_url)
                              const imageUrl = (subService as any).image_url || (subService as any).imageUrl || (subService as any).image || (subService as any).image_path || '';
                              const fullImageUrl = getImageUrl(imageUrl);

                              // If image URL is invalid (local path, etc.), show placeholder
                              if (!fullImageUrl && imageUrl) {
                                return (
                                  <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                    <KeenIcon icon="image" className="text-gray-400 text-lg" />
                                  </div>
                                );
                              }

                              return fullImageUrl ? (
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                  <img
                                    src={fullImageUrl}
                                    alt={subService.name || 'Sub-service'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                  <KeenIcon icon="image" className="text-gray-400 text-lg" />
                                </div>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{subService.name || 'N/A'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {getCategoryName(subService)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(subService.status || 'inactive')}
                              <Switch
                                checked={subService.status === 'active'}
                                onCheckedChange={(checked) => handleToggleStatus(subService.id, checked)}
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
                      onClick={() => {
                        if (pagination.page > 1 && !isFetching) {
                          setCurrentPage(pagination.page - 1);
                        }
                      }}
                      disabled={pagination.page <= 1 || isFetching}
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
                      onClick={() => {
                        if (pagination.page < pagination.totalPages && !isFetching) {
                          setCurrentPage(pagination.page + 1);
                        }
                      }}
                      disabled={pagination.page >= pagination.totalPages || isFetching}
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

    
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <KeenIcon icon="trash" className="text-danger" />
              Delete Sub-Service
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete the sub-service <strong className="text-black">"{subServiceToDelete ? subServices.find(s => s.id === subServiceToDelete)?.name || 'this sub-service' : 'this sub-service'}"</strong>?
              This action cannot be undone.
            </p>
          </DialogBody>
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
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Deleting...
                </span>
              ) : (
                <>
                  <KeenIcon icon="trash" className="me-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
};

export { SubServiceManagement };

