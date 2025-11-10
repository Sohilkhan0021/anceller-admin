import { useState } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
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

interface IPromoCode {
  id: string;
  code: string;
  type: 'flat' | 'percentage';
  value: number;
  expiry: string;
  usageCount: number;
  maxUsage: number;
  status: 'active' | 'expired' | 'upcoming' | 'deactivated';
  createdAt: string;
  revenueImpact: number;
  redemptions: number;
}

interface IPromoCodesListProps {
  onEditPromo: (promo: any) => void;
}

const PromoCodesList = ({ onEditPromo }: IPromoCodesListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data - in real app, this would come from API
  const promoCodes: IPromoCode[] = [
    {
      id: 'PROMO001',
      code: 'WELCOME20',
      type: 'percentage',
      value: 20,
      expiry: '2024-12-31',
      usageCount: 45,
      maxUsage: 100,
      status: 'active',
      createdAt: '2024-01-01',
      revenueImpact: 2250,
      redemptions: 45
    },
    {
      id: 'PROMO002',
      code: 'SAVE50',
      type: 'flat',
      value: 50,
      expiry: '2024-02-15',
      usageCount: 23,
      maxUsage: 50,
      status: 'active',
      createdAt: '2024-01-10',
      revenueImpact: 1150,
      redemptions: 23
    },
    {
      id: 'PROMO003',
      code: 'NEWUSER',
      type: 'percentage',
      value: 15,
      expiry: '2024-01-20',
      usageCount: 12,
      maxUsage: 200,
      status: 'expired',
      createdAt: '2024-01-01',
      revenueImpact: 1800,
      redemptions: 12
    },
    {
      id: 'PROMO004',
      code: 'SUMMER25',
      type: 'percentage',
      value: 25,
      expiry: '2024-06-01',
      usageCount: 0,
      maxUsage: 500,
      status: 'upcoming',
      createdAt: '2024-01-15',
      revenueImpact: 0,
      redemptions: 0
    },
    {
      id: 'PROMO005',
      code: 'FLASH100',
      type: 'flat',
      value: 100,
      expiry: '2024-01-25',
      usageCount: 8,
      maxUsage: 20,
      status: 'deactivated',
      createdAt: '2024-01-20',
      revenueImpact: 800,
      redemptions: 8
    }
  ];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // TODO: Implement search functionality
  };

  const handleEditPromoClick = (promoId: string) => {
    const promo = promoCodes.find(p => p.id === promoId);
    if (promo) {
      onEditPromo(promo);
    }
  };

  const handleDeactivatePromo = (promoId: string) => {
    // TODO: Implement deactivate promo functionality
    console.log('Deactivating promo:', promoId);
  };

  const handleDeletePromo = (promoId: string) => {
    // TODO: Implement delete promo functionality
    console.log('Deleting promo:', promoId);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default', className: 'bg-success text-white', text: 'Active' },
      expired: { variant: 'destructive', className: '', text: 'Expired' },
      upcoming: { variant: 'default', className: 'bg-info text-white', text: 'Upcoming' },
      deactivated: { variant: 'secondary', className: '', text: 'Deactivated' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', className: '', text: status };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
  };

  const getTypeDisplay = (type: string, value: number) => {
    return type === 'percentage' ? `${value}%` : `₹${value}`;
  };

  const getUsagePercentage = (usageCount: number, maxUsage: number) => {
    return Math.round((usageCount / maxUsage) * 100);
  };

  const filteredPromoCodes = promoCodes.filter(promo => {
    const matchesSearch = promo.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || promo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRedemptions = promoCodes.reduce((sum, promo) => sum + promo.redemptions, 0);
  const totalRevenueImpact = promoCodes.reduce((sum, promo) => sum + promo.revenueImpact, 0);

  return (
    <div className="space-y-6">
      {/* Success Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg text-primary bg-primary-light">
                <KeenIcon icon="gift" className="text-xl" />
              </div>
              <div className="text-sm font-medium text-primary">
                +15.2%
              </div>
            </div>
            <div className="mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{totalRedemptions}</h3>
              <p className="text-sm text-gray-600">Total Redemptions</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg text-success bg-success-light">
                <KeenIcon icon="dollar" className="text-xl" />
              </div>
              <div className="text-sm font-medium text-success">
                +8.7%
              </div>
            </div>
            <div className="mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">₹{totalRevenueImpact.toLocaleString()}</h3>
              <p className="text-sm text-gray-600">Revenue Impact</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg text-info bg-info-light">
                <KeenIcon icon="chart-simple" className="text-xl" />
              </div>
              <div className="text-sm font-medium text-info">
                +12.3%
              </div>
            </div>
            <div className="mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{promoCodes.length}</h3>
              <p className="text-sm text-gray-600">Active Promo Codes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Promo Codes ({filteredPromoCodes.length})</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-2">
              <div className="relative">
                <KeenIcon icon="magnifier" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by promo code..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="deactivated">Deactivated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Promo Codes Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Promo Codes List</h3>
        </div>
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Value</TableHead>
                  <TableHead className="hidden lg:table-cell">Expiry</TableHead>
                  <TableHead className="hidden sm:table-cell">Usage</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Revenue Impact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromoCodes.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                          <KeenIcon icon="gift" className="text-primary text-sm" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{promo.code}</div>
                          <div className="text-sm text-gray-500 hidden sm:block">Created {promo.createdAt}</div>
                          <div className="text-xs text-gray-500 sm:hidden">{getTypeDisplay(promo.type, promo.value)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="badge-outline">
                        {promo.type === 'percentage' ? 'Percentage' : 'Flat Amount'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-center">
                        <div className="font-semibold">{getTypeDisplay(promo.type, promo.value)}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{promo.expiry}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="text-center">
                        <div className="font-semibold">{promo.usageCount}/{promo.maxUsage}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${getUsagePercentage(promo.usageCount, promo.maxUsage)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {getUsagePercentage(promo.usageCount, promo.maxUsage)}% used
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{getStatusBadge(promo.status)}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="text-center">
                        <div className="font-semibold text-success">₹{promo.revenueImpact.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{promo.redemptions} redemptions</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1 sm:hidden">
                          <div className="md:hidden">
                            {getStatusBadge(promo.status)}
                          </div>
                          <div className="lg:hidden">
                            <div className="text-xs text-gray-500">₹{promo.revenueImpact.toLocaleString()}</div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <KeenIcon icon="dots-vertical" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditPromoClick(promo.id)}>
                              <KeenIcon icon="edit" className="me-2" />
                              Edit
                            </DropdownMenuItem>
                            {promo.status === 'active' && (
                              <DropdownMenuItem 
                                onClick={() => handleDeactivatePromo(promo.id)}
                                className="text-warning"
                              >
                                <KeenIcon icon="pause" className="me-2" />
                                Deactivate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDeletePromo(promo.id)}
                              className="text-danger"
                            >
                              <KeenIcon icon="trash" className="me-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export { PromoCodesList };
