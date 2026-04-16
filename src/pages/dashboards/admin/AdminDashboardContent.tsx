import { useState } from 'react';
import { AdminDashboardHeader } from './blocks/AdminDashboardHeader';
import { KPICards } from './blocks/KPICards';
import { DashboardCharts } from './blocks/DashboardCharts';
import { QuickLinks } from './blocks/QuickLinks';

const AdminDashboardContent = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  return (
    <div className="grid gap-4 lg:gap-7.5">
      <AdminDashboardHeader onPeriodChange={setSelectedPeriod} />
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Key Metrics</h2>
        <KPICards period={selectedPeriod} />
      </section>
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Performance Trends</h2>
        <DashboardCharts period={selectedPeriod} />
      </section>
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Recent Activity</h2>
        <QuickLinks />
      </section>
    </div>
  );
};

export { AdminDashboardContent };

