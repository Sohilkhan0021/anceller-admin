import { useState, useEffect, useCallback } from 'react';
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
import { AddOnForm } from '../forms/AddOnForm';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAddOns, useUpdateAddOn } from '@/services';
import { IAddOn } from '@/services/addon.types';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';

interface IAddOnsManagementProps {
  services?: any[]; // List of all services for assignment
  onCreateAddOn?: (addOn: any) => void;
  onUpdateAddOn?: (addOn: any) => void;
  onDeleteAddOn?: (addOnId: string) => void;
}

const AddOnsManagement = ({ 
  services = [],
  onCreateAddOn, 
  onUpdateAddOn, 
  onDeleteAddOn 
}: IAddOnsManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState<IAddOn | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addOnToDelete, setAddOnToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch add-ons with filters
  const { 
    addOns, 
    pagination, 
    isLoading, 
    isError, 
    error, 
    refetch,
    isFetching 
  } = useAddOns({
    page: currentPage,
    limit: pageSize,
    status: statusFilter === 'all' ? '' : statusFilter,
    search: debouncedSearch,
  });

  // Update add-on mutation
  const { mutate: updateAddOn } = useUpdateAddOn({
    onSuccess: () => {
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update add-on status');
    }
  });

  // Handle filter changes
  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  // Mock services data (for backward compatibility)
  const mockServices = [
    { id: '1', name: 'Electrical Wiring', category: 'Electrical' },
    { id: '2', name: 'Fan Installation', category: 'Electrical' },
    { id: '3', name: 'Pipe Repair', category: 'Plumbing' },
    { id: '4', name: 'AC Service & Repair', category: 'AC Services' },
    { id: '5', name: 'Deep Cleaning', category: 'Cleaning' }
  ];

  const availableServices = services.length > 0 ? services : mockServices;

  const handleAddAddOn = () => {
    setEditingAddOn(null);
    setIsFormOpen(true);
  };

  const handleEditAddOn = (addOn: IAddOn) => {
    setEditingAddOn(addOn);
    setIsFormOpen(true);
  };

  const handleSaveAddOn = (addOnData: any) => {
    if (editingAddOn) {
      onUpdateAddOn?.(addOnData);
      toast.success('Add-on updated successfully');
    } else {
      onCreateAddOn?.(addOnData);
      toast.success('Add-on created successfully');
    }
    setIsFormOpen(false);
    setEditingAddOn(null);
    // Refetch add-ons after save
    refetch();
  };

  const handleToggleStatus = useCallback((addOnId: string, checked: boolean) => {
    updateAddOn({
      addOnId,
      data: {
        is_active: checked
      }
    });
  }, [updateAddOn]);

  const handleDeleteClick = (addOnId: string) => {
    setAddOnToDelete(addOnId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (addOnToDelete) {
      onDeleteAddOn?.(addOnToDelete);
      toast.success('Add-on deleted successfully');
      // Refetch after delete
      refetch();
    }
    setDeleteDialogOpen(false);
    setAddOnToDelete(null);
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-success text-white">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  const getServiceNames = (serviceIds?: string[]) => {
    if (!serviceIds || serviceIds.length === 0) return '—';
    return serviceIds
      .map(id => availableServices.find(s => s.id === id)?.name)
      .filter(Boolean)
      .join(', ') || '—';
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

  // Temporary flag to show "coming soon" message
  // Set to false to restore original functionality
  const SHOW_COMING_SOON = true;

  // Temporary: Show "coming soon" message
  if (SHOW_COMING_SOON) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="p-8 text-center">
            <p className="text-lg text-gray-600">This feature will be available very soon.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="flex flex-row items-center justify-between w-full gap-4">
            <div>
              <h3 className="card-title">
                Add-Ons & Extras {pagination ? `(${pagination.total})` : `(${addOns.length})`}
              </h3>
              <p className="text-sm text-gray-600">Manage additional charges and extras</p>
            </div>
            
            <Button size="sm" onClick={handleAddAddOn}>
              <KeenIcon icon="plus" className="me-2" />
              Add Add-On
            </Button>
          </div>
        </div>
        
        <div className="card-body">
          {/* Error State */}
          {isError && (
            <Alert variant="danger" className="mb-4">
              <div className="flex items-center justify-between">
                <span>
                  {error?.message || 'Failed to load add-ons. Please try again.'}
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
                  placeholder="Search add-ons..."
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
          ) : addOns.length === 0 ? (
            <div className="p-8 text-center">
              <KeenIcon icon="plus" className="text-gray-400 text-4xl mx-auto mb-4" />
              <p className="text-gray-600">No add-ons found</p>
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <>
              {/* Add-Ons Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Pricing Type</TableHead>
                      <TableHead>Applies To</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[150px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {addOns.map((addOn) => (
                  <TableRow key={addOn.id}>
                      <TableCell>
                        <div className="font-medium">{addOn.name || 'N/A'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">{formatCurrency(addOn.price)}</div>
                      </TableCell>
                      <TableCell>
                        {addOn.isPerUnit ? (
                          <Badge variant="outline">Per Unit</Badge>
                        ) : (
                          <Badge variant="outline">Flat Price</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 max-w-md">
                          {getServiceNames(addOn.appliesTo)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(addOn.status || 'inactive')}
                          <Switch
                            checked={addOn.status === 'active'}
                            onCheckedChange={(checked) => handleToggleStatus(addOn.id, checked)}
                          />
                        </div>
                      </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditAddOn(addOn)}
                        >
                          <KeenIcon icon="pencil" className="me-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteClick(addOn.id)}
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

              {/* Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} add-ons
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

      {/* Add-On Form Modal */}
      <AddOnForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingAddOn(null);
        }}
        onSave={handleSaveAddOn}
        addOnData={editingAddOn}
        availableServices={availableServices}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Add-On</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this add-on? This action cannot be undone.
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

export { AddOnsManagement };

