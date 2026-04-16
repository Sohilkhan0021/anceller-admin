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
  // eslint-disable-next-line no-unused-vars
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

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFiltersChange) {
        onFiltersChange({
          search: searchTerm,
          status: statusFilter === 'all' ? '' : statusFilter
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

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex w-full flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <KeenIcon icon="user" className="text-primary text-2xl" />
            <div>
              <h1 className="text-xl font-bold text-foreground lg:text-2xl">User Management</h1>
              <p className="text-sm text-muted-foreground">Manage customers using the app</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={onAddUser} variant="default" size="sm" className="w-full sm:w-auto">
              <KeenIcon icon="plus" className="me-2" />
              Add User
            </Button>
            {/* <Button onClick={handleExport} variant="outline" size="sm" className="w-full sm:w-auto">
              <KeenIcon icon="file-down" className="me-2" />
              Export User Data
            </Button> */}
          </div>
        </div>
      </div>

      <div className="card-body">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Search Bar */}
          <div className="lg:col-span-2">
            <div className="relative">
              <KeenIcon
                icon="magnifier"
                className="absolute left-3 top-1/2 -translate-y-1/2 transform text-muted-foreground/70"
              />
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
                <SelectItem value="SUSPENDED">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export { UserManagementHeader };
