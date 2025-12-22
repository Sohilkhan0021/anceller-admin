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
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useServices, useDeleteService, useUpdateService } from '@/services';
import { IService } from '@/services/service.types';
import { toast } from 'sonner';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';

interface IServiceTableProps {
  onEditService?: (service: IService) => void;
}

const ServiceTable = ({ onEditService }: IServiceTableProps) => {
  const [sortBy, setSortBy] = useState('displayOrder');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subServiceFilter, setSubServiceFilter] = useState('all');
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
    category_id: categoryFilter === 'all' ? '' : categoryFilter,
    search: debouncedSearch,
  });

  // Update service mutation
  const { mutate: updateService } = useUpdateService({
    onSuccess: () => {
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update service status');
    }
  });

  // Delete service mutation
  const { mutate: deleteService, isLoading: isDeleting } = useDeleteService({
    onSuccess: (data) => {
      toast.success(data.message || 'Service deleted successfully');
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete service');
    }
  });

  // Handle filter changes
  const handleCategoryFilterChange = useCallback((value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  // Column visibility state - description and popularity hidden by default
  const [columnVisibility, setColumnVisibility] = useState({
    service: true,
    subService: true,
    description: false, // Hidden by default
    category: true,
    basePrice: true,
    duration: true,
    skills: true,
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
      onEditService(service);
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
    setDeleteDialogOpen(false);
    setServiceToDelete(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'success', text: 'Active' },
      inactive: { variant: 'destructive', text: 'Inactive' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'outline', text: status };
    return <Badge variant={config.variant as any}>{config.text}</Badge>;
  };

  const getPopularityBadge = (popularity: number) => {
    if (popularity >= 90) return { variant: 'success', text: 'Very Popular' };
    if (popularity >= 80) return { variant: 'info', text: 'Popular' };
    if (popularity >= 70) return { variant: 'warning', text: 'Moderate' };
    return { variant: 'secondary', text: 'Low' };
  };

  const getCategoryIcon = (category: string) => {
    const iconMap = {
      'Electrical': 'element-11',
      'Plumbing': 'water-drop',
      'AC': 'air-conditioner-2',
      'Cleaning': 'broom-2',
      'Carpentry': 'hammer-2',
      'Appliance': 'setting-2'
    };

    return iconMap[category as keyof typeof iconMap] || 'category';
  };

  // Extract unique sub-services from services for filter dropdown
  const uniqueSubServices = Array.from(
    new Map(services
      .filter(service => service.subServiceId)
      .map(service => [service.subServiceId, {
        id: service.subServiceId!,
        name: service.subServiceName || 'Unknown'
      }])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  // Client-side filtering for sub-service (if API doesn't support it)
  let filteredServices = services.filter(service => {
    const matchesSubService = subServiceFilter === 'all' || service.subServiceId === subServiceFilter;
    return matchesSubService;
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
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="card-title">
              Service Management {pagination ? `(${pagination.total})` : `(${filteredServices.length})`}
            </h3>
            <p className="text-sm text-gray-600">Manage service pricing and availability</p>
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
                placeholder="Search by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="ac">AC</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="carpentry">Carpentry</SelectItem>
                <SelectItem value="appliance">Appliance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={subServiceFilter} onValueChange={setSubServiceFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Sub-Services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sub-Services</SelectItem>
                {uniqueSubServices.map((subService) => (
                  <SelectItem key={subService.id} value={subService.id}>
                    {subService.name}
                  </SelectItem>
                ))}
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
              <DropdownMenuContent align="end" className="w-48">
                <div className="p-2 space-y-2">
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
                      id="col-subService"
                      checked={columnVisibility.subService}
                      onCheckedChange={() => toggleColumn('subService')}
                    />
                    <label htmlFor="col-subService" className="text-sm font-medium leading-none cursor-pointer">
                      Sub-Service
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
                      id="col-category"
                      checked={columnVisibility.category}
                      onCheckedChange={() => toggleColumn('category')}
                    />
                    <label htmlFor="col-category" className="text-sm font-medium leading-none cursor-pointer">
                      Category
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 px-2 py-1.5">
                    <Checkbox
                      id="col-basePrice"
                      checked={columnVisibility.basePrice}
                      onCheckedChange={() => toggleColumn('basePrice')}
                    />
                    <label htmlFor="col-basePrice" className="text-sm font-medium leading-none cursor-pointer">
                      Base Price
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 px-2 py-1.5">
                    <Checkbox
                      id="col-duration"
                      checked={columnVisibility.duration}
                      onCheckedChange={() => toggleColumn('duration')}
                    />
                    <label htmlFor="col-duration" className="text-sm font-medium leading-none cursor-pointer">
                      Duration
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 px-2 py-1.5">
                    <Checkbox
                      id="col-skills"
                      checked={columnVisibility.skills}
                      onCheckedChange={() => toggleColumn('skills')}
                    />
                    <label htmlFor="col-skills" className="text-sm font-medium leading-none cursor-pointer">
                      Skills/Tags
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
                      id="col-popularity"
                      checked={columnVisibility.popularity}
                      onCheckedChange={() => toggleColumn('popularity')}
                    />
                    <label htmlFor="col-popularity" className="text-sm font-medium leading-none cursor-pointer">
                      Popularity
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
            <p className="text-gray-600">No services found</p>
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
                    {columnVisibility.service && <TableHead className="w-[200px]">Service</TableHead>}
                    {columnVisibility.subService && <TableHead className="w-[150px]">Sub-Service</TableHead>}
                    {columnVisibility.description && <TableHead className="w-[160px]">Description</TableHead>}
                    {columnVisibility.category && <TableHead className="w-[100px]">Category</TableHead>}
                    {columnVisibility.basePrice && <TableHead className="w-[90px] text-center">Base Price</TableHead>}
                    {columnVisibility.duration && <TableHead className="w-[90px] text-center">Duration</TableHead>}
                    {columnVisibility.skills && <TableHead className="w-[140px]">Skills/Tags</TableHead>}
                    {columnVisibility.status && <TableHead className="w-[100px]">Status</TableHead>}
                    {columnVisibility.popularity && <TableHead className="w-[90px]">Popularity</TableHead>}
                    {columnVisibility.bookings && <TableHead className="w-[70px] text-center">Bookings</TableHead>}
                    {columnVisibility.revenue && <TableHead className="w-[90px] text-center">Revenue</TableHead>}
                    {columnVisibility.actions && <TableHead className="w-[60px] text-center">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      {columnVisibility.service && (
                        <TableCell className="w-[200px]">
                          <div className="flex items-center gap-2">
                            {(service.image || service.image_url) && (
                              <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <img
                                  src={service.image || service.image_url}
                                  alt={service.name || 'Service'}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop&crop=center';
                                    target.onerror = null; // Prevent infinite loop
                                  }}
                                />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-sm truncate">{service.name || 'N/A'}</div>
                              <div className="text-xs text-gray-500 truncate">ID: {service.id || 'N/A'}</div>
                            </div>
                          </div>
                        </TableCell>
                      )}
                      {columnVisibility.subService && (
                        <TableCell className="w-[150px]">
                          <div className="font-medium text-sm truncate" title={service.subServiceName || '—'}>
                            {service.subServiceName || '—'}
                          </div>
                        </TableCell>
                      )}
                      {columnVisibility.description && (
                        <TableCell className="w-[160px]">
                          <div className="text-sm text-gray-600 truncate" title={service.description}>
                            {service.description || '—'}
                          </div>
                        </TableCell>
                      )}
                      {columnVisibility.category && (
                        <TableCell className="w-[100px]">
                          <div className="text-sm truncate">
                            {service.categoryName ||
                              (typeof service.category === 'string' ? service.category :
                                (service.category && typeof service.category === 'object' ? service.category.name : 'N/A')) ||
                              'N/A'}
                          </div>
                        </TableCell>
                      )}
                      {columnVisibility.basePrice && (
                        <TableCell className="w-[90px]">
                          <div className="text-center">
                            <div className="font-semibold text-sm whitespace-nowrap">
                              {formatCurrency(service.basePrice)}
                            </div>
                          </div>
                        </TableCell>
                      )}
                      {columnVisibility.duration && (
                        <TableCell className="w-[90px]">
                          <div className="text-center">
                            <div className="text-sm whitespace-nowrap">{formatDuration(service.duration)}</div>
                          </div>
                        </TableCell>
                      )}
                      {columnVisibility.skills && (
                        <TableCell className="w-[140px]">
                          <div className="text-xs text-gray-600 truncate" title={service.skills}>
                            {service.skills || '—'}
                          </div>
                        </TableCell>
                      )}
                      {columnVisibility.status && (
                        <TableCell className="w-[100px]">
                          <div className="flex items-center gap-1.5 flex-nowrap">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Switch
                                    checked={service.status === 'active'}
                                    onCheckedChange={(checked) => handleToggleStatus(service.id, checked)}
                                    className="flex-shrink-0"
                                  />
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
                                  <KeenIcon icon="edit" className="me-2" />
                                  Edit Service
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(service.id)}
                                  className="text-danger"
                                  disabled={isDeleting}
                                >
                                  <KeenIcon icon="trash" className="me-2" />
                                  Delete Service
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="card-footer">
                <div className="flex items-center justify-between">
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
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service? This action cannot be undone.
              This will also affect any sub-services under this service.
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
    </div>
  );
};

export { ServiceTable };

