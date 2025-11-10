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

const ProviderPayoutsTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data - in real app, this would come from API
  const payouts = [
    {
      id: 'PRV001',
      providerName: 'Rajesh Kumar',
      totalEarnings: 12500,
      commissionDeducted: 1250,
      netAmount: 11250,
      payoutStatus: 'pending',
      lastPayoutDate: '2024-01-15',
      nextPayoutDate: '2024-01-30',
      bankAccount: '****1234',
      ifscCode: 'HDFC0001234'
    },
    {
      id: 'PRV002',
      providerName: 'Priya Sharma',
      totalEarnings: 8500,
      commissionDeducted: 850,
      netAmount: 7650,
      payoutStatus: 'completed',
      lastPayoutDate: '2024-01-20',
      nextPayoutDate: '2024-02-05',
      bankAccount: '****5678',
      ifscCode: 'ICIC0005678'
    },
    {
      id: 'PRV003',
      providerName: 'Amit Singh',
      totalEarnings: 18900,
      commissionDeducted: 1890,
      netAmount: 17010,
      payoutStatus: 'pending',
      lastPayoutDate: '2024-01-10',
      nextPayoutDate: '2024-01-25',
      bankAccount: '****9012',
      ifscCode: 'SBIN0009012'
    },
    {
      id: 'PRV004',
      providerName: 'Sunita Patel',
      totalEarnings: 3200,
      commissionDeducted: 320,
      netAmount: 2880,
      payoutStatus: 'failed',
      lastPayoutDate: '2024-01-18',
      nextPayoutDate: '2024-02-02',
      bankAccount: '****3456',
      ifscCode: 'AXIS0003456'
    },
    {
      id: 'PRV005',
      providerName: 'Vikram Gupta',
      totalEarnings: 2400,
      commissionDeducted: 240,
      netAmount: 2160,
      payoutStatus: 'processing',
      lastPayoutDate: '2024-01-22',
      nextPayoutDate: '2024-02-07',
      bankAccount: '****7890',
      ifscCode: 'KOTAK0007890'
    }
  ];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // TODO: Implement search functionality
  };

  const handleSettleNow = (providerId: string) => {
    // TODO: Implement manual settlement
    console.log('Settling payout for provider:', providerId);
  };

  const handleBulkSettlement = () => {
    // TODO: Implement bulk settlement
    console.log('Processing bulk settlement...');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'default', className: 'bg-warning text-white', text: 'Pending' },
      completed: { variant: 'default', className: 'bg-success text-white', text: 'Completed' },
      failed: { variant: 'destructive', className: '', text: 'Failed' },
      processing: { variant: 'default', className: 'bg-info text-white', text: 'Processing' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', className: '', text: status };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
  };

  const calculateTotalPending = () => {
    return payouts
      .filter(payout => payout.payoutStatus === 'pending')
      .reduce((sum, payout) => sum + payout.netAmount, 0);
  };

  const calculateTotalCommission = () => {
    return payouts.reduce((sum, payout) => sum + payout.commissionDeducted, 0);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg text-warning bg-warning-light">
                <KeenIcon icon="time" className="text-xl" />
              </div>
              <div className="text-sm font-medium text-warning">
                Pending
              </div>
            </div>
            <div className="mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">₹{calculateTotalPending().toLocaleString()}</h3>
              <p className="text-sm text-gray-600">Total Pending Payouts</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg text-success bg-success-light">
                <KeenIcon icon="discount" className="text-xl" />
              </div>
              <div className="text-sm font-medium text-success">
                Commission
              </div>
            </div>
            <div className="mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">₹{calculateTotalCommission().toLocaleString()}</h3>
              <p className="text-sm text-gray-600">Total Commission Earned</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg text-primary bg-primary-light">
                <KeenIcon icon="shop" className="text-xl" />
              </div>
              <div className="text-sm font-medium text-primary">
                Providers
              </div>
            </div>
            <div className="mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{payouts.length}</h3>
              <p className="text-sm text-gray-600">Active Providers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Provider Payouts</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-2">
              <div className="relative">
                <KeenIcon icon="magnifier" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by provider name or ID..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline">
              <KeenIcon icon="file-down" className="me-2" />
              Export Data
            </Button>
            <Button variant="default" className="bg-success text-white hover:bg-success/90" onClick={handleBulkSettlement}>
              <KeenIcon icon="cheque" className="me-2" />
              Bulk Settlement
            </Button>
          </div>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Provider Payout Details ({payouts.length})</h3>
        </div>
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead className="hidden sm:table-cell">Total Earnings</TableHead>
                  <TableHead className="hidden md:table-cell">Commission</TableHead>
                  <TableHead className="hidden lg:table-cell">Net Amount</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Last Payout</TableHead>
                  <TableHead className="hidden lg:table-cell">Next Payout</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-success-light rounded-full flex items-center justify-center flex-shrink-0">
                          <KeenIcon icon="shop" className="text-success text-sm" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{payout.providerName}</div>
                          <div className="text-sm text-gray-500 hidden sm:block">{payout.bankAccount} | {payout.ifscCode}</div>
                          <div className="text-xs text-gray-500 sm:hidden">₹{payout.netAmount.toLocaleString()}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="text-center">
                        <div className="font-semibold">₹{payout.totalEarnings.toLocaleString()}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-center">
                        <div className="font-semibold text-warning">₹{payout.commissionDeducted.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">(10%)</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="text-center">
                        <div className="font-semibold text-success">₹{payout.netAmount.toLocaleString()}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{getStatusBadge(payout.payoutStatus)}</TableCell>
                    <TableCell className="hidden md:table-cell">{payout.lastPayoutDate}</TableCell>
                    <TableCell className="hidden lg:table-cell">{payout.nextPayoutDate}</TableCell>
                    <TableCell>
                      {payout.payoutStatus === 'pending' && (
                        <Button 
                          variant="default" className="bg-success text-white hover:bg-success/90" 
                          size="sm"
                          onClick={() => handleSettleNow(payout.id)}
                        >
                          <KeenIcon icon="double-check-circle" className="me-1" />
                          <span className="hidden sm:inline">Settle Now</span>
                          <span className="sm:hidden">Settle</span>
                        </Button>
                      )}
                      {payout.payoutStatus === 'failed' && (
                        <Button 
                          variant="outline" className="border-warning text-warning hover:bg-warning hover:text-white" 
                          size="sm"
                          onClick={() => handleSettleNow(payout.id)}
                        >
                          <KeenIcon icon="arrows-circle" className="me-1" />
                          <span className="hidden sm:inline">Retry</span>
                          <span className="sm:hidden">Retry</span>
                        </Button>
                      )}
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

export { ProviderPayoutsTab };


