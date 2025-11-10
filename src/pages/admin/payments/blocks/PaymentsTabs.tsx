import {
  Tabs,
  TabPanel,
  TabsList,
  Tab,
} from '@/components/tabs';
import { CustomerPaymentsTab } from './CustomerPaymentsTab';
import { ProviderPayoutsTab } from './ProviderPayoutsTab';
import { CommissionsReportsTab } from './CommissionsReportsTab';

const PaymentsTabs = () => {
  return (
    <Tabs defaultValue="customer-payments" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <Tab value="customer-payments">Customer Payments</Tab>
        <Tab value="provider-payouts">Provider Payouts</Tab>
        <Tab value="commissions-reports">Commissions & Reports</Tab>
      </TabsList>

      {/* Customer Payments Tab */}
      <TabPanel value="customer-payments">
        <CustomerPaymentsTab />
      </TabPanel>

      {/* Provider Payouts Tab */}
      <TabPanel value="provider-payouts">
        <ProviderPayoutsTab />
      </TabPanel>

      {/* Commissions & Reports Tab */}
      <TabPanel value="commissions-reports">
        <CommissionsReportsTab />
      </TabPanel>
    </Tabs>
  );
};

export { PaymentsTabs };


