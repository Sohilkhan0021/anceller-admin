import { BookingTrendChart } from './BookingTrendChart';
import { RevenueByCategoryChart } from './RevenueByCategoryChart';

interface DashboardChartsProps {
  period?: 'today' | 'week' | 'month';
}

const DashboardCharts = ({ period = 'today' }: DashboardChartsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">
      <div className="lg:col-span-1">
        <p className="mb-2 text-sm font-medium text-muted-foreground">Bookings over time</p>
        <BookingTrendChart period={period} />
      </div>

      <div className="lg:col-span-1">
        <p className="mb-2 text-sm font-medium text-muted-foreground">Revenue by category</p>
        <RevenueByCategoryChart period={period} />
      </div>
    </div>
  );
};

export { DashboardCharts };

