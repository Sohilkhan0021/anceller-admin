import { useState } from 'react';
import { AdminDashboardHeader } from './blocks/AdminDashboardHeader';
import { KPICards } from './blocks/KPICards';
import { DashboardCharts } from './blocks/DashboardCharts';
import { QuickLinks } from './blocks/QuickLinks';

const AdminDashboardContent = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  return (
    <div className="grid gap-4 lg:gap-7.5">
      {/* Header with date filters */}
      <AdminDashboardHeader onPeriodChange={setSelectedPeriod} />

      {/* KPI Cards */}
      <KPICards period={selectedPeriod} />

      {/* Charts Section */}
      <DashboardCharts period={selectedPeriod} />

      {/* Quick Links */}
      <QuickLinks />
    </div>
  );
};

export { AdminDashboardContent };

