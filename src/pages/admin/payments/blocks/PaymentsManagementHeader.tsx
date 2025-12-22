import { KeenIcon } from '@/components';

const PaymentsManagementHeader = () => {
  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-3">
          <KeenIcon icon="money-bill" className="text-primary text-2xl" />
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Payments & Revenue</h1>
            <p className="text-sm text-gray-600">Manage transactions, payouts, and commissions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { PaymentsManagementHeader };
