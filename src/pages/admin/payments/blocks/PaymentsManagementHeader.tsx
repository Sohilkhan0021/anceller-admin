import { KeenIcon } from '@/components';

const PaymentsManagementHeader = () => {
  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-3">
          <KeenIcon icon="money-bill" className="text-primary text-2xl" />
          <div>
            <h1 className="text-xl font-bold text-foreground lg:text-2xl">Payments & Revenue</h1>
            <p className="text-sm text-muted-foreground">
              Manage transactions, payouts, and commissions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { PaymentsManagementHeader };
