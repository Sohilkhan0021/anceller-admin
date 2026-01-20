import { useState } from 'react';
import { KeenIcon } from '@/components';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface AdminDashboardHeaderProps {
  onPeriodChange?: (period: 'today' | 'week' | 'month') => void;
}

const AdminDashboardHeader = ({ onPeriodChange }: AdminDashboardHeaderProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  const handlePeriodChange = (value: string) => {
    const period = value as 'today' | 'week' | 'month';
    setSelectedPeriod(period);
    onPeriodChange?.(period);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-3">
            <KeenIcon icon="chart-simple" className="text-primary text-2xl" />
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export { AdminDashboardHeader };
