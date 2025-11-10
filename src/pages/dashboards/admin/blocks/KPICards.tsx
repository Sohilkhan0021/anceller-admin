import { Fragment } from 'react';
import { KeenIcon } from '@/components';

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
}

const KPICards = () => {
  const kpiData: IKPICard[] = [
    {
      title: 'Total Bookings',
      value: '1,247',
      icon: 'calendar-8',
      color: 'primary',
      change: {
        value: '+12%',
        type: 'increase'
      },
      details: {
        completed: '892',
        pending: '234',
        cancelled: '121'
      }
    },
    {
      title: 'Total Revenue',
      value: '₹2,45,680',
      icon: 'wallet',
      color: 'warning',
      change: {
        value: '+15%',
        type: 'increase'
      }
    },
    {
      title: 'Active Users',
      value: '2,847',
      icon: 'user',
      color: 'success',
      change: {
        value: '+8%',
        type: 'increase'
      }
    },
    {
      title: 'Active Providers',
      value: '156',
      icon: 'profile-circle',
      color: 'info',
      change: {
        value: '+5%',
        type: 'increase'
      }
    },
   
    {
      title: 'Commission Earned',
      value: '12.5%',
      icon: 'percentage-circle',
      color: 'danger',
      change: {
        value: '+2.1%',
        type: 'increase'
      }
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
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{card.value}</h3>
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
