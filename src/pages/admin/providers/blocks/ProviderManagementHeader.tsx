import { useState } from 'react';
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

interface IProviderManagementHeaderProps {
  onAddProvider?: () => void;
}

const ProviderManagementHeader = ({ onAddProvider }: IProviderManagementHeaderProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [kycStatusFilter, setKycStatusFilter] = useState('all');

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // TODO: Implement search functionality
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

          {/* Category Filter */}
          <div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="ac">AC</SelectItem>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="carpentry">Carpentry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* KYC Status Filter */}
          <div>
            <Select value={kycStatusFilter} onValueChange={setKycStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by KYC status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All KYC Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="under-review">Under Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ProviderManagementHeader };
