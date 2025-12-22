import { useState } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface IPricingEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pricingData: any) => void;
}

interface IServicePricing {
  id: string;
  category: string;
  subService: string;
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  duration: string;
  isActive: boolean;
  description: string;
  addOns: IAddOnPricing[];
}

interface IAddOnPricing {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
}

const PricingEditorModal = ({ isOpen, onClose, onSave }: IPricingEditorModalProps) => {
  const [activeTab, setActiveTab] = useState('categories');
  const [editingPricing, setEditingPricing] = useState<IServicePricing | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Mock data - in real app, this would come from API
  const serviceCategories = [
    { id: 'electrical', name: 'Electrical Services', icon: 'element-11' },
    { id: 'plumbing', name: 'Plumbing Services', icon: 'water-drop' },
    { id: 'ac', name: 'AC Services', icon: 'air-conditioner-2' },
    { id: 'cleaning', name: 'Cleaning Services', icon: 'broom-2' },
    { id: 'carpentry', name: 'Carpentry Services', icon: 'hammer-2' },
    { id: 'appliance', name: 'Appliance Services', icon: 'setting-2' }
  ];

  const servicePricing: IServicePricing[] = [
    {
      id: '1',
      category: 'electrical',
      subService: 'Electrical Wiring',
      basePrice: 500,
      minPrice: 400,
      maxPrice: 800,
      duration: '2-3 hours',
      isActive: true,
      description: 'Complete electrical wiring installation and repair',
      addOns: [
        { id: '1', name: 'Extra Power Outlet', price: 200, isActive: true },
        { id: '2', name: 'Switch Upgrade', price: 150, isActive: true }
      ]
    },
    {
      id: '2',
      category: 'plumbing',
      subService: 'Pipe Repair',
      basePrice: 600,
      minPrice: 500,
      maxPrice: 1000,
      duration: '2-4 hours',
      isActive: true,
      description: 'Professional pipe repair and maintenance',
      addOns: [
        { id: '3', name: 'Pipe Replacement', price: 300, isActive: true },
        { id: '4', name: 'Leak Detection', price: 200, isActive: true }
      ]
    },
    {
      id: '3',
      category: 'ac',
      subService: 'AC Service & Repair',
      basePrice: 800,
      minPrice: 600,
      maxPrice: 1200,
      duration: '2-3 hours',
      isActive: true,
      description: 'Complete AC servicing and repair',
      addOns: [
        { id: '5', name: 'Gas Top-up', price: 400, isActive: true },
        { id: '6', name: 'Filter Replacement', price: 200, isActive: true }
      ]
    }
  ];

  const handleEditPricing = (pricing: IServicePricing) => {
    setEditingPricing(pricing);
    setIsAddFormOpen(true);
  };

  const handleCloseAddForm = () => {
    setIsAddFormOpen(false);
    setEditingPricing(null);
  };

  const handleSavePricing = (pricingData: any) => {
    console.log('Saving pricing:', pricingData);
    // TODO: Implement API call to save pricing
    onSave(pricingData);
    handleCloseAddForm();
  };

  const handleCategoryPricing = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setActiveTab('services');
  };

  const handleEditCategory = (categoryId: string) => {
    console.log('Editing category:', categoryId);
    // TODO: Implement category editing functionality
    alert(`Edit category: ${getCategoryName(categoryId)}`);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-success text-white">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = serviceCategories.find(c => c.id === categoryId);
    return category?.icon || 'setting-2';
  };

  const getCategoryName = (categoryId: string) => {
    const category = serviceCategories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 py-4">
            <DialogTitle className="flex items-center gap-3">
              <KeenIcon icon="setting-2" className="text-primary" />
              Pricing Editor
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="px-6 pb-6">
            <div className="space-y-6">
              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'categories'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <KeenIcon icon="category" className="me-2" />
                  Categories
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'services'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <KeenIcon icon="setting-2" className="me-2" />
                  Services
                </button>
                <button
                  onClick={() => setActiveTab('addons')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'addons'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <KeenIcon icon="plus" className="me-2" />
                  Add-ons
                </button>
              </div>

              {/* Categories Tab */}
              {activeTab === 'categories' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Service Categories</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {serviceCategories.map((category) => (
                      <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-primary-light rounded-lg">
                            <KeenIcon icon={category.icon} className="text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{category.name}</h4>
                            <p className="text-sm text-gray-600">Manage pricing</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <KeenIcon icon="pencil" className="me-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCategoryPricing(category.id)}
                          >
                            <KeenIcon icon="setting-2" className="me-1" />
                            Pricing
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Services Tab */}
              {activeTab === 'services' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">Service Pricing</h3>
                      {selectedCategory && (
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="bg-primary text-white">
                            {getCategoryName(selectedCategory)}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedCategory(null)}
                          >
                            <KeenIcon icon="cross" className="me-1" />
                            Clear Filter
                          </Button>
                        </div>
                      )}
                    </div>
                    <Button size="sm" onClick={() => setIsAddFormOpen(true)}>
                      <KeenIcon icon="plus" className="me-2" />
                      Add Service
                    </Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Service</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Base Price</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Price Range</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Duration</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {servicePricing
                          .filter(pricing => !selectedCategory || pricing.category === selectedCategory)
                          .map((pricing) => (
                          <tr key={pricing.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="p-1 bg-gray-100 rounded">
                                  <KeenIcon icon={getCategoryIcon(pricing.category)} className="text-sm" />
                                </div>
                                <div>
                                  <div className="font-medium">{pricing.subService}</div>
                                  <div className="text-sm text-gray-600">{getCategoryName(pricing.category)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold">₹{pricing.basePrice}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm">
                                ₹{pricing.minPrice} - ₹{pricing.maxPrice}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm">{pricing.duration}</div>
                            </td>
                            <td className="py-3 px-4">
                              {getStatusBadge(pricing.isActive)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleEditPricing(pricing)}>
                                  <KeenIcon icon="pencil" className="me-1" />
                                  Edit
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Add-ons Tab */}
              {activeTab === 'addons' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Add-on Services</h3>
                    <Button size="sm">
                      <KeenIcon icon="plus" className="me-2" />
                      Add Add-on
                    </Button>
                  </div>
                  
                  <div className="text-center py-8 text-gray-500">
                    <KeenIcon icon="plus" className="text-4xl mb-4 mx-auto" />
                    <p>Add-on services will be managed here</p>
                  </div>
                </div>
              )}
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Service Pricing Form */}
      <Dialog open={isAddFormOpen} onOpenChange={handleCloseAddForm}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="px-6 py-4">
            <DialogTitle className="flex items-center gap-3">
              <KeenIcon icon="setting-2" className="text-primary" />
              {editingPricing ? 'Edit Service Pricing' : 'Add Service Pricing'}
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="px-6 pb-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select defaultValue={editingPricing?.category || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subService">Sub Service</Label>
                  <Input
                    id="subService"
                    placeholder="Enter sub service name"
                    defaultValue={editingPricing?.subService || ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="basePrice">Base Price (₹)</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    placeholder="500"
                    defaultValue={editingPricing?.basePrice || ''}
                  />
                </div>

                <div>
                  <Label htmlFor="minPrice">Min Price (₹)</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    placeholder="400"
                    defaultValue={editingPricing?.minPrice || ''}
                  />
                </div>

                <div>
                  <Label htmlFor="maxPrice">Max Price (₹)</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    placeholder="800"
                    defaultValue={editingPricing?.maxPrice || ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    placeholder="2-3 hours"
                    defaultValue={editingPricing?.duration || ''}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    defaultChecked={editingPricing?.isActive ?? true}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter service description"
                  defaultValue={editingPricing?.description || ''}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleCloseAddForm}>
                  <KeenIcon icon="cross" className="me-2" />
                  Cancel
                </Button>
                <Button onClick={() => handleSavePricing({})}>
                  <KeenIcon icon="check" className="me-2" />
                  Save Pricing
                </Button>
              </div>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { PricingEditorModal };
