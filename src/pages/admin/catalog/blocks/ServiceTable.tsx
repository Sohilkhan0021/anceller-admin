import { useState } from 'react';
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

interface IService {
  id: string;
  name: string;
  subServiceId: string; // Belongs to a sub-service
  subServiceName?: string; // For display
  category: string;
  description?: string;
  basePrice: number;
  duration: number; // Duration in minutes
  status: 'active' | 'inactive';
  popularity: number;
  bookings: number;
  revenue: number;
  image: string;
  skills?: string; // Required Skills/Tags
  displayOrder?: number;
}

interface IServiceTableProps {
  onEditService?: (service: IService) => void;
}

const ServiceTable = ({ onEditService }: IServiceTableProps) => {
  const [sortBy, setSortBy] = useState('displayOrder');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subServiceFilter, setSubServiceFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
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
  const formatDuration = (minutes: number): string => {
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

  // Mock data - in real app, this would come from API
  // Services belong to Sub-services, which belong to Categories
  const services: IService[] = [
    {
      id: 'SVC001',
      name: 'Standard Electrical Wiring',
      subServiceId: '2', // Electrical Wiring sub-service
      subServiceName: 'Electrical Wiring',
      category: 'Electrical',
      description: 'Complete electrical wiring installation and repair',
      basePrice: 500,
      duration: 120, // 2 hours in minutes
      status: 'active',
      popularity: 95,
      bookings: 45,
      revenue: 22500,
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop&crop=center',
      skills: 'Licensed, Certified, Experienced',
      displayOrder: 1
    },
    {
      id: 'SVC002',
      name: 'Standard Pipe Repair',
      subServiceId: '4', // Pipe Repair sub-service
      subServiceName: 'Pipe Repair',
      category: 'Plumbing',
      description: 'Professional pipe repair and maintenance',
      basePrice: 600,
      duration: 150,
      status: 'active',
      popularity: 92,
      bookings: 38,
      revenue: 22800,
      image: 'https://images.unsplash.com/photo-1581578731548-c6a0c3f2fcc0?w=300&h=200&fit=crop&crop=center',
      skills: 'Certified Plumber',
      displayOrder: 2
    },
    {
      id: 'SVC003',
      name: 'Standard AC Service',
      subServiceId: '6', // AC Deep Service sub-service
      subServiceName: 'AC Deep Service',
      category: 'AC Services',
      description: 'Complete AC servicing and repair',
      basePrice: 800,
      duration: 120,
      status: 'active',
      popularity: 90,
      bookings: 32,
      revenue: 25600,
      image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=300&h=200&fit=crop&crop=center',
      skills: 'AC Specialist, Licensed',
      displayOrder: 3
    },
    {
      id: 'SVC004',
      name: 'Basic Switch Repair',
      subServiceId: '3', // Switch Board Repair sub-service
      subServiceName: 'Switch Board Repair',
      category: 'Electrical',
      description: 'Electrical switchboard repair and installation',
      basePrice: 300,
      duration: 90,
      status: 'active',
      popularity: 88,
      bookings: 28,
      revenue: 8400,
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&h=200&fit=crop&crop=center',
      skills: 'Licensed Electrician',
      displayOrder: 4
    },
    {
      id: 'SVC005',
      name: 'Standard Home Cleaning',
      subServiceId: '7', // Home Cleaning sub-service (need to add)
      subServiceName: 'Home Cleaning',
      category: 'Cleaning',
      description: 'Professional deep cleaning service',
      basePrice: 300,
      duration: 180,
      status: 'active',
      popularity: 82,
      bookings: 25,
      revenue: 7500,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop&crop=center',
      skills: 'Trained, Background Checked',
      displayOrder: 5
    },
    {
      id: 'SVC006',
      name: 'Standard Tap Repair',
      subServiceId: '5', // Tap Repair sub-service
      subServiceName: 'Tap Repair',
      category: 'Plumbing',
      description: 'Tap repair and replacement service',
      basePrice: 250,
      duration: 30,
      status: 'active',
      popularity: 85,
      bookings: 22,
      revenue: 5500,
      image: 'https://images.unsplash.com/photo-1581578731548-c6a0c3f2fcc0?w=300&h=200&fit=crop&crop=center',
      skills: 'Certified',
      displayOrder: 6
    },
    {
      id: 'SVC007',
      name: 'Premium Fan Installation',
      subServiceId: '1', // Fan Installation sub-service
      subServiceName: 'Fan Installation',
      category: 'Electrical',
      description: 'Premium ceiling fan installation with warranty',
      basePrice: 600,
      duration: 90,
      status: 'inactive',
      popularity: 75,
      bookings: 15,
      revenue: 6000,
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop&crop=center',
      skills: 'Licensed, Warranty Included',
      displayOrder: 7
    },
    {
      id: 'SVC008',
      name: 'Standard Furniture Repair',
      subServiceId: '8', // Furniture Repair sub-service (need to add)
      subServiceName: 'Furniture Repair',
      category: 'Carpentry',
      description: 'Furniture repair and restoration',
      basePrice: 400,
      duration: 150,
      status: 'active',
      popularity: 78,
      bookings: 18,
      revenue: 7200,
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300&h=200&fit=crop&crop=center',
      skills: 'Skilled Carpenter',
      displayOrder: 8
    },
    {
      id: 'SVC009',
      name: 'Basic Door Repair',
      subServiceId: '9', // Door Repair sub-service (need to add)
      subServiceName: 'Door Repair',
      category: 'Carpentry',
      description: 'Door repair and installation',
      basePrice: 350,
      duration: 90,
      status: 'active',
      popularity: 72,
      bookings: 12,
      revenue: 4200,
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300&h=200&fit=crop&crop=center',
      skills: 'Experienced',
      displayOrder: 9
    },
    {
      id: 'SVC010',
      name: 'Standard Washing Machine Repair',
      subServiceId: '10', // Washing Machine Repair sub-service (need to add)
      subServiceName: 'Washing Machine Repair',
      category: 'Appliance',
      description: 'Washing machine repair and maintenance',
      basePrice: 600,
      duration: 120,
      status: 'active',
      popularity: 85,
      bookings: 20,
      revenue: 12000,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop&crop=center',
      skills: 'Appliance Specialist',
      displayOrder: 10
    }
  ];

  const handleToggleStatus = (serviceId: string, newStatus: boolean) => {
    // TODO: Implement status toggle
    console.log(`Toggling service ${serviceId} to ${newStatus ? 'active' : 'inactive'}`);
  };

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

  const handleDeleteService = (serviceId: string) => {
    // TODO: Implement delete service
    console.log('Deleting service:', serviceId);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'success', text: 'Active' },
      inactive: { variant: 'destructive', text: 'Inactive' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', text: status };
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

  // Extract unique sub-services from services
  const uniqueSubServices = Array.from(
    new Map(services.map(service => [service.subServiceId, {
      id: service.subServiceId,
      name: service.subServiceName || 'Unknown'
    }])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  let filteredServices = services.filter(service => {
    const matchesCategory = categoryFilter === 'all' || service.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSubService = subServiceFilter === 'all' || service.subServiceId === subServiceFilter;
    const matchesSearch = searchTerm === '' || 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSubService && matchesSearch;
  });

  // Sort services
  filteredServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case 'displayOrder':
        return (a.displayOrder || 999) - (b.displayOrder || 999);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price':
        return a.basePrice - b.basePrice;
      case 'popularity':
        return b.popularity - a.popularity;
      case 'bookings':
        return b.bookings - a.bookings;
      case 'revenue':
        return b.revenue - a.revenue;
      default:
        return (a.displayOrder || 999) - (b.displayOrder || 999);
    }
  });

  return (
    <div className="card max-w-full w-full overflow-hidden">
      <div className="card-header max-w-full w-full overflow-hidden">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="card-title">Service Management ({filteredServices.length})</h3>
            <p className="text-sm text-gray-600">Manage service pricing and availability</p>
          </div>
          
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

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
                        {service.image && (
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img 
                              src={service.image} 
                              alt={service.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop&crop=center';
                              }}
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate">{service.name}</div>
                          <div className="text-xs text-gray-500 truncate">ID: {service.id}</div>
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
                      <div className="text-sm truncate">{service.category}</div>
                    </TableCell>
                  )}
                  {columnVisibility.basePrice && (
                    <TableCell className="w-[90px]">
                      <div className="text-center">
                        <div className="font-semibold text-sm whitespace-nowrap">₹{service.basePrice.toLocaleString()}</div>
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
                          {getStatusBadge(service.status)}
                        </div>
                      </div>
                    </TableCell>
                  )}
                  {columnVisibility.popularity && (
                    <TableCell className="w-[90px]">
                      <Badge variant="outline" className="badge-outline text-xs whitespace-nowrap px-1.5 py-0.5">
                        {getPopularityBadge(service.popularity).text}
                      </Badge>
                    </TableCell>
                  )}
                  {columnVisibility.bookings && (
                    <TableCell className="w-[70px]">
                      <div className="text-center">
                        <div className="font-semibold text-sm">{service.bookings}</div>
                      </div>
                    </TableCell>
                  )}
                  {columnVisibility.revenue && (
                    <TableCell className="w-[90px]">
                      <div className="text-center">
                        <div className="font-semibold text-success text-sm whitespace-nowrap">₹{service.revenue.toLocaleString()}</div>
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
                            onClick={() => handleDeleteService(service.id)}
                            className="text-danger"
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
      </div>
    </div>
  );
};

export { ServiceTable };

