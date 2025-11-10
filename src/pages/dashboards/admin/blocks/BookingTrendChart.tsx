import { useState, useEffect } from 'react';
import ApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const BookingTrendChart = () => {
  const [chartData, setChartData] = useState<number[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');

  // Mock data - in real app, this would come from API
  const mockData = {
    '7days': [45, 52, 38, 64, 55, 48, 72],
    '30days': [45, 52, 38, 64, 55, 48, 72, 58, 67, 45, 52, 38, 64, 55, 48, 72, 58, 67, 45, 52, 38, 64, 55, 48, 72, 58, 67, 45, 52, 38],
    '90days': [45, 52, 38, 64, 55, 48, 72, 58, 67, 45, 52, 38, 64, 55, 48, 72, 58, 67, 45, 52, 38, 64, 55, 48, 72, 58, 67, 45, 52, 38, 64, 55, 48, 72, 58, 67, 45, 52, 38, 64, 55, 48, 72, 58, 67, 45, 52, 38, 64, 55, 48, 72, 58, 67, 45, 52, 38, 64, 55, 48, 72, 58, 67, 45, 52, 38, 64, 55, 48, 72, 58, 67, 45, 52, 38, 64, 55, 48, 72, 58, 67, 45, 52, 38, 64, 55, 48, 72, 58, 67]
  };

  const getCategories = (period: string) => {
    switch (period) {
      case '7days':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      case '30days':
        return Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
      case '90days':
        return Array.from({ length: 90 }, (_, i) => `Day ${i + 1}`);
      default:
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    }
  };

  useEffect(() => {
    setChartData(mockData[selectedPeriod as keyof typeof mockData] || []);
  }, [selectedPeriod]);

  const options: ApexOptions = {
    series: [
      {
        name: 'Bookings',
        data: chartData
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
      categories: getCategories(selectedPeriod),
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
        
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="card-body flex flex-col justify-end items-stretch grow px-3 py-1">
        {chartData.length > 0 && (
          <ApexChart
            id="booking_trend_chart"
            options={options}
            series={options.series}
            type="line"
            height="300"
          />
        )}
      </div>
    </div>
  );
};

export { BookingTrendChart };

