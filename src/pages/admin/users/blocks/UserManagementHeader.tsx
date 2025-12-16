import { useState, useEffect } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface IUserManagementHeaderProps {
  onAddUser?: () => void;
  onFiltersChange?: (filters: { search: string; status: string }) => void;
  initialSearch?: string;
  initialStatus?: string;
}

const UserManagementHeader = ({ 
  onAddUser,
  onFiltersChange,
  initialSearch = '',
  initialStatus = 'all'
}: IUserManagementHeaderProps) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [userTypeFilter, setUserTypeFilter] = useState('all');

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFiltersChange) {
        onFiltersChange({
          search: searchTerm,
          status: statusFilter === 'all' ? '' : statusFilter,
        });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, onFiltersChange]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleExport = () => {
    // Create CSV data
    const csvData = [
      ['User ID', 'Name', 'Email', 'Phone', 'Total Bookings', 'Status', 'Join Date', 'Last Active', 'Total Spent'],
      // In real app, this would be dynamic data
      ['USR001', 'John Doe', 'john.doe@email.com', '+1 234-567-8900', '12', 'Active', '2024-01-15', '2024-01-20', '2500'],
      ['USR002', 'Jane Smith', 'jane.smith@email.com', '+1 234-567-8901', '8', 'Active', '2024-01-10', '2024-01-19', '1800'],
      ['USR003', 'Mike Johnson', 'mike.johnson@email.com', '+1 234-567-8902', '3', 'Blocked', '2024-01-05', '2024-01-18', '450'],
      ['USR004', 'Sarah Wilson', 'sarah.wilson@email.com', '+1 234-567-8903', '15', 'Active', '2024-01-12', '2024-01-20', '3200'],
      ['USR005', 'David Brown', 'david.brown@email.com', '+1 234-567-8904', '5', 'Active', '2024-01-08', '2024-01-17', '1200']
    ];

    // Convert to CSV string
    const csvString = csvData.map(row => row.join(',')).join('\n');
    
    // Create and download file
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <KeenIcon icon="user" className="text-primary text-2xl" />
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-600">Manage customers using the app</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onAddUser} variant="default" size="sm" className="w-full sm:w-auto">
              <KeenIcon icon="plus" className="me-2" />
              Add User
            </Button>
            <Button onClick={handleExport} variant="outline" size="sm" className="w-full sm:w-auto">
              <KeenIcon icon="file-down" className="me-2" />
              Export User Data
            </Button>
          </div>
        </div>
      </div>
      
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Bar */}
          <div className="lg:col-span-2">
            <div className="relative">
              <KeenIcon icon="magnifier" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Type Filter */}
          <div>
            <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="high-spending">High-Spending Users</SelectItem>
                <SelectItem value="new">New Users</SelectItem>
                <SelectItem value="inactive">Inactive Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export { UserManagementHeader };
