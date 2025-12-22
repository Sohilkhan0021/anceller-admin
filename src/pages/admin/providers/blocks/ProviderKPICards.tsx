import { Fragment } from 'react';
import { KeenIcon } from '@/components';
import { useProviders, useProviderStats } from '@/services';

interface IProviderKPICard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  change?: {
    value: string;
    type: 'increase' | 'decrease';
  };
  description?: string;
  isLoading?: boolean;
}

const ProviderKPICards = () => {
  // Fetch all providers for stats calculation (without pagination limit to get all)
  const { providers, isLoading: isLoadingProviders } = useProviders({
    page: 1,
    limit: 1000, // Get all providers for stats
  }, {
    enabled: true,
  });

  const { stats, isLoading: isLoadingStats } = useProviderStats(providers);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const kpiData: IProviderKPICard[] = [
    {
      title: 'Total Providers',
      value: isLoadingProviders || isLoadingStats ? '...' : formatNumber(stats.total_providers),
      icon: 'shop',
      color: 'primary',
      description: 'Active service providers',
      isLoading: isLoadingProviders || isLoadingStats,
    },
    {
      title: 'Pending Approvals',
      value: isLoadingProviders || isLoadingStats ? '...' : formatNumber(stats.pending_approvals),
      icon: 'time',
      color: 'warning',
      description: 'Awaiting KYC verification',
      isLoading: isLoadingProviders || isLoadingStats,
    },
    {
      title: 'Top-rated Providers',
      value: isLoadingProviders || isLoadingStats ? '...' : formatNumber(stats.top_rated_providers),
      icon: 'star',
      color: 'success',
      description: '4.5+ star rating',
      isLoading: isLoadingProviders || isLoadingStats,
    },
    {
      title: 'New This Month',
      value: isLoadingProviders || isLoadingStats ? '...' : formatNumber(stats.new_this_month),
      icon: 'calendar-add',
      color: 'info',
      description: 'Recently registered',
      isLoading: isLoadingProviders || isLoadingStats,
    }
  ];

  const renderKPICard = (card: IProviderKPICard, index: number) => {
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
      <div key={index} className="card">
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
            {card.description && (
              <p className="text-xs text-gray-500 mt-1">{card.description}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Fragment>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiData.map((card, index) => renderKPICard(card, index))}
      </div>
    </Fragment>
  );
};

export { ProviderKPICards };
