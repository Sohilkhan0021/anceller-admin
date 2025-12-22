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
import { useCategories } from '@/services';

interface IProviderManagementHeaderProps {
  onAddProvider?: () => void;
  onFiltersChange?: (filters: { search: string; status: string; category_id?: string }) => void;
  initialSearch?: string;
  initialStatus?: string;
  initialCategoryId?: string;
}

const ProviderManagementHeader = ({ 
  onAddProvider,
  onFiltersChange,
  initialSearch = '',
  initialStatus = 'all',
  initialCategoryId = 'all'
}: IProviderManagementHeaderProps) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [categoryFilter, setCategoryFilter] = useState(initialCategoryId);
  const [kycStatusFilter, setKycStatusFilter] = useState('all');

  // Fetch categories from API
  const { categories, isLoading: isLoadingCategories } = useCategories({
    page: 1,
    limit: 100, // Get all categories for filter
    status: 'active'
  });

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFiltersChange) {
        onFiltersChange({
          search: searchTerm,
          status: statusFilter === 'all' ? '' : statusFilter,
          category_id: categoryFilter === 'all' ? '' : categoryFilter,
        });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, categoryFilter, onFiltersChange]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <KeenIcon icon="shop" className="text-primary text-2xl" />
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Provider Management</h1>
              <p className="text-sm text-gray-600">Approve, verify, and monitor service providers</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={onAddProvider} variant="default" size="sm" className="w-full sm:w-auto">
              <KeenIcon icon="plus" className="me-2" />
              Add Provider
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
                placeholder="Search by name, ID, or service category..."
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
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div>
            <Select 
              value={categoryFilter} 
              onValueChange={setCategoryFilter}
              disabled={isLoadingCategories}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingCategories ? "Loading..." : "Filter by category"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id || category.public_id || category.category_id || ''} value={category.id || category.public_id || category.category_id || ''}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ProviderManagementHeader };
