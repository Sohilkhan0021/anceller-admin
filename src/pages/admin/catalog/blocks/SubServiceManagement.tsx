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
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SubServiceForm } from '../forms/SubServiceForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { useSubServices, useDeleteSubService, useUpdateSubService, useCreateSubService, useSubServiceById } from '@/services';
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
  
  // Fetch all services (categories) for dropdown in form (no pagination)
  const { services: allServices, isLoading: isLoadingServices } = useServices({
    page: 1,
    limit: 1000, // Very high limit to get all services for dropdown (no pagination)
    status: '' // Get all statuses for dropdown
  });
  
  // Ensure services is always an array
  const availableServices = Array.isArray(allServices) ? allServices : [];
  
  // Fetch all sub-services for dropdown (use high limit to get all sub-services - no pagination)
  const { subServices: allSubServices, isLoading: isLoadingSubServices } = useSubServices({
    page: 1,
    limit: 1000, // Very high limit to fetch all sub-services for dropdown (no pagination)
    status: '' // Get all statuses for dropdown
  });
  
  // Ensure sub-services is always an array
  const availableSubServices = Array.isArray(allSubServices) ? allSubServices : [];

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState({
    order: true,
    image: true,
    name: true,
    service: true,
    subService: true,
    status: true,
    actions: true,
  });

  const toggleColumn = (column: keyof typeof columnVisibility) => {
    setColumnVisibility(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

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
        toast.success('Item updated successfully');
        refetch(); // Refresh the list to show updated data including image
        setIsFormOpen(false);
        setEditingSubService(null);

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
        toast.success(`Item updated successfully`);
      } else {
        toast.success('Item updated successfully');
      }

      refetch(); // Refresh the list to show updated data including image
      setIsFormOpen(false);
      setEditingSubService(null);
    },
    onError: (error: Error) => {
      console.error('Sub-service update error', { error: error.message, stack: error.stack });
      toast.error(error.message || 'Failed to update item');
    }
  });

  // Create sub-service mutation
  const { mutate: createSubService, isLoading: isCreating } = useCreateSubService({
    onSuccess: (data) => {
      toast.success('Item created successfully');
      refetch(); // This will be called automatically via query invalidation, but keeping for immediate feedback
      setIsFormOpen(false);
      setEditingSubService(null);
      onCreateSubService?.(data);
    },
    onError: (error: Error) => {
      console.error('Error creating item:', error);
      toast.error(error.message || 'Failed to create item');
    }
  });

  // Delete sub-service mutation
  const { mutate: deleteSubService, isLoading: isDeleting } = useDeleteSubService({
    onSuccess: (data) => {
      toast.success('Item deleted successfully');
      setDeleteDialogOpen(false);
      setSubServiceToDelete(null);
      refetch(); // Refresh the list
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete item');
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

  const handleCloneSubService = async (subService: ISubService) => {
    try {
      // Prepare cloned data with "Copy" appended to name
      const clonedData: any = {
        service_id: subService.serviceId || subService.service_id || (subService as any).service?.service_id,
        name: `${subService.name} (Copy)`,
        description: (subService as any).description || '',
        is_active: false, // Clone as inactive by default
        sort_order: (subService.displayOrder || subService.display_order || (subService as any).sort_order || 1) + 1,
        base_price: (subService as any).base_price || 0,
        currency: (subService as any).currency || 'INR',
        duration_minutes: (subService as any).duration_minutes || (subService as any).estimated_duration_minutes || 1,
      };

      // Include image_url if available (but not the file itself)
      const imageUrl = (subService as any).image_url || (subService as any).imageUrl || (subService as any).image;
      if (imageUrl && typeof imageUrl === 'string') {
        clonedData.image_url = imageUrl;
      }

      // Create the cloned item
      createSubService(clonedData);
    } catch (error: any) {
      console.error('Error cloning item:', error);
      toast.error(error.message || 'Failed to clone item');
    }
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
        image_url: subServiceData.image_url,
        image_url_type: typeof subServiceData.image_url,
        image_url_is_null: subServiceData.image_url === null,
        image_url_is_undefined: subServiceData.image_url === undefined
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
        console.log('🟢 Sub-service update: New image file provided', {
          fileName: subServiceData.image.name,
          fileSize: subServiceData.image.size,
          fileType: subServiceData.image.type,
          isFile: subServiceData.image instanceof File,
          note: 'File will be uploaded - backend will set image_url after processing'
        });
        // Explicitly do NOT set image_url when sending a file - backend will handle it
      } else {
        // No new file uploaded - handle image_url
        // CRITICAL: ALWAYS include image_url in updateData, even if undefined
        // This ensures the backend receives the field and can process deletion
        // If image_url is null, backend will delete the image
        // If image_url is undefined, we'll set it to a special value to signal "keep existing"
        // If image_url is a string, backend will update to that URL
        
        // IMPORTANT: We MUST always include image_url when editing, even if undefined
        // Use a sentinel value to distinguish between "delete" (null) and "keep existing" (undefined)
        // But since backend receives undefined as missing, we'll always send something
        if (subServiceData.image_url === null) {
          // Explicit deletion - send null
          updateData.image_url = null;
          console.log('🟢 Sub-service update: image_url is null - will delete image', { 
            image_url: updateData.image_url,
            image_url_type: typeof updateData.image_url,
            is_null: updateData.image_url === null,
            will_delete: true
          });
        } else if (subServiceData.image_url !== undefined) {
          // Explicit URL provided - send it
          updateData.image_url = subServiceData.image_url;
          console.log('🟢 Sub-service update: image_url provided', { 
            image_url: updateData.image_url,
            image_url_type: typeof updateData.image_url,
            will_delete: false
          });
        } else {
          // image_url is undefined - don't include it, backend keeps existing
          console.log('⚠️ Sub-service update: image_url is undefined - backend will keep existing');
        }
      }

      // base_price, currency, and duration_minutes are now always included (required fields)

      // CRITICAL DEBUG: Log the final updateData to verify image_url is included
      console.log('🔵 Sub-service update: Final updateData before API call', {
        hasImage: 'image' in updateData,
        hasImageUrl: 'image_url' in updateData,
        imageUrlValue: updateData.image_url,
        imageUrlType: typeof updateData.image_url,
        allKeys: Object.keys(updateData),
        updateDataStringified: JSON.stringify(updateData, (key, value) => {
          if (value instanceof File) return `[File: ${value.name}]`;
          return value;
        }, 2)
      });

      updateSubService({
        subServiceId,
        data: updateData
      });
    } else {
      // Create new sub-service
      console.log('handleSaveSubService - Creating new item', { subServiceData });
      
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

      console.log('🟢 Create data prepared:', createData);

      // Include image if uploaded
      if (subServiceData.image instanceof File) {
        createData.image = subServiceData.image;
        console.log('🟢 Sub-service create: Image file provided', {
          fileName: subServiceData.image.name,
          fileSize: subServiceData.image.size,
          fileType: subServiceData.image.type,
          isFile: subServiceData.image instanceof File
        });
      } else if (subServiceData.image_url) {
        createData.image_url = subServiceData.image_url;
        console.log('🟢 Sub-service create: image_url provided', { image_url: subServiceData.image_url });
      } else {
        console.log('🟢 Sub-service create: No image provided');
      }

      console.log('Sub-service create: Calling API with data', {
        hasImage: !!createData.image,
        hasImageUrl: !!createData.image_url,
        imageType: createData.image instanceof File ? 'File' : typeof createData.image,
        createData
      });

      // Use the mutation hook which will handle query invalidation automatically
      createSubService(createData);
    }
  };

  const handleToggleStatus = useCallback((subServiceId: string, checked: boolean) => {
    // Find the sub-service to preserve all its data
    const subService = subServices.find(s => s.id === subServiceId);
    if (!subService) {
      toast.error('Sub-service not found');
      return;
    }

    // Preserve all existing data when toggling status
    const updateData: any = {
      is_active: checked,
      // Preserve all other fields
      name: subService.name,
      description: (subService as any).description || '',
      service_id: subService.serviceId || subService.service_id || (subService as any).service?.service_id,
      base_price: (subService as any).base_price || (subService as any).basePrice || 0,
      currency: (subService as any).currency || 'INR',
      duration_minutes: (subService as any).duration_minutes || (subService as any).durationMinutes || 1,
      sort_order: subService.displayOrder || subService.display_order || (subService as any).sort_order || 1,
    };

    // Preserve image_url if it exists
    const imageUrl = (subService as any).image_url || (subService as any).imageUrl || (subService as any).image;
    if (imageUrl) {
      updateData.image_url = imageUrl;
    }

    updateSubService({
      subServiceId,
      data: updateData
    });
  }, [updateSubService, subServices]);

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

  const getServiceName = (subService: ISubService) => {
    // First priority: Get service name from nested service structure (service.name = "TV / Home")
    if ((subService as any).service?.name) {
      return (subService as any).service.name;
    }
    
    // Second priority: Look up from availableServices using serviceId
    if (subService.serviceId) {
      const service = availableServices.find(s => 
        s.id === subService.serviceId || 
        s.public_id === subService.serviceId ||
        (s as any).service_id === subService.serviceId ||
        (s as any).public_id === subService.serviceId
      );
      if (service && service.name) {
        return service.name;
      }
    }
    
    // Third priority: Try service_id field
    if ((subService as any).service_id) {
      const service = availableServices.find(s => 
        s.id === (subService as any).service_id || 
        s.public_id === (subService as any).service_id ||
        (s as any).service_id === (subService as any).service_id
      );
      if (service && service.name) {
        return service.name;
      }
    }
    
    // Fallback: Return Unknown if service name not found
    return 'Unknown';
  };

  // Client-side filtering for search and status (service filter is handled server-side)
  // Note: service filter is now handled server-side via API, but we keep client-side filtering
  // for search and status to ensure immediate UI updates
  let filteredSubServices = subServices.filter(subService => {
    // Filter by search term (server-side also handles this, but client-side provides immediate feedback)
    const matchesSearch = !debouncedSearch || 
      subService.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (subService as any).name?.toLowerCase().includes(debouncedSearch.toLowerCase());
    
    // Filter by status (server-side also handles this, but client-side provides immediate feedback)
    // Use status property which is normalized to 'active'/'inactive' by the hook
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && (subService.status === 'active' || (subService as any).is_active === true)) ||
      (statusFilter === 'inactive' && (subService.status === 'inactive' || (subService as any).is_active === false));
    
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="flex flex-row items-center justify-between w-full gap-4">
            <div>
              <h3 className="card-title">
                Items {pagination ? `(${pagination.total})` : `(${filteredSubServices.length})`}
              </h3>
              <p className="text-sm text-gray-600">Manage items (name and icon only)</p>
            </div>

            <div className="flex items-center gap-2">
              {/* Columns Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-32">
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 max-h-[400px] overflow-y-auto">
                  <div className="p-2 space-y-2">
                    <div className="flex items-center space-x-2 px-2 py-1.5">
                      <Checkbox
                        id="col-order"
                        checked={columnVisibility.order}
                        onCheckedChange={() => toggleColumn('order')}
                      />
                      <label htmlFor="col-order" className="text-sm font-medium leading-none cursor-pointer">
                        Order
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 px-2 py-1.5">
                      <Checkbox
                        id="col-image"
                        checked={columnVisibility.image}
                        onCheckedChange={() => toggleColumn('image')}
                      />
                      <label htmlFor="col-image" className="text-sm font-medium leading-none cursor-pointer">
                        Image
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 px-2 py-1.5">
                      <Checkbox
                        id="col-name"
                        checked={columnVisibility.name}
                        onCheckedChange={() => toggleColumn('name')}
                      />
                      <label htmlFor="col-name" className="text-sm font-medium leading-none cursor-pointer">
                        Name
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 px-2 py-1.5">
                      <Checkbox
                        id="col-service"
                        checked={columnVisibility.service}
                        onCheckedChange={() => toggleColumn('service')}
                      />
                      <label htmlFor="col-service" className="text-sm font-medium leading-none cursor-pointer">
                        Sub-Service
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 px-2 py-1.5">
                      <Checkbox
                        id="col-status"
                        checked={columnVisibility.status}
                        onCheckedChange={() => toggleColumn('status')}
                      />
                      <label htmlFor="col-status" className="text-sm font-medium leading-none cursor-pointer">
                        Status
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 px-2 py-1.5">
                      <Checkbox
                        id="col-actions"
                        checked={columnVisibility.actions}
                        onCheckedChange={() => toggleColumn('actions')}
                      />
                      <label htmlFor="col-actions" className="text-sm font-medium leading-none cursor-pointer">
                        Actions
                      </label>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" onClick={handleAddSubService}>
                <KeenIcon icon="plus" className="me-2" />
                Add Item
              </Button>
            </div>
          </div>
        </div>

        <div className="card-body">
          {/* Error State */}
          {isError && (
            <Alert variant="danger" className="mb-4">
              <div className="flex items-center justify-between">
                <span>
                  {error?.message || 'Failed to load items. Please try again.'}
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
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Select value={serviceFilter} onValueChange={handleServiceFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {isLoadingServices ? (
                    <SelectItem value="loading" disabled>Loading services...</SelectItem>
                  ) : availableServices && Array.isArray(availableServices) && availableServices.length > 0 ? (
                    availableServices.map((service) => {
                      const serviceId = service.id || service.public_id || service.category_id;
                      const serviceName = service.name;
                      // Ensure serviceId is a string (not undefined)
                      if (!serviceId) return null;
                      return (
                        <SelectItem key={serviceId} value={serviceId}>
                          {serviceName}
                        </SelectItem>
                      );
                    }).filter(Boolean)
                  ) : (
                    <SelectItem value="no-services" disabled>No services available</SelectItem>
                  )}
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
          ) : filteredSubServices.length === 0 ? (
            <div className="p-8 text-center">
              <KeenIcon icon="category" className="text-gray-400 text-4xl mx-auto mb-4" />
              <p className="text-gray-600">No items found</p>
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <>
              {/* Items Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columnVisibility.order && <TableHead className="w-[50px]">Order</TableHead>}
                      {columnVisibility.image && <TableHead className="w-[80px]">Image</TableHead>}
                      {columnVisibility.name && <TableHead>Name</TableHead>}
                      {columnVisibility.subService && <TableHead>Sub-Service</TableHead>}
                      {columnVisibility.status && <TableHead className="w-[100px]">Status</TableHead>}
                      {columnVisibility.actions && <TableHead className="w-[150px]">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubServices && filteredSubServices.length > 0 ? (
                      filteredSubServices.map((subService, index) => {
                        // Handle displayOrder - might be undefined
                        const displayOrder = subService.displayOrder ?? (index + 1);

                        return (
                          <TableRow key={subService.id}>
                            {columnVisibility.order && (
                              <TableCell>
                                <div className="text-sm font-medium text-center">{displayOrder}</div>
                              </TableCell>
                            )}
                            {columnVisibility.image && (
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
                            )}
                            {columnVisibility.name && (
                              <TableCell>
                                <div className="font-medium">{subService.name || 'N/A'}</div>
                              </TableCell>
                            )}
                            {columnVisibility.subService && (
                              <TableCell>
                                <div className="text-sm text-gray-600">
                                  {getServiceName(subService)}
                                </div>
                              </TableCell>
                            )}
                            {columnVisibility.status && (
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(subService.status || 'inactive')}
                                  <Switch
                                    checked={subService.status === 'active'}
                                    onCheckedChange={(checked) => handleToggleStatus(subService.id, checked)}
                                    className="data-[state=checked]:bg-danger"
                                  />
                                </div>
                              </TableCell>
                            )}
                            {columnVisibility.actions && (
                              <TableCell>
                                <div className="flex items-center justify-center">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="flex-shrink-0 p-1 h-8 w-8">
                                        <KeenIcon icon="dots-vertical" className="text-base" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditSubService(subService)}>
                                        <KeenIcon icon="pencil" className="me-2" />
                                        Edit Item
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleCloneSubService(subService)}>
                                        <KeenIcon icon="copy" className="me-2" />
                                        Clone Item
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteClick(subService.id)}
                                        className="text-danger"
                                        disabled={isDeleting}
                                      >
                                        <KeenIcon icon="trash" className="me-2" />
                                        Delete Item
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={Object.values(columnVisibility).filter(Boolean).length} className="text-center py-8">
                          <div className="text-gray-500">No sub-services found</div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} items
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

      {/* Item Form Modal */}
      <SubServiceForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSubService(null);
        }}
        onSave={handleSaveSubService}
        subServiceData={editingSubService}
        availableServices={availableServices}
        availableCategories={availableCategories}
      />

    
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <KeenIcon icon="trash" className="text-danger" />
              Delete Item
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete the item <strong className="text-black">"{subServiceToDelete ? subServices.find(s => s.id === subServiceToDelete)?.name || 'this item' : 'this item'}"</strong>?
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

