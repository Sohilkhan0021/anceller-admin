import { useState, useEffect, useMemo } from 'react';
import ApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { useBookingTrend } from '@/services';
import { ContentLoader } from '@/components/loaders/ContentLoader';

interface BookingTrendChartProps {
  period?: 'today' | 'week' | 'month';
}

const BookingTrendChart = ({ period = 'today' }: BookingTrendChartProps) => {
  const [selectedDays, setSelectedDays] = useState(7);

  // Map period to days
  useEffect(() => {
    switch (period) {
      case 'today':
        setSelectedDays(7);
        break;
      case 'week':
        setSelectedDays(7);
        break;
      case 'month':
        setSelectedDays(30);
        break;
      default:
        setSelectedDays(7);
    }
  }, [period]);

  const { data: trendData, isLoading, error } = useBookingTrend({ days: selectedDays });

  const chartData = useMemo(() => {
    if (!trendData) return { bookings: [], labels: [] };

    return {
      bookings: trendData.bookings || [],
      labels: trendData.labels || []
    };
  }, [trendData]);

  const formatDateLabel = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const options: ApexOptions = {
    series: [
      {
        name: 'Bookings',
        data: chartData.bookings
      }
    ],
    chart: {
      height: 300,
      type: 'line',
      toolbar: {
        show: false
      }
    },
    dataLabels: {
      enabled: false
    },
    legend: {
      show: false
    },
    stroke: {
      curve: 'smooth',
      show: true,
      width: 3,
      colors: ['var(--tw-primary)']
    },
    xaxis: {
      categories: chartData.labels.map(formatDateLabel),
      tickAmount: selectedDays === 30 ? 6 : undefined, // added to remove conjected looks on UI 
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        style: {
          colors: 'var(--tw-gray-500)',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      axisTicks: {
        show: false
      },
      labels: {
        style: {
          colors: 'var(--tw-gray-500)',
          fontSize: '12px'
        }
      }
    },
    tooltip: {
      enabled: true,
      custom({ series, seriesIndex, dataPointIndex, w }) {
        const value = series[seriesIndex][dataPointIndex];
        const category = w.globals.seriesX[seriesIndex][dataPointIndex];

        return `
          <div class="flex flex-col gap-2 p-3.5">
            <div class="font-medium text-2sm text-gray-600">${category}</div>
            <div class="flex items-center gap-1.5">
              <div class="font-semibold text-md text-gray-900">${value} Bookings</div>
            </div>
          </div>
        `;
      }
    },
    markers: {
      size: 0,
      colors: 'var(--tw-primary-light)',
      strokeColors: 'var(--tw-primary)',
      strokeWidth: 4,
      strokeOpacity: 1,
      strokeDashArray: 0,
      fillOpacity: 1,
      discrete: [],
      shape: 'circle',
      offsetX: 0,
      offsetY: 0,
      onClick: undefined,
      onDblClick: undefined,
      showNullDataPoints: true,
      hover: {
        size: 8,
        sizeOffset: 0
      }
    },
    fill: {
      gradient: {
        opacityFrom: 0.25,
        opacityTo: 0
      }
    },
    grid: {
      borderColor: 'var(--tw-gray-200)',
      strokeDashArray: 5,
      yaxis: {
        lines: {
          show: true
        }
      },
      xaxis: {
        lines: {
          show: false
        }
      }
    }
  };

  return (
    <div className="card h-full">
      <div className="card-header">
        <h3 className="card-title">Booking Trend</h3>
        <p className="text-sm text-gray-600">
          {selectedDays === 7
            ? 'Last 7 Days'
            : selectedDays === 30
              ? 'Last 30 Days'
              : `Last ${selectedDays} Days`}
        </p>
      </div>

      <div className="card-body flex flex-col justify-end items-stretch grow px-3 py-1">
        {isLoading ? (
          <ContentLoader />
        ) : error ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-danger">Failed to load booking trend data.</p>
          </div>
        ) : chartData.bookings.length > 0 ? (
          <ApexChart
            id="booking_trend_chart"
            options={options}
            series={options.series}
            type="line"
            height="300"
          />
        ) : (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-gray-500">No booking data available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export { BookingTrendChart };

