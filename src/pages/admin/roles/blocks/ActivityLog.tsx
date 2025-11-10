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

interface IActivityLog {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
  details: string;
  module: string;
  changes: string;
}

const ActivityLog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  // Mock data - in real app, this would come from API
  const activityLogs: IActivityLog[] = [
    {
      id: 'ACT001',
      timestamp: '2024-01-20 14:30:15',
      admin: 'Super Admin',
      action: 'Updated Commission',
      details: 'Changed commission rate from 20% to 25%',
      module: 'Payments',
      changes: 'Commission: 20% → 25%'
    },
    {
      id: 'ACT002',
      timestamp: '2024-01-20 14:25:42',
      admin: 'Support User',
      action: 'Deleted Booking',
      details: 'Deleted booking #A-1234 due to customer cancellation',
      module: 'Bookings',
      changes: 'Booking #A-1234 deleted'
    },
    {
      id: 'ACT003',
      timestamp: '2024-01-20 14:20:33',
      admin: 'Finance User',
      action: 'Approved Payout',
      details: 'Approved payout of ₹5,000 for provider PRV-001',
      module: 'Payments',
      changes: 'Payout approved: ₹5,000'
    },
    {
      id: 'ACT004',
      timestamp: '2024-01-20 14:15:28',
      admin: 'Operations User',
      action: 'Updated Service Price',
      details: 'Updated Electrical Wiring price from ₹500 to ₹600',
      module: 'Catalog',
      changes: 'Price: ₹500 → ₹600'
    },
    {
      id: 'ACT005',
      timestamp: '2024-01-20 14:10:45',
      admin: 'Super Admin',
      action: 'Created Promo Code',
      details: 'Created new promo code WELCOME20 with 20% discount',
      module: 'Coupons',
      changes: 'New promo: WELCOME20 (20% off)'
    },
    {
      id: 'ACT006',
      timestamp: '2024-01-20 14:05:12',
      admin: 'Support User',
      action: 'Blocked User',
      details: 'Blocked user UID-789 for policy violation',
      module: 'Users',
      changes: 'User UID-789 blocked'
    },
    {
      id: 'ACT007',
      timestamp: '2024-01-20 14:00:38',
      admin: 'Operations User',
      action: 'Approved Provider',
      details: 'Approved provider PRV-002 after KYC verification',
      module: 'Providers',
      changes: 'Provider PRV-002 approved'
    },
    {
      id: 'ACT008',
      timestamp: '2024-01-20 13:55:22',
      admin: 'Finance User',
      action: 'Updated Payment Settings',
      details: 'Updated Razorpay API configuration',
      module: 'System',
      changes: 'Payment gateway settings updated'
    }
  ];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // TODO: Implement search functionality
  };

  const getModuleBadge = (module: string) => {
    const moduleConfig = {
      'Payments': { variant: 'success', text: 'Payments' },
      'Bookings': { variant: 'info', text: 'Bookings' },
      'Users': { variant: 'warning', text: 'Users' },
      'Providers': { variant: 'primary', text: 'Providers' },
      'Catalog': { variant: 'secondary', text: 'Catalog' },
      'Coupons': { variant: 'warning', text: 'Coupons' },
      'System': { variant: 'destructive', text: 'System' }
    };
    
    const config = moduleConfig[module as keyof typeof moduleConfig] || { variant: 'secondary', text: module };
    return <Badge variant={config.variant as any}>{config.text}</Badge>;
  };

  const getActionIcon = (action: string) => {
    const iconConfig = {
      'Updated Commission': 'setting-2',
      'Deleted Booking': 'trash',
      'Approved Payout': 'check-circle',
      'Updated Service Price': 'money-bill',
      'Created Promo Code': 'gift',
      'Blocked User': 'cross-circle',
      'Approved Provider': 'check-circle',
      'Updated Payment Settings': 'setting-2'
    };
    
    return iconConfig[action as keyof typeof iconConfig] || 'information';
  };

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.admin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="card-title">Activity Log</h3>
            <p className="text-sm text-gray-600">Track admin actions and system changes</p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <KeenIcon icon="file-down" className="me-2" />
              Export Log
            </Button>
            <Button size="sm">
              <KeenIcon icon="refresh" className="me-2" />
              Refresh
            </Button>
          </div>
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
                placeholder="Search by admin, action, or details..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                <SelectItem value="Payments">Payments</SelectItem>
                <SelectItem value="Bookings">Bookings</SelectItem>
                <SelectItem value="Users">Users</SelectItem>
                <SelectItem value="Providers">Providers</SelectItem>
                <SelectItem value="Catalog">Catalog</SelectItem>
                <SelectItem value="Coupons">Coupons</SelectItem>
                <SelectItem value="System">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Activity Logs Table */}
        <div className="overflow-x-auto">
          <Table className="min-w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px] sm:w-[140px]">Timestamp</TableHead>
                <TableHead className="hidden sm:table-cell w-[120px]">Admin</TableHead>
                <TableHead className="hidden md:table-cell w-[120px]">Action</TableHead>
                <TableHead className="hidden lg:table-cell w-[100px]">Module</TableHead>
                <TableHead className="w-[200px] sm:w-[250px]">Details</TableHead>
                <TableHead className="hidden lg:table-cell w-[150px]">Changes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="w-[120px] sm:w-[140px]">
                    <div className="text-xs">
                      <div className="font-medium">{log.timestamp}</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell w-[120px]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary-light rounded-full flex items-center justify-center">
                        <KeenIcon icon="user" className="text-primary text-xs" />
                      </div>
                      <span className="text-sm font-medium">{log.admin}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell w-[120px]">
                    <div className="flex items-center gap-2">
                      <KeenIcon icon={getActionIcon(log.action)} className="text-sm" />
                      <span className="text-sm">{log.action}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell w-[100px]">{getModuleBadge(log.module)}</TableCell>
                  <TableCell className="w-[200px] sm:w-[250px]">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm" title={log.details}>
                        {log.details}
                      </div>
                      <div className="text-xs text-gray-500 sm:hidden">{log.admin} • {log.action} • {log.module}</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell w-[150px]">
                    <div className="max-w-xs">
                      <div className="truncate text-sm text-gray-600" title={log.changes}>
                        {log.changes}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export { ActivityLog };


