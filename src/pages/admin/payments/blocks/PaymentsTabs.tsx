import { useEffect, useState, SyntheticEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabPanel, TabsList, Tab } from '@/components/tabs';
import { CustomerPaymentsTab } from './CustomerPaymentsTab';
import { ProviderPayoutsTab } from './ProviderPayoutsTab';
import { CommissionsReportsTab } from './CommissionsReportsTab';

const PaymentsTabs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'customer-payments';
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (event: SyntheticEvent<Element, Event> | null, newValue: string | number | null) => {
    const tabValue = String(newValue || 'customer-payments');
    setActiveTab(tabValue);
    setSearchParams({ tab: tabValue });
  };

  return (
    <Tabs value={activeTab} onChange={handleTabChange} className="w-full">
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


