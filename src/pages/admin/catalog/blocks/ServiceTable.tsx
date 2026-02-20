import { useState, useEffect, useCallback } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { useServices, useDeleteService, useUpdateService, useCategories } from '@/services';
import { IService } from '@/services/service.types';
import { toast } from 'sonner';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';
import { getImageUrl } from '@/utils/imageUrl';

interface IServiceTableProps {
  onEditService?: (service: IService) => void;
  onAddService?: () => void;
}

const ServiceTable = ({ onEditService, onAddService }: IServiceTableProps) => {
  const [sortBy, setSortBy] = useState('displayOrder');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);


  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch all services (categories) for dropdown filter
  const { categories: allCategories, isLoading: isLoadingCategories } = useCategories({
    page: 1,
    limit: 1000, // Very high limit to get all services for dropdown (no pagination)
    status: '' // Get all statuses for dropdown
  });

  // Ensure categories (services) is always an array
  const availableServices = Array.isArray(allCategories) ? allCategories : [];

  // Fetch services with filters
  const {
    services,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useServices({
    page: currentPage,
    limit: pageSize,
    status: '', // We'll handle status filtering client-side if needed
    search: debouncedSearch,
  });

  // Update service mutation
  const { mutate: updateService } = useUpdateService({
    onSuccess: () => {
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update sub-service status');
    }
  });

  // Delete service mutation
  const { mutate: deleteService, isLoading: isDeleting } = useDeleteService({
    onSuccess: (data) => {
      toast.success('Sub-Service deleted successfully');
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete sub-service');
    }
  });


  // Column visibility state - description and popularity hidden by default
  const [columnVisibility, setColumnVisibility] = useState({
    order: true,
    subService: true,
    service: true,
    description: false, // Hidden by default
    status: true,
    popularity: false, // Hidden by default
    bookings: true,
    revenue: true,
    actions: true,
  });

  const toggleColumn = (column: keyof typeof columnVisibility) => {
    setColumnVisibility(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  // Helper function to format duration from minutes to readable format
  const formatDuration = (minutes?: number): string => {
    if (!minutes) return 'N/A';
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
    return `${hours}h ${mins}min`;
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      currencyDisplay: 'symbol', // Ensure ₹ symbol is displayed
    }).format(amount);
  };

  const handleToggleStatus = useCallback((serviceId: string, newStatus: boolean) => {
    updateService({
      id: serviceId,
      is_active: newStatus
    });
  }, [updateService]);

  const handleEditPricing = (serviceId: string) => {
    // TODO: Implement edit pricing
    console.log('Editing pricing for service:', serviceId);
  };

  const handleEditService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service && onEditService) {
      // Ensure all fields are properly mapped for editing
      const serviceWithData: any = {
        ...service,
        id: service.id || service.public_id || (service as any).service_id,
        // Map all fields properly
        name: service.name,
        description: service.description,
        image_url: service.image_url || service.image,
        status: service.status || ((service as any).is_active === false ? 'inactive' : 'active'),
        displayOrder: service.displayOrder || service.display_order || (service as any).sort_order || 1,
        is_active: service.status === 'active' || ((service as any).is_active !== false && service.status !== 'inactive'),
        // Include categoryId - already normalized by useServices hook
        categoryId: service.categoryId || (service as any).category_id,
        category_id: service.categoryId || (service as any).category_id,
        // Include category object if available
        category: service.category || (service as any).category
      };
      onEditService(serviceWithData);
    }
  };

  const handleDeleteClick = (serviceId: string) => {
    setServiceToDelete(serviceId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (serviceToDelete) {
      deleteService(serviceToDelete);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-success text-white">Active</Badge>
    ) : (
      <Badge variant="outline">Inactive</Badge>
    );
  };
  
  

  const getPopularityBadge = (popularity: number) => {
    if (popularity >= 90) return { variant: 'success', text: 'Very Popular' };
    if (popularity >= 80) return { variant: 'info', text: 'Popular' };
    if (popularity >= 70) return { variant: 'warning', text: 'Moderate' };
    return { variant: 'secondary', text: 'Low' };
  };


  // Client-side filtering for service (category) - filter by service/category
  let filteredServices = services.filter(service => {
    const matchesService = serviceFilter === 'all' || service.categoryId === serviceFilter || service.id === serviceFilter;
    return matchesService;
  });

  // Sort services (client-side sorting)
  filteredServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case 'displayOrder':
        return (a.displayOrder || 999) - (b.displayOrder || 999);
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'price':
        return (a.basePrice || 0) - (b.basePrice || 0);
      case 'popularity':
        return (b.popularity || 0) - (a.popularity || 0);
      case 'bookings':
        return (b.bookings || 0) - (a.bookings || 0);
      case 'revenue':
        return (b.revenue || 0) - (a.revenue || 0);
      default:
        return (a.displayOrder || 999) - (b.displayOrder || 999);
    }
  });

  return (
    <div className="card max-w-full w-full overflow-hidden">
      <div className="card-header max-w-full w-full overflow-hidden">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-row items-center justify-between w-full gap-4">
            <div>
              <h3 className="card-title">
                Sub-Service Management {pagination ? `(${pagination.total})` : `(${filteredServices.length})`}
              </h3>
              <p className="text-sm text-gray-600">Manage sub-service pricing and availability</p>
            </div>

            <Button size="sm" onClick={onAddService}>
              <KeenIcon icon="plus" className="me-2" />
              Add New Sub-Service
            </Button>
          </div>

          {/* Error State */}
          {isError && (
            <Alert variant="danger">
              <div className="flex items-center justify-between">
                <span>
                  {error?.message || 'Failed to load services. Please try again.'}
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

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 sm:w-64">
              <KeenIcon icon="magnifier" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {isLoadingCategories ? (
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

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="displayOrder">Display Order</SelectItem>
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="bookings">Bookings</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price</SelectItem>
              </SelectContent>
            </Select>

            {/* Columns Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-40">
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
                      id="col-subService"
                      checked={columnVisibility.subService}
                      onCheckedChange={() => toggleColumn('subService')}
                    />
                    <label htmlFor="col-subService" className="text-sm font-medium leading-none cursor-pointer">
                      Sub-Service Name
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 px-2 py-1.5">
                    <Checkbox
                      id="col-service"
                      checked={columnVisibility.service}
                      onCheckedChange={() => toggleColumn('service')}
                    />
                    <label htmlFor="col-service" className="text-sm font-medium leading-none cursor-pointer">
                      Service
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 px-2 py-1.5">
                    <Checkbox
                      id="col-description"
                      checked={columnVisibility.description}
                      onCheckedChange={() => toggleColumn('description')}
                    />
                    <label htmlFor="col-description" className="text-sm font-medium leading-none cursor-pointer">
                      Description
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
                      id="col-bookings"
                      checked={columnVisibility.bookings}
                      onCheckedChange={() => toggleColumn('bookings')}
                    />
                    <label htmlFor="col-bookings" className="text-sm font-medium leading-none cursor-pointer">
                      Bookings
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 px-2 py-1.5">
                    <Checkbox
                      id="col-revenue"
                      checked={columnVisibility.revenue}
                      onCheckedChange={() => toggleColumn('revenue')}
                    />
                    <label htmlFor="col-revenue" className="text-sm font-medium leading-none cursor-pointer">
                      Revenue
                    </label>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="card-body p-0 w-full overflow-hidden">
        {isLoading && !isFetching ? (
          <div className="p-8">
            <ContentLoader />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="p-8 text-center">
            <KeenIcon icon="tag" className="text-gray-400 text-4xl mx-auto mb-4" />
            <p className="text-gray-600">No sub-services found</p>
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <>
            <div className="scrollable-x-auto" style={{ width: '100%', maxWidth: '100%' }}>
              <table className="caption-bottom text-sm" style={{ minWidth: '1200px' }}>
                <TableHeader>
                  <TableRow>
                    {columnVisibility.order && <TableHead className="w-[50px] text-center">Order</TableHead>}
                    {columnVisibility.subService && <TableHead className="w-[200px]">Name</TableHead>}
                    {columnVisibility.service && <TableHead className="w-[200px]">Service</TableHead>}
                    {columnVisibility.description && <TableHead className="w-[160px]">Description</TableHead>}
                    {columnVisibility.status && <TableHead className="w-[100px]">Status</TableHead>}
                    {columnVisibility.popularity && <TableHead className="w-[90px]">Popularity</TableHead>}
                    {columnVisibility.bookings && <TableHead className="w-[70px] text-center">Bookings</TableHead>}
                    {columnVisibility.revenue && <TableHead className="w-[90px] text-center">Revenue</TableHead>}
                    {columnVisibility.actions && <TableHead className="w-[60px] text-center">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service, index) => {
                    const displayOrder = service.displayOrder ?? (index + 1);
                    return (
                      <TableRow key={service.id}>
                        {columnVisibility.order && (
                          <TableCell className="w-[50px]">
                            <div className="text-sm font-medium text-center">{displayOrder}</div>
                          </TableCell>
                        )}
                        {columnVisibility.subService && (
                          <TableCell className="w-[200px]">
                            <div className="flex items-center gap-2">
                              {(() => {
                                // Try multiple possible image field names
                                const imageUrl = (service as any).image_url || (service as any).imageUrl || (service as any).image || '';
                                const fullImageUrl = getImageUrl(imageUrl);

                                // If image URL is invalid (local path, etc.), show placeholder
                                if (!fullImageUrl && imageUrl) {
                                  return (
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 border border-gray-200 flex items-center justify-center">
                                      <KeenIcon icon="image" className="text-gray-400 text-lg" />
                                    </div>
                                  );
                                }

                                return fullImageUrl ? (
                                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                    <img
                                      src={fullImageUrl}
                                      alt={service.name || 'Sub-Service'}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 border border-gray-200 flex items-center justify-center">
                                    <KeenIcon icon="image" className="text-gray-400 text-lg" />
                                  </div>
                                );
                              })()}
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm truncate">{service.name || 'N/A'}</div>
                                <div className="text-xs text-gray-500 truncate">ID: {service.id || 'N/A'}</div>
                              </div>
                            </div>
                          </TableCell>
                        )}
                      {columnVisibility.service && (
                        <TableCell className="w-[200px]">
                          <div className="font-medium text-sm truncate" title={service.categoryName || '—'}>
                            {service.categoryName || '—'}
                          </div>
                        </TableCell>
                      )}
                      {columnVisibility.description && (
                        <TableCell className="w-[160px]">
                          <div className="text-sm text-gray-600 truncate" style={{ maxWidth: '160px' }} title={service.description || '—'}>
                            {service.description || '—'}
                          </div>
                        </TableCell>
                      )}
                      {columnVisibility.status && (
                        <TableCell className="w-[100px]">
                          <div className="flex items-center gap-1.5 flex-nowrap">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <Switch
                                      checked={service.status === 'active'}
                                      onCheckedChange={(checked) => handleToggleStatus(service.id, checked)}
                                      className="service-status-switch flex-shrink-0 data-[state=checked]:bg-danger data-[state=unchecked]:bg-transparent"
                                    />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Changes affect new bookings only</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <div className="flex-shrink-0">
                              {getStatusBadge(service.status || 'inactive')}
                            </div>
                          </div>
                        </TableCell>
                      )}
                      {columnVisibility.popularity && (
                        <TableCell className="w-[90px]">
                          <Badge variant="outline" className="badge-outline text-xs whitespace-nowrap px-1.5 py-0.5">
                            {getPopularityBadge(service.popularity || 0).text}
                          </Badge>
                        </TableCell>
                      )}
                      {columnVisibility.bookings && (
                        <TableCell className="w-[70px]">
                          <div className="text-center">
                            <div className="font-semibold text-sm">{service.bookings || 0}</div>
                          </div>
                        </TableCell>
                      )}
                      {columnVisibility.revenue && (
                        <TableCell className="w-[90px]">
                          <div className="text-center">
                            <div className="font-semibold text-success text-sm whitespace-nowrap">
                              {formatCurrency(service.revenue)}
                            </div>
                          </div>
                        </TableCell>
                      )}
                      {columnVisibility.actions && (
                        <TableCell className="w-[60px]">
                          <div className="flex items-center justify-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="flex-shrink-0 p-1 h-8 w-8">
                                  <KeenIcon icon="dots-vertical" className="text-base" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditService(service.id)}>
                                  <KeenIcon icon="pencil" className="me-2" />
                                  Edit Sub-Service
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(service.id)}
                                  className="text-danger"
                                  disabled={isDeleting}
                                >
                                  <KeenIcon icon="trash" className="me-2" />
                                  Delete Sub-Service
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="card-footer">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} services
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
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
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
              Are you sure you want to delete the service <strong className="text-black">"{serviceToDelete ? services.find(s => s.id === serviceToDelete)?.name || 'this service' : 'this service'}"</strong>?
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
    </div>
  );
};

export { ServiceTable };

