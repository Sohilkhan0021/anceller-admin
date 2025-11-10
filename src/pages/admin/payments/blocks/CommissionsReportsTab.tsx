import { useState } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

const CommissionsReportsTab = () => {
  const [reportPeriod, setReportPeriod] = useState('this-month');

  // Mock data - in real app, this would come from API
  const revenueSummary = {
    grossRevenue: 125000,
    netCommission: 12500,
    refunds: 2500,
    netRevenue: 110000,
    totalTransactions: 156,
    averageTransactionValue: 801
  };

  const commissionBreakdown = [
    {
      service: 'Electrical',
      totalBookings: 45,
      grossRevenue: 45000,
      commission: 4500,
      commissionRate: '10%'
    },
    {
      service: 'Plumbing',
      totalBookings: 32,
      grossRevenue: 32000,
      commission: 3200,
      commissionRate: '10%'
    },
    {
      service: 'AC Repair',
      totalBookings: 28,
      grossRevenue: 28000,
      commission: 2800,
      commissionRate: '10%'
    },
    {
      service: 'Cleaning',
      totalBookings: 35,
      grossRevenue: 15000,
      commission: 1500,
      commissionRate: '10%'
    },
    {
      service: 'Carpentry',
      totalBookings: 16,
      grossRevenue: 5000,
      commission: 500,
      commissionRate: '10%'
    }
  ];

  const refundDetails = [
    {
      id: 'REF001',
      bookingId: 'BK001',
      customerName: 'John Doe',
      amount: 500,
      reason: 'Service not satisfactory',
      status: 'processed',
      date: '2024-01-20'
    },
    {
      id: 'REF002',
      bookingId: 'BK005',
      customerName: 'David Brown',
      amount: 1500,
      reason: 'Provider cancelled',
      status: 'pending',
      date: '2024-01-24'
    },
    {
      id: 'REF003',
      bookingId: 'BK012',
      customerName: 'Sarah Wilson',
      amount: 500,
      reason: 'Customer cancelled',
      status: 'processed',
      date: '2024-01-25'
    }
  ];

  const handleDownloadReport = (format: string) => {
    // TODO: Implement report download
    console.log(`Downloading ${format} report...`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      processed: { variant: 'default', className: 'bg-success text-white', text: 'Processed' },
      pending: { variant: 'default', className: 'bg-warning text-white', text: 'Pending' },
      failed: { variant: 'destructive', className: '', text: 'Failed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', className: '', text: status };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg text-primary bg-primary-light">
                <KeenIcon icon="money-bill" className="text-xl" />
              </div>
              <div className="text-sm font-medium text-primary">
                +12.5%
              </div>
            </div>
            <div className="mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">₹{revenueSummary.grossRevenue.toLocaleString()}</h3>
              <p className="text-sm text-gray-600">Gross Revenue</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg text-success bg-success-light">
                <KeenIcon icon="chart-simple" className="text-xl" />
              </div>
              <div className="text-sm font-medium text-success">
                +8.2%
              </div>
            </div>
            <div className="mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">₹{revenueSummary.netCommission.toLocaleString()}</h3>
              <p className="text-sm text-gray-600">Net Commission</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg text-warning bg-warning-light">
                <KeenIcon icon="arrows-loop" className="text-xl" />
              </div>
              <div className="text-sm font-medium text-warning">
                -2.1%
              </div>
            </div>
            <div className="mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">₹{revenueSummary.refunds.toLocaleString()}</h3>
              <p className="text-sm text-gray-600">Refunds</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg text-info bg-info-light">
                <KeenIcon icon="chart-line" className="text-xl" />
              </div>
              <div className="text-sm font-medium text-info">
                +15.3%
              </div>
            </div>
            <div className="mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">₹{revenueSummary.netRevenue.toLocaleString()}</h3>
              <p className="text-sm text-gray-600">Net Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Controls */}
      <div className="card">
        <div className="card-header">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="card-title">Revenue Reports</h3>
              <p className="text-sm text-gray-600">Generate and download financial reports</p>
            </div>
            <div className="flex gap-3">
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="this-quarter">This Quarter</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => handleDownloadReport('PDF')}>
                <KeenIcon icon="file-down" className="me-2" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={() => handleDownloadReport('CSV')}>
                <KeenIcon icon="file-down" className="me-2" />
                Download CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Breakdown */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Commission Breakdown by Service</h3>
        </div>
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead className="hidden sm:table-cell">Bookings</TableHead>
                  <TableHead className="hidden md:table-cell">Revenue</TableHead>
                  <TableHead className="hidden lg:table-cell">Rate</TableHead>
                  <TableHead className="hidden sm:table-cell">Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissionBreakdown.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.service}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="text-center">
                        <div className="font-semibold">{item.totalBookings}</div>
                        <div className="text-xs text-gray-500">bookings</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-center">
                        <div className="font-semibold">₹{item.grossRevenue.toLocaleString()}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="outline" className="badge-outline">
                        {item.commissionRate}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="text-center">
                        <div className="font-semibold text-success">₹{item.commission.toLocaleString()}</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Refund Details */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center gap-2">
            <KeenIcon icon="arrows-loop" className="text-lg" />
            Refund Details
          </h3>
        </div>
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden sm:table-cell">Refund ID</TableHead>
                  <TableHead>Refund</TableHead>
                  <TableHead className="hidden md:table-cell">Amount</TableHead>
                  <TableHead className="hidden lg:table-cell">Reason</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refundDetails.map((refund) => (
                  <TableRow key={refund.id}>
                    <TableCell className="hidden sm:table-cell font-medium">{refund.id}</TableCell>
                    <TableCell>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{refund.customerName}</div>
                        <div className="text-sm text-gray-500 hidden sm:block">{refund.id}</div>
                        <div className="text-xs text-gray-500 sm:hidden">₹{refund.amount.toLocaleString()}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-center">
                        <div className="font-semibold text-warning">₹{refund.amount.toLocaleString()}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="max-w-xs">
                        <div className="truncate" title={refund.reason}>
                          {refund.reason}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{getStatusBadge(refund.status)}</TableCell>
                    <TableCell className="hidden md:table-cell">{refund.date}</TableCell>
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

export { CommissionsReportsTab };


