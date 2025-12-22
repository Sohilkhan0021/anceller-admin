import { BookingTrendChart } from './BookingTrendChart';
import { RevenueByCategoryChart } from './RevenueByCategoryChart';

interface DashboardChartsProps {
  period?: 'today' | 'week' | 'month';
}

const DashboardCharts = ({ period = 'today' }: DashboardChartsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">
      {/* Booking Trend Chart */}
      <div className="lg:col-span-1">
        <BookingTrendChart period={period} />
      </div>

      {/* Revenue by Service Category Chart */}
      <div className="lg:col-span-1">
        <RevenueByCategoryChart period={period} />
      </div>
    </div>
  );
};

export { DashboardCharts };

