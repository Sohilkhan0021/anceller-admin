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
import { AddOnForm } from '../forms/AddOnForm';
import { useSnackbar } from 'notistack';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

interface IAddOn {
  id: string;
  name: string;
  price: number;
  isPerUnit: boolean;
  status: 'active' | 'inactive';
  appliesTo: string[]; // Service IDs
}

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
  const { enqueueSnackbar } = useSnackbar();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState<IAddOn | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addOnToDelete, setAddOnToDelete] = useState<string | null>(null);

  // Mock services data
  const mockServices = [
    { id: '1', name: 'Electrical Wiring', category: 'Electrical' },
    { id: '2', name: 'Fan Installation', category: 'Electrical' },
    { id: '3', name: 'Pipe Repair', category: 'Plumbing' },
    { id: '4', name: 'AC Service & Repair', category: 'AC Services' },
    { id: '5', name: 'Deep Cleaning', category: 'Cleaning' }
  ];

  const availableServices = services.length > 0 ? services : mockServices;

  // Mock data - in real app, this would come from API
  const [addOns, setAddOns] = useState<IAddOn[]>([
    {
      id: '1',
      name: 'Extra Power Outlet',
      price: 200,
      isPerUnit: false,
      status: 'active',
      appliesTo: ['1', '2']
    },
    {
      id: '2',
      name: 'Pipe Extra Length',
      price: 150,
      isPerUnit: true,
      status: 'active',
      appliesTo: ['3']
    },
    {
      id: '3',
      name: 'Height Work (Above 10ft)',
      price: 300,
      isPerUnit: false,
      status: 'active',
      appliesTo: ['1', '2', '4']
    },
    {
      id: '4',
      name: 'Gas Top-up',
      price: 400,
      isPerUnit: false,
      status: 'active',
      appliesTo: ['4']
    },
    {
      id: '5',
      name: 'Extra Fixtures',
      price: 100,
      isPerUnit: true,
      status: 'inactive',
      appliesTo: ['5']
    }
  ]);

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
      // Update existing
      setAddOns(prev => prev.map(addOn => 
        addOn.id === editingAddOn.id 
          ? { ...addOn, ...addOnData }
          : addOn
      ));
      onUpdateAddOn?.(addOnData);
      enqueueSnackbar('Add-on updated successfully', { 
        variant: 'solid', 
        state: 'success',
        icon: 'check-circle'
      });
    } else {
      // Create new
      const newAddOn: IAddOn = {
        ...addOnData,
        id: Date.now().toString()
      };
      setAddOns(prev => [...prev, newAddOn]);
      onCreateAddOn?.(newAddOn);
      enqueueSnackbar('Add-on created successfully', { 
        variant: 'solid', 
        state: 'success',
        icon: 'check-circle'
      });
    }
    setIsFormOpen(false);
    setEditingAddOn(null);
  };

  const handleToggleStatus = (addOnId: string) => {
    setAddOns(prev => prev.map(addOn => 
      addOn.id === addOnId 
        ? { ...addOn, status: addOn.status === 'active' ? 'inactive' : 'active' }
        : addOn
    ));
    const addOn = addOns.find(a => a.id === addOnId);
    enqueueSnackbar(`Add-on ${addOn?.status === 'active' ? 'deactivated' : 'activated'}`, { 
      variant: 'solid', 
      state: 'info',
      icon: 'information-2'
    });
  };

  const handleDeleteClick = (addOnId: string) => {
    setAddOnToDelete(addOnId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (addOnToDelete) {
      setAddOns(prev => prev.filter(addOn => addOn.id !== addOnToDelete));
      onDeleteAddOn?.(addOnToDelete);
      enqueueSnackbar('Add-on deleted successfully', { 
        variant: 'solid', 
        state: 'success',
        icon: 'check-circle'
      });
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

  const getServiceNames = (serviceIds: string[]) => {
    return serviceIds
      .map(id => availableServices.find(s => s.id === id)?.name)
      .filter(Boolean)
      .join(', ') || '—';
  };

  const filteredAddOns = addOns.filter(addOn => {
    const matchesSearch = addOn.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || addOn.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="card-title">Add-Ons & Extras ({filteredAddOns.length})</h3>
              <p className="text-sm text-gray-600">Manage additional charges and extras</p>
            </div>
            
            <Button size="sm" onClick={handleAddAddOn}>
              <KeenIcon icon="plus" className="me-2" />
              Add Add-On
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
                  placeholder="Search add-ons..."
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
                {filteredAddOns.map((addOn) => (
                  <TableRow key={addOn.id}>
                    <TableCell>
                      <div className="font-medium">{addOn.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">₹{addOn.price}</div>
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
                        {getStatusBadge(addOn.status)}
                        <Switch
                          checked={addOn.status === 'active'}
                          onCheckedChange={() => handleToggleStatus(addOn.id)}
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

