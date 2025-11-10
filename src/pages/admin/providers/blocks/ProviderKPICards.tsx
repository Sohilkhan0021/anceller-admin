import { Fragment } from 'react';
import { KeenIcon } from '@/components';

interface IProviderKPICard {
  title: string;
  value: string;
  icon: string;
  color: string;
  change?: {
    value: string;
    type: 'increase' | 'decrease';
  };
  description?: string;
}

const ProviderKPICards = () => {
  const kpiData: IProviderKPICard[] = [
    {
      title: 'Total Providers',
      value: '1,247',
      icon: 'shop',
      color: 'primary',
      change: {
        value: '+15%',
        type: 'increase'
      },
      description: 'Active service providers'
    },
    {
      title: 'Pending Approvals',
      value: '23',
      icon: 'time',
      color: 'warning',
      change: {
        value: '+3',
        type: 'increase'
      },
      description: 'Awaiting KYC verification'
    },
    {
      title: 'Top-rated Providers',
      value: '156',
      icon: 'star',
      color: 'success',
      change: {
        value: '+8%',
        type: 'increase'
      },
      description: '4.5+ star rating'
    },
    {
      title: 'New This Month',
      value: '89',
      icon: 'calendar-add',
      color: 'info',
      change: {
        value: '+12%',
        type: 'increase'
      },
      description: 'Recently registered'
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
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{card.value}</h3>
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
