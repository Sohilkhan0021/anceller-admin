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

interface IBannerManagementHeaderProps {
  onAddBanner?: () => void;
  onFiltersChange?: (filters: { search: string; status: string }) => void;
  initialSearch?: string;
  initialStatus?: string;
}

const BannerManagementHeader = ({
  onAddBanner,
  onFiltersChange,
  initialSearch = '',
  initialStatus = 'all'
}: IBannerManagementHeaderProps) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);

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

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex flex-row items-center justify-between w-full gap-4">
          <div className="flex items-center gap-3">
            <KeenIcon icon="ki ki-laptop" className="text-primary text-2xl" />
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Banner Management</h1>
              <p className="text-sm text-gray-600">Manage banners displayed on the platform</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onAddBanner} variant="default" size="sm" className="w-full sm:w-auto">
              <KeenIcon icon="plus" className="me-2" />
              Add a Banner
            </Button>
          </div>
        </div>
      </div>

      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search Bar */}
          <div className="lg:col-span-2">
            <div className="relative">
              <KeenIcon icon="magnifier" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by banner title..."
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
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export { BannerManagementHeader };
