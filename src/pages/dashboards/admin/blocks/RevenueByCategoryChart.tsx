import { useMemo } from 'react';
import ApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { useRevenueByCategory } from '@/services';
import { ContentLoader } from '@/components/loaders/ContentLoader';

interface RevenueByCategoryChartProps {
  period?: 'today' | 'week' | 'month';
}

const RevenueByCategoryChart = ({ period = 'today' }: RevenueByCategoryChartProps) => {
  // Calculate date range based on period
  const dateRange = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'today':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }
    
    return {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    };
  }, [period]);

  const { data: revenueData, isLoading, error } = useRevenueByCategory(dateRange);

  const chartData = useMemo(() => {
    if (!revenueData || revenueData.length === 0) {
      return { categories: [], data: [] };
    }

    // Sort by revenue descending and take top 10
    const sorted = [...revenueData].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    
    return {
      categories: sorted.map(item => item.category_name),
      data: sorted.map(item => item.revenue)
    };
  }, [revenueData]);

  const colors = [
    'var(--tw-primary)',
    'var(--tw-success)',
    'var(--tw-info)',
    'var(--tw-warning)',
    'var(--tw-danger)',
    'var(--tw-brand)'
  ];

  const options: ApexOptions = {
    series: [
      {
        name: 'Revenue',
        data: chartData.data
      }
    ],
    chart: {
      height: 300,
      type: 'bar',
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
    colors: colors,
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: chartData.categories.length === 1 ? '30%' : '60%',
        distributed: true
      }
    },
    xaxis: {
      categories: chartData.categories,
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
        },
        rotate: -45
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
        },
        formatter: (value) => `₹${(value / 1000).toFixed(0)}K`
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
              <div class="font-semibold text-md text-gray-900">₹${value.toLocaleString()}</div>
            </div>
          </div>
        `;
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
        <h3 className="card-title">Revenue by Service Category</h3>
        <p className="text-sm text-gray-600">Monthly revenue breakdown by service type</p>
      </div>
      
      <div className="card-body flex flex-col justify-end items-stretch grow px-3 py-1">
        {isLoading ? (
          <ContentLoader />
        ) : error ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-danger">Failed to load revenue data.</p>
          </div>
        ) : chartData.data.length > 0 ? (
          <ApexChart
            id="revenue_category_chart"
            options={options}
            series={options.series}
            type="bar"
            height="300"
          />
        ) : (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-gray-500">No revenue data available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export { RevenueByCategoryChart };

