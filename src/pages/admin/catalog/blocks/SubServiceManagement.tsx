import { useState } from 'react';
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
import { useSnackbar } from 'notistack';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

interface ISubService {
  id: string;
  name: string;
  categoryId: string;
  icon: string;
  image?: string; // Image URL or placeholder
  status: 'active' | 'inactive';
  displayOrder: number;
}

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
  const { enqueueSnackbar } = useSnackbar();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubService, setEditingSubService] = useState<ISubService | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subServiceToDelete, setSubServiceToDelete] = useState<string | null>(null);

  // Mock categories
  const mockCategories = [
    { id: '1', name: 'Electrical' },
    { id: '2', name: 'Plumbing' },
    { id: '3', name: 'AC Services' },
    { id: '4', name: 'Cleaning' },
    { id: '5', name: 'Carpentry' },
    { id: '6', name: 'Appliance' }
  ];

  const availableCategories = categories.length > 0 ? categories : mockCategories;

  // Mock data - in real app, this would come from API
  const [subServices, setSubServices] = useState<ISubService[]>([
    {
      id: '1',
      name: 'Fan Installation',
      categoryId: '1',
      icon: 'fan',
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=100&h=100&fit=crop&crop=center',
      status: 'active',
      displayOrder: 1
    },
    {
      id: '2',
      name: 'Electrical Wiring',
      categoryId: '1',
      icon: 'wire',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=100&h=100&fit=crop&crop=center',
      status: 'active',
      displayOrder: 2
    },
    {
      id: '3',
      name: 'Switch Board Repair',
      categoryId: '1',
      icon: 'switch',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=100&h=100&fit=crop&crop=center',
      status: 'active',
      displayOrder: 3
    },
    {
      id: '4',
      name: 'Pipe Repair',
      categoryId: '2',
      icon: 'pipe',
      image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=100&h=100&fit=crop&crop=center',
      status: 'active',
      displayOrder: 1
    },
    {
      id: '5',
      name: 'Tap Repair',
      categoryId: '2',
      icon: 'tap',
      image: 'https://images.unsplash.com/photo-1581578731548-c6a0c3f2fcc0?w=100&h=100&fit=crop&crop=center',
      status: 'active',
      displayOrder: 2
    },
    {
      id: '6',
      name: 'AC Deep Service',
      categoryId: '3',
      icon: 'air-conditioner',
      image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=100&h=100&fit=crop&crop=center',
      status: 'active',
      displayOrder: 1
    },
    {
      id: '7',
      name: 'Home Cleaning',
      categoryId: '4',
      icon: 'broom',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop&crop=center',
      status: 'active',
      displayOrder: 1
    },
    {
      id: '8',
      name: 'Furniture Repair',
      categoryId: '5',
      icon: 'furniture',
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=100&h=100&fit=crop&crop=center',
      status: 'active',
      displayOrder: 1
    },
    {
      id: '9',
      name: 'Door Repair',
      categoryId: '5',
      icon: 'door',
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=100&h=100&fit=crop&crop=center',
      status: 'active',
      displayOrder: 2
    },
    {
      id: '10',
      name: 'Washing Machine Repair',
      categoryId: '6',
      icon: 'washing-machine',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop&crop=center',
      status: 'active',
      displayOrder: 1
    }
  ]);

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
      setSubServices(prev => prev.map(sub => 
        sub.id === editingSubService.id 
          ? { ...sub, ...subServiceData }
          : sub
      ));
      onUpdateSubService?.(subServiceData);
      enqueueSnackbar('Sub-service updated successfully', { 
        variant: 'solid', 
        state: 'success',
        icon: 'check-circle'
      });
    } else {
      const newSubService: ISubService = {
        ...subServiceData,
        id: Date.now().toString(),
        displayOrder: subServices.length + 1
      };
      setSubServices(prev => [...prev, newSubService]);
      onCreateSubService?.(newSubService);
      enqueueSnackbar('Sub-service created successfully', { 
        variant: 'solid', 
        state: 'success',
        icon: 'check-circle'
      });
    }
    setIsFormOpen(false);
    setEditingSubService(null);
  };

  const handleToggleStatus = (subServiceId: string) => {
    setSubServices(prev => prev.map(sub => 
      sub.id === subServiceId 
        ? { ...sub, status: sub.status === 'active' ? 'inactive' : 'active' }
        : sub
    ));
    const subService = subServices.find(s => s.id === subServiceId);
    enqueueSnackbar(`Sub-service ${subService?.status === 'active' ? 'deactivated' : 'activated'}`, { 
      variant: 'solid', 
      state: 'info',
      icon: 'information-2'
    });
  };

  const handleDeleteClick = (subServiceId: string) => {
    setSubServiceToDelete(subServiceId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (subServiceToDelete) {
      setSubServices(prev => prev.filter(sub => sub.id !== subServiceToDelete));
      onDeleteSubService?.(subServiceToDelete);
      enqueueSnackbar('Sub-service deleted successfully', { 
        variant: 'solid', 
        state: 'success',
        icon: 'check-circle'
      });
    }
    setDeleteDialogOpen(false);
    setSubServiceToDelete(null);
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-success text-white">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  const getCategoryName = (categoryId: string) => {
    return availableCategories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  const filteredSubServices = subServices.filter(subService => {
    const matchesCategory = categoryFilter === 'all' || subService.categoryId === categoryFilter;
    const matchesStatus = statusFilter === 'all' || subService.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      subService.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCategoryName(subService.categoryId).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="card-title">Sub-Services ({filteredSubServices.length})</h3>
              <p className="text-sm text-gray-600">Manage sub-services (name and icon only)</p>
            </div>
            
            <Button size="sm" onClick={handleAddSubService}>
              <KeenIcon icon="plus" className="me-2" />
              Add Sub-Service
            </Button>
          </div>
        </div>
        
        <div className="card-body">
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
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {availableCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                {filteredSubServices.map((subService) => (
                  <TableRow key={subService.id}>
                    <TableCell>
                      <div className="text-sm font-medium text-center">{subService.displayOrder}</div>
                    </TableCell>
                    <TableCell>
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                        {subService.image ? (
                          <img 
                            src={subService.image} 
                            alt={subService.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              // Fallback to placeholder if image fails to load
                              target.src = `https://via.placeholder.com/100x100?text=${encodeURIComponent(subService.name.substring(0, 1))}`;
                              target.onerror = null; // Prevent infinite loop
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                            <KeenIcon icon={subService.icon} className="text-2xl" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{subService.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">{getCategoryName(subService.categoryId)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(subService.status)}
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
                ))}
              </TableBody>
            </Table>
          </div>
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

export { SubServiceManagement };

