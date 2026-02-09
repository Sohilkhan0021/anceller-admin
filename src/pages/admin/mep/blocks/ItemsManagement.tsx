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
import { ItemForm } from '../forms/ItemForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';
import { getImageUrl } from '@/utils/imageUrl';
import { useProjectItems, useItems, useCreateItem, useUpdateItem, useDeleteItem } from '@/services';

interface IItem {
  id: string;
  name: string;
  project_item_id: string;
  project_item_name?: string;
  description?: string;
  quantity?: number;
  unit?: string;
  price?: number;
  status: 'active' | 'inactive';
  displayOrder?: number;
  image_url?: string;
  imageUrl?: string;
  image?: string;
  is_active?: boolean;
  meta_data?: any;
}

interface IItemsManagementProps {
  projectItems?: any[];
  onCreateItem?: (item: any) => void;
  onUpdateItem?: (item: any) => void;
  onDeleteItem?: (itemId: string) => void;
}

const ItemsManagement = ({
  projectItems = [],
  onCreateItem,
  onUpdateItem,
  onDeleteItem
}: IItemsManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [projectItemFilter, setProjectItemFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Fetch project items for the dropdown
  const { projectItems: fetchedProjectItems } = useProjectItems({
    page: 1,
    limit: 100, // Get all project items for dropdown
    status: 'active', // Only active project items
  });

  // Use fetched project items or fallback to props
  const availableProjectItems = fetchedProjectItems.length > 0 ? fetchedProjectItems : (projectItems || []);

  // Fetch items from API
  const { 
    items: fetchedItems, 
    pagination, 
    isLoading, 
    isError, 
    error, 
    refetch, 
    isFetching 
  } = useItems({
    page: currentPage,
    limit: pageSize,
    status: statusFilter === 'all' ? '' : statusFilter,
    project_item_id: projectItemFilter !== 'all' ? projectItemFilter : '',
    search: debouncedSearch,
  });

  const items = fetchedItems || [];

  const createItemMutation = useCreateItem({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create item');
    }
  });

  const updateItemMutation = useUpdateItem({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update item');
    }
  });

  const deleteItemMutation = useDeleteItem({
    onSuccess: () => {
      toast.success('Item deleted successfully');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete item');
    }
  });

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState({
    order: true,
    image: true,
    name: true,
    projectItem: true,
    price: true,
    status: true,
    actions: true,
  });

  const toggleColumn = (column: keyof typeof columnVisibility) => {
    setColumnVisibility(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);


  // Handle filter changes
  const handleProjectItemFilterChange = useCallback((value: string) => {
    setProjectItemFilter(value);
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  const handleAddItem = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEditItem = (item: IItem) => {
    const itemWithData: any = {
      ...item,
      id: item.id || (item as any).public_id || (item as any).item_id,
      project_item_id: item.project_item_id || (item as any).project_item_id,
      image_url: (item as any).image_url || (item as any).imageUrl || (item as any).image,
      status: item.status || ((item as any).is_active === false ? 'inactive' : 'active'),
      displayOrder: item.displayOrder || (item as any).display_order || (item as any).sort_order || 1,
      is_active: item.status === 'active' || ((item as any).is_active !== false && item.status !== 'inactive')
    };
    setEditingItem(itemWithData);
    setIsFormOpen(true);
  };

  const handleCloneItem = async (item: IItem) => {
    try {
      const clonedData: any = {
        project_item_id: item.project_item_id || (item as any).project_item_id,
        name: `${item.name} (Copy)`,
        description: (item as any).description || '',
        is_active: false, // Clone as inactive by default
        sort_order: (item.displayOrder || (item as any).display_order || (item as any).sort_order || 1) + 1,
        quantity: item.quantity || 0,
        unit: item.unit || '',
      };

      const imageUrl = (item as any).image_url || (item as any).imageUrl || (item as any).image;
      if (imageUrl && typeof imageUrl === 'string') {
        clonedData.image_url = imageUrl;
      }

      // Use the create mutation to clone
      createItemMutation.mutate(clonedData, {
        onSuccess: () => {
          toast.success('Item cloned successfully');
        }
      });
    } catch (error: any) {
      console.error('Error cloning item:', error);
      toast.error(error.message || 'Failed to clone item');
    }
  };

  const handleSaveItem = async (itemData: any) => {
    // This function is called from ItemForm's onSave, but ItemForm now handles mutations directly
    // So this is just a placeholder - the actual save happens in ItemForm
  };

  const handleToggleStatus = useCallback((itemId: string, checked: boolean) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    updateItemMutation.mutate({
      id: itemId,
      name: item.name,
      description: item.description || '',
      project_item_id: item.project_item_id || '',
      quantity: (item as any).quantity,
      unit: (item as any).unit || '',
      sort_order: item.displayOrder || (item as any).sort_order || 1,
      is_active: checked
    }, {
      onSuccess: () => {
        toast.success('Item status updated');
      }
    });
  }, [items, updateItemMutation]);

  const handleDeleteClick = (itemId: string) => {
    setItemToDelete(itemId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteItemMutation.mutate(itemToDelete);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-success text-white">Active</Badge>
    ) : (
      <Badge variant="outline">Inactive</Badge>
    );
  };

  const getProjectItemName = (item: IItem) => {
    if (item.project_item_name) {
      return item.project_item_name;
    }
    if (item.project_item_id) {
      return availableProjectItems.find(p => p.id === item.project_item_id)?.name || 'Unknown';
    }
    return 'Unknown';
  };

  const formatPrice = (item: IItem) => {
    // Check for price in item.price, meta_data.price, or meta_data?.price
    let price = item.price;
    if (!price && item.meta_data) {
      if (typeof item.meta_data === 'object' && item.meta_data.price) {
        price = typeof item.meta_data.price === 'number' ? item.meta_data.price : parseFloat(item.meta_data.price);
      }
    }
    if (!price || isNaN(price)) {
      return '₹0';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="flex flex-row items-center justify-between w-full gap-4">
            <div>
              <h3 className="card-title">
                Items {pagination ? `(${pagination.total})` : `(${items.length})`}
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
                        id="col-projectItem"
                        checked={columnVisibility.projectItem}
                        onCheckedChange={() => toggleColumn('projectItem')}
                      />
                      <label htmlFor="col-projectItem" className="text-sm font-medium leading-none cursor-pointer">
                        Project Item
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 px-2 py-1.5">
                      <Checkbox
                        id="col-price"
                        checked={columnVisibility.price}
                        onCheckedChange={() => toggleColumn('price')}
                      />
                      <label htmlFor="col-price" className="text-sm font-medium leading-none cursor-pointer">
                        Price
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
              <Button size="sm" onClick={handleAddItem}>
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
              <Select value={projectItemFilter} onValueChange={handleProjectItemFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by project item" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Project Items</SelectItem>
                  {availableProjectItems.map((projectItem) => (
                    <SelectItem key={projectItem.id} value={projectItem.id}>
                      {projectItem.name}
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
          ) : items.length === 0 ? (
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
                      {columnVisibility.projectItem && <TableHead>Project Item</TableHead>}
                      {columnVisibility.price && <TableHead className="w-[120px]">Price</TableHead>}
                      {columnVisibility.status && <TableHead className="w-[100px]">Status</TableHead>}
                      {columnVisibility.actions && <TableHead className="w-[150px]">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => {
                      const displayOrder = item.displayOrder ?? (index + 1);

                      return (
                        <TableRow key={item.id}>
                          {columnVisibility.order && (
                            <TableCell>
                              <div className="text-sm font-medium text-center">{displayOrder}</div>
                            </TableCell>
                          )}
                          {columnVisibility.image && (
                            <TableCell>
                            {(() => {
                              const imageUrl = (item as any).image_url || (item as any).imageUrl || (item as any).image || (item as any).image_path || '';
                              const fullImageUrl = getImageUrl(imageUrl);

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
                                    alt={item.name || 'Item'}
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
                              <div className="font-medium">{item.name || 'N/A'}</div>
                            </TableCell>
                          )}
                          {columnVisibility.projectItem && (
                            <TableCell>
                              <div className="text-sm text-gray-600">
                                {getProjectItemName(item)}
                              </div>
                            </TableCell>
                          )}
                          {columnVisibility.price && (
                            <TableCell>
                              <div className="text-sm font-medium text-gray-900">
                                {formatPrice(item)}
                              </div>
                            </TableCell>
                          )}
                          {columnVisibility.status && (
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(item.status || 'inactive')}
                                <Switch
                                  checked={item.status === 'active'}
                                  onCheckedChange={(checked) => handleToggleStatus(item.id, checked)}
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
                                    <DropdownMenuItem onClick={() => handleEditItem(item)}>
                                      <KeenIcon icon="pencil" className="me-2" />
                                      Edit Item
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleCloneItem(item)}>
                                      <KeenIcon icon="copy" className="me-2" />
                                      Clone Item
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteClick(item.id)}
                                      className="text-danger"
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
      <ItemForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
          refetch();
        }}
        onSave={handleSaveItem}
        itemData={editingItem}
        availableProjectItems={availableProjectItems}
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
              Are you sure you want to delete the item <strong className="text-black">"{itemToDelete ? items.find(i => i.id === itemToDelete)?.name || 'this item' : 'this item'}"</strong>?
              This action cannot be undone.
            </p>
          </DialogBody>
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
              <KeenIcon icon="trash" className="me-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { ItemsManagement };
