import { AdminDashboardHeader } from './blocks/AdminDashboardHeader';
import { KPICards } from './blocks/KPICards';
import { DashboardCharts } from './blocks/DashboardCharts';
import { QuickLinks } from './blocks/QuickLinks';

const AdminDashboardContent = () => {
  return (
    <div className="grid gap-4 lg:gap-7.5">
      {/* Header with date filters */}
      <AdminDashboardHeader />

      {/* KPI Cards */}
      <KPICards />

      {/* Charts Section */}
      <DashboardCharts />

      {/* Quick Links */}
      <QuickLinks />
    </div>
  );
};

export { AdminDashboardContent };

