import { PaymentsManagementHeader } from './blocks/PaymentsManagementHeader';
import { PaymentsTabs } from './blocks/PaymentsTabs';

const PaymentsManagementContent = () => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      {/* Header */}
      <PaymentsManagementHeader />

      {/* Payments Tabs */}
      <PaymentsTabs />
    </div>
  );
};

export { PaymentsManagementContent };


