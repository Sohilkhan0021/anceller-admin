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

interface ISystemLog {
  id: string;
  timestamp: string;
  service: string;
  level: 'error' | 'warning' | 'info' | 'success';
  message: string;
  details: string;
  status: string;
}

const SystemLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  // Mock data - in real app, this would come from API
  const systemLogs: ISystemLog[] = [
    {
      id: 'LOG001',
      timestamp: '2024-01-20 10:45:23',
      service: 'Payment Gateway',
      level: 'error',
      message: 'API connection failed',
      details: 'Razorpay API returned 500 error for transaction TXN123',
      status: 'resolved'
    },
    {
      id: 'LOG002',
      timestamp: '2024-01-20 10:30:15',
      service: 'Maps API',
      level: 'warning',
      message: 'Rate limit exceeded',
      details: 'Google Maps API rate limit exceeded for location services',
      status: 'monitoring'
    },
    {
      id: 'LOG003',
      timestamp: '2024-01-20 10:15:42',
      service: 'OTP Service',
      level: 'success',
      message: 'SMS delivered successfully',
      details: 'OTP sent to +91-9876543210 via Twilio',
      status: 'completed'
    },
    {
      id: 'LOG004',
      timestamp: '2024-01-20 09:58:33',
      service: 'Notifications',
      level: 'error',
      message: 'FCM token expired',
      details: 'Firebase Cloud Messaging token expired for user UID123',
      status: 'resolved'
    },
    {
      id: 'LOG005',
      timestamp: '2024-01-20 09:45:12',
      service: 'Payout Service',
      level: 'info',
      message: 'Payout processed',
      details: 'Provider payout of ₹2,500 processed successfully',
      status: 'completed'
    },
    {
      id: 'LOG006',
      timestamp: '2024-01-20 09:30:45',
      service: 'Payment Gateway',
      level: 'warning',
      message: 'High failure rate detected',
      details: 'Payment failure rate increased to 15% in last hour',
      status: 'investigating'
    }
  ];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // TODO: Implement search functionality
  };

  const getLevelBadge = (level: string) => {
    const levelConfig = {
      error: { variant: 'destructive', className: '', text: 'Error' },
      warning: { variant: 'default', className: 'bg-warning text-white', text: 'Warning' },
      info: { variant: 'default', className: 'bg-info text-white', text: 'Info' },
      success: { variant: 'default', className: 'bg-success text-white', text: 'Success' }
    };
    
    const config = levelConfig[level as keyof typeof levelConfig] || { variant: 'secondary', className: '', text: level };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      resolved: { variant: 'default', className: 'bg-success text-white', text: 'Resolved' },
      monitoring: { variant: 'default', className: 'bg-warning text-white', text: 'Monitoring' },
      investigating: { variant: 'default', className: 'bg-info text-white', text: 'Investigating' },
      completed: { variant: 'default', className: 'bg-success text-white', text: 'Completed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', className: '', text: status };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
  };

  const getLevelIcon = (level: string) => {
    const iconConfig = {
      error: 'danger',
      warning: 'warning',
      info: 'information',
      success: 'check-circle'
    };
    
    return iconConfig[level as keyof typeof iconConfig] || 'question';
  };

  const filteredLogs = systemLogs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="card-title">System Logs</h3>
            <p className="text-sm text-gray-600">Monitor API failures, downtime alerts, and system events</p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <KeenIcon icon="file-down" className="me-2" />
              Export Logs
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
                placeholder="Search logs by service or message..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <Table className="min-w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px] sm:w-[140px]">Timestamp</TableHead>
                <TableHead className="hidden sm:table-cell w-[100px]">Service</TableHead>
                <TableHead className="hidden md:table-cell w-[80px]">Level</TableHead>
                <TableHead className="w-[200px] sm:w-[250px]">Message</TableHead>
                <TableHead className="hidden lg:table-cell w-[100px]">Status</TableHead>
                <TableHead className="hidden lg:table-cell w-[150px]">Details</TableHead>
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
                  <TableCell className="hidden sm:table-cell w-[100px]">
                    <div className="flex items-center gap-2">
                      <KeenIcon icon="setting-2" className="text-gray-500 text-sm" />
                      <span className="text-sm font-medium">{log.service}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell w-[80px]">
                    <div className="flex items-center gap-2">
                      <KeenIcon icon={getLevelIcon(log.level)} className="text-sm" />
                      {getLevelBadge(log.level)}
                    </div>
                  </TableCell>
                  <TableCell className="w-[200px] sm:w-[250px]">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm" title={log.message}>
                        {log.message}
                      </div>
                      <div className="text-xs text-gray-500 sm:hidden">{log.service} • {log.level}</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell w-[100px]">{getStatusBadge(log.status)}</TableCell>
                  <TableCell className="hidden lg:table-cell w-[150px]">
                    <div className="max-w-xs">
                      <div className="truncate text-sm text-gray-600" title={log.details}>
                        {log.details}
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

export { SystemLogs };


