import { Link } from 'react-router-dom';
import { KeenIcon } from '@/components';

interface IQuickLink {
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
  badge?: {
    text: string;
    variant: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  };
}

const QuickLinks = () => {
  const quickLinks: IQuickLink[] = [
    {
      title: 'View All Bookings',
      description: 'Manage and track all service bookings',
      icon: 'calendar-8',
      path: '/bookings',
      color: 'primary',
      badge: {
        text: '247',
        variant: 'primary'
      }
    },
    {
      title: 'Pending Provider Approvals',
      description: 'Review and approve new service providers',
      icon: 'user-check',
      path: '/providers/pending',
      color: 'warning',
      badge: {
        text: '12',
        variant: 'warning'
      }
    },
    {
      title: 'Payment Settlement Queue',
      description: 'Process pending payment settlements',
      icon: 'wallet',
      path: '/payments/settlements',
      color: 'success',
      badge: {
        text: '8',
        variant: 'success'
      }
    }
  ];

  const colorClasses = {
    primary: 'text-primary bg-primary-light hover:bg-primary hover:text-white',
    success: 'text-success bg-success-light hover:bg-success hover:text-white',
    warning: 'text-warning bg-warning-light hover:bg-warning hover:text-white',
    danger: 'text-danger bg-danger-light hover:bg-danger hover:text-white',
    info: 'text-info bg-info-light hover:bg-info hover:text-white'
  };

  const badgeClasses = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info'
  };

  const renderQuickLink = (link: IQuickLink, index: number) => {
    return (
      <Link
        key={index}
        to={link.path}
        className={`card hover:shadow-lg transition-all duration-200 group ${colorClasses[link.color as keyof typeof colorClasses]}`}
      >
        <div className="card-body">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-white/50 group-hover:bg-white/20 transition-colors">
              <KeenIcon icon={link.icon} className="text-xl" />
            </div>
            {link.badge && (
              <span className={`badge badge-sm ${badgeClasses[link.badge.variant]}`}>
                {link.badge.text}
              </span>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-white transition-colors">
              {link.title}
            </h3>
            <p className="text-sm opacity-80 group-hover:text-white transition-colors">
              {link.description}
            </p>
          </div>
          
          <div className="mt-4 flex items-center text-sm font-medium group-hover:text-white transition-colors">
            <span>View Details</span>
            <KeenIcon icon="arrow-right" className="ml-2 text-sm" />
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Quick Actions</h3>
        <p className="text-sm text-gray-600">Frequently used admin functions</p>
      </div>
      
      <div className="card-body">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickLinks.map((link, index) => renderQuickLink(link, index))}
        </div>
      </div>
    </div>
  );
};

export { QuickLinks };
