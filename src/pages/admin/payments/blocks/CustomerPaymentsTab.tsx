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

const CustomerPaymentsTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentModeFilter, setPaymentModeFilter] = useState('all');

  // Mock data - in real app, this would come from API
  const transactions = [
    {
      id: 'TXN001',
      user: 'John Doe',
      amount: 500,
      paymentMode: 'Credit Card',
      status: 'success',
      date: '2024-01-20 10:15 AM',
      razorpayRefId: 'pay_1234567890abcdef'
    },
    {
      id: 'TXN002',
      user: 'Jane Smith',
      amount: 800,
      paymentMode: 'UPI',
      status: 'success',
      date: '2024-01-21 2:30 PM',
      razorpayRefId: 'pay_2345678901bcdefg'
    },
    {
      id: 'TXN003',
      user: 'Mike Johnson',
      amount: 1200,
      paymentMode: 'Net Banking',
      status: 'pending',
      date: '2024-01-22 9:45 AM',
      razorpayRefId: 'pay_3456789012cdefgh'
    },
    {
      id: 'TXN004',
      user: 'Sarah Wilson',
      amount: 300,
      paymentMode: 'Wallet',
      status: 'failed',
      date: '2024-01-23 11:20 AM',
      razorpayRefId: 'pay_4567890123defghi'
    },
    {
      id: 'TXN005',
      user: 'David Brown',
      amount: 1500,
      paymentMode: 'COD',
      status: 'success',
      date: '2024-01-24 3:15 PM',
      razorpayRefId: 'N/A'
    }
  ];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // TODO: Implement search functionality
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting customer payments data...');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      success: { variant: 'default', className: 'bg-success text-white', text: 'Success' },
      pending: { variant: 'default', className: 'bg-warning text-white', text: 'Pending' },
      failed: { variant: 'destructive', className: '', text: 'Failed' },
      cod: { variant: 'secondary', className: '', text: 'COD' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', className: '', text: status };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
  };

  const getPaymentModeIcon = (paymentMode: string) => {
    const iconMap = {
      'Credit Card': 'credit-card',
      'Debit Card': 'credit-card',
      'UPI': 'smartphone',
      'Net Banking': 'bank',
      'Wallet': 'wallet',
      'COD': 'money'
    };
    
    return iconMap[paymentMode as keyof typeof iconMap] || 'money';
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Customer Payments</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-2">
              <div className="relative">
                <KeenIcon icon="magnifier" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by transaction ID, user, or Razorpay Ref ID..."
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
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cod">COD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Mode Filter */}
            <div>
              <Select value={paymentModeFilter} onValueChange={setPaymentModeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by payment mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Modes</SelectItem>
                  <SelectItem value="credit-card">Credit Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="net-banking">Net Banking</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                  <SelectItem value="cod">COD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={handleExport}>
              <KeenIcon icon="file-down" className="me-2" />
              Export Data
            </Button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Payment Transactions ({transactions.length})</h3>
        </div>
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden sm:table-cell">Transaction ID</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead className="hidden md:table-cell">Amount</TableHead>
                  <TableHead className="hidden lg:table-cell">Payment Mode</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden lg:table-cell">Razorpay Ref ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="hidden sm:table-cell font-medium">{transaction.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                          <KeenIcon icon="user" className="text-primary text-sm" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{transaction.user}</div>
                          <div className="text-sm text-gray-500 hidden sm:block">{transaction.id}</div>
                          <div className="text-xs text-gray-500 sm:hidden">₹{transaction.amount.toLocaleString()}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-center">
                        <div className="font-semibold">₹{transaction.amount.toLocaleString()}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <KeenIcon icon={getPaymentModeIcon(transaction.paymentMode)} className="text-gray-500 text-sm" />
                        <span className="text-sm">{transaction.paymentMode}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell className="hidden md:table-cell">{transaction.date}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="font-mono text-sm">
                        {transaction.razorpayRefId}
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

export { CustomerPaymentsTab };


