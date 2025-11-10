import { useState, useEffect } from 'react';
import ApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { BookingTrendChart } from './BookingTrendChart';
import { RevenueByCategoryChart } from './RevenueByCategoryChart';

const DashboardCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">
      {/* Booking Trend Chart */}
      <div className="lg:col-span-1">
        <BookingTrendChart />
      </div>

      {/* Revenue by Service Category Chart */}
      <div className="lg:col-span-1">
        <RevenueByCategoryChart />
      </div>
    </div>
  );
};

export { DashboardCharts };

