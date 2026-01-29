import { useState, useMemo } from 'react';
import { KeenIcon } from '@/components';
// import { Button } from '@/components/ui/button';
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
import { useRevenueStats, useRevenueByGateway } from '@/services';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';

const CommissionsReportsTab = () => {
  const [reportPeriod, setReportPeriod] = useState('this-month');

  // Calculate date range based on period
  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    let start = new Date();

    switch (reportPeriod) {
      case 'this-week':
        start.setDate(end.getDate() - 7);
        break;
      case 'this-month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'last-month':
        start.setMonth(end.getMonth() - 2);
        end.setMonth(end.getMonth() - 1);
        end.setDate(0); // Last day of previous month
        break;
      case 'this-quarter':
        start.setMonth(end.getMonth() - 3);
        break;
      case 'this-year':
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        start.setMonth(end.getMonth() - 1);
    }
    start.setHours(0, 0, 0, 0);

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  }, [reportPeriod]);

  // Fetch revenue stats
  const {
    stats: revenueStats,
    isLoading: isLoadingStats,
    isError: isStatsError,
    error: statsError,
    refetch: refetchStats
  } = useRevenueStats(startDate, endDate);

  // Fetch revenue by gateway
  const {
    revenue: revenueByGateway,
    isLoading: isLoadingGateway
  } = useRevenueByGateway(startDate, endDate);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDownloadReport = (format: string) => {
    // TODO: Implement report download API
    console.log(`Downloading ${format} report...`);
  };

  // Calculate commission breakdown from revenue by gateway
  const commissionBreakdown = useMemo(() => {
    if (!revenueByGateway || revenueByGateway.length === 0) return [];
    
    return revenueByGateway.map(item => ({
      service: item.gateway || 'Unknown',
      totalBookings: item.transaction_count || 0,
      grossRevenue: item.revenue || 0,
      commission: (item.revenue || 0) * 0.1, // 10% commission
      commissionRate: '10%'
    }));
  }, [revenueByGateway]);

  if (isStatsError) {
    return (
      <div className="space-y-6">
        <Alert variant="danger">
          <div className="flex items-center justify-between">
            <span>
              {statsError?.message || 'Failed to load revenue statistics. Please try again.'}
            </span>
            <button
              onClick={() => refetchStats()}
              className="text-sm underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        </Alert>
      </div>
    );
  }

  const netRevenue = (revenueStats?.total_revenue || 0) - (revenueStats?.total_refunds || 0);
  const netCommission = (revenueStats?.total_revenue || 0) * 0.1; // 10% commission

  return (
    <div className="space-y-6">
      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg text-primary bg-primary-light">
                <KeenIcon icon="wallet" className="text-xl" />
              </div>
            </div>
            <div className="mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isLoadingStats ? '...' : formatCurrency(revenueStats?.total_revenue || 0)}
              </h3>
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
            </div>
            <div className="mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isLoadingStats ? '...' : formatCurrency(netCommission)}
              </h3>
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
            </div>
            <div className="mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isLoadingStats ? '...' : formatCurrency(revenueStats?.total_refunds || 0)}
              </h3>
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
            </div>
            <div className="mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isLoadingStats ? '...' : formatCurrency(netRevenue)}
              </h3>
              <p className="text-sm text-gray-600">Net Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Controls */}
      <div className="card">
        <div className="card-header">
          <div className="flex flex-row items-center justify-between w-full gap-4">
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
              {/* <Button variant="outline" onClick={() => handleDownloadReport('PDF')}>
                <KeenIcon icon="file-down" className="me-2" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={() => handleDownloadReport('CSV')}>
                <KeenIcon icon="file-down" className="me-2" />
                Download CSV
              </Button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Commission Breakdown */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Commission Breakdown by Gateway</h3>
        </div>
        <div className="card-body p-0">
          {isLoadingGateway ? (
            <div className="p-8">
              <ContentLoader />
            </div>
          ) : commissionBreakdown.length === 0 ? (
            <div className="p-8 text-center">
              <KeenIcon icon="cross-circle" className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No revenue data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4">Gateway</TableHead>
                    <TableHead className="hidden sm:table-cell px-4 text-center">Transactions</TableHead>
                    <TableHead className="hidden md:table-cell px-4 text-center">Revenue</TableHead>
                    <TableHead className="hidden lg:table-cell px-4 text-center">Rate</TableHead>
                    <TableHead className="hidden sm:table-cell px-4 text-center">Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissionBreakdown.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="px-4 font-medium">{item.service}</TableCell>
                      <TableCell className="hidden sm:table-cell px-4">
                        <div className="text-center">
                          <div className="font-semibold">{item.totalBookings}</div>
                          <div className="text-xs text-gray-500">transactions</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell px-4">
                        <div className="text-center">
                          <div className="font-semibold">{formatCurrency(item.grossRevenue)}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell px-4">
                        <div className="text-center">
                          <Badge variant="outline" className="badge-outline">
                            {item.commissionRate}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell px-4">
                        <div className="text-center">
                          <div className="font-semibold text-success">{formatCurrency(item.commission)}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { CommissionsReportsTab };


