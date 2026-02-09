import { Fragment } from 'react';
import { KeenIcon } from '@/components';
import { useDashboardStats } from '@/services';
import { ContentLoader } from '@/components/loaders/ContentLoader';

interface IKPICard {
  title: string;
  value: string;
  icon: string;
  color: string;
  change?: {
    value: string;
    type: 'increase' | 'decrease';
  };
  details?: {
    completed?: string;
    pending?: string;
    cancelled?: string;
  };
  isLoading?: boolean;
}

interface KPICardsProps {
  period?: 'today' | 'week' | 'month';
}

const KPICards = ({ period = 'today' }: KPICardsProps) => {
  const { data: stats, isLoading, error } = useDashboardStats({ period });

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      currencyDisplay: 'symbol', // Ensure ₹ symbol is displayed
    }).format(num);
  };

  const formatGrowth = (growth: number | null) => {
    if (growth === null || growth === undefined) return null;
    const sign = growth >= 0 ? '+' : '';
    return { value: `${sign}${growth.toFixed(1)}%`, type: growth >= 0 ? 'increase' as const : 'decrease' as const };
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card">
            <ContentLoader />
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="card">
        <div className="card-body">
          <p className="text-danger">Failed to load dashboard statistics. Please try again.</p>
        </div>
      </div>
    );
  }

  const bookingsGrowth = formatGrowth(stats.bookings.growth);
  const revenueGrowth = formatGrowth(stats.revenue.growth);

  const kpiData: IKPICard[] = [
    {
      title: 'Total Bookings',
      value: formatNumber(stats.bookings.total),
      icon: 'calendar-8',
      color: 'primary',
      change: bookingsGrowth || undefined,
      details: {
        completed: formatNumber(stats.bookings.completed),
        pending: formatNumber(stats.bookings.pending),
        cancelled: formatNumber(stats.bookings.cancelled)
      },
      isLoading: false
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.revenue.total),
      icon: 'wallet',
      color: 'warning',
      change: revenueGrowth || undefined,
      isLoading: false
    },
    {
      title: 'Active Users',
      value: formatNumber(stats.users.active),
      icon: 'user',
      color: 'success',
      isLoading: false
    },
    {
      title: 'Active Providers',
      value: formatNumber(stats.providers.active),
      icon: 'profile-circle',
      color: 'info',
      isLoading: false
    },
    {
      title: 'Commission Earned',
      value: formatCurrency(stats.commission.earned),
      icon: 'financial-schedule',
      color: 'danger',
      isLoading: false
    }
  ];

  const renderKPICard = (card: IKPICard, index: number, heightClass?: string) => {
    const colorClasses = {
      primary: 'text-primary bg-primary-light',
      success: 'text-success bg-success-light',
      info: 'text-info bg-info-light',
      warning: 'text-warning bg-warning-light',
      danger: 'text-danger bg-danger-light'
    };

    const changeColorClasses = {
      increase: 'text-success',
      decrease: 'text-danger'
    };

    return (
      <div key={index} className={`card ${heightClass || ''}`}>
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${colorClasses[card.color as keyof typeof colorClasses]}`}>
              <KeenIcon icon={card.icon} className="text-xl" />
            </div>
            {card.change && (
              <div className={`text-sm font-medium ${changeColorClasses[card.change.type]}`}>
                {card.change.value}
              </div>
            )}
          </div>

          <div className="mb-2">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              {card.isLoading ? '...' : card.value}
            </h3>
            <p className="text-sm text-gray-600">{card.title}</p>
          </div>

          {card.details && (
            <div className="grid grid-cols-3 gap-1 sm:gap-2 pt-3 border-t border-gray-200">
              <div className="text-center">
                <div className="text-sm sm:text-lg font-semibold text-success">{card.details.completed}</div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-sm sm:text-lg font-semibold text-warning">{card.details.pending}</div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-sm sm:text-lg font-semibold text-danger">{card.details.cancelled}</div>
                <div className="text-xs text-gray-600">Cancelled</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Fragment>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        {/* Row 1: First card spans 2 columns on large screens, full width on mobile */}
        <div className="sm:col-span-2 lg:col-span-2">
          {renderKPICard(kpiData[0], 0, 'h-full')}
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          {renderKPICard(kpiData[1], 1, 'h-full')}
        </div>

        {/* Row 2: Remaining 3 cards, responsive columns */}
        <div className="sm:col-span-1">
          {renderKPICard(kpiData[2], 2)}
        </div>
        <div className="sm:col-span-1">
          {renderKPICard(kpiData[3], 3)}
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          {renderKPICard(kpiData[4], 4)}
        </div>
      </div>
    </Fragment>
  );
};

export { KPICards };
