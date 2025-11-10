import { useState } from 'react';
import ApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const RevenueByCategoryChart = () => {
  const [chartData] = useState({
    categories: ['Home Cleaning', 'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Gardening'],
    data: [45000, 32000, 28000, 22000, 18000, 15000]
  });

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
        columnWidth: '60%',
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
        <ApexChart
          id="revenue_category_chart"
          options={options}
          series={options.series}
          type="bar"
          height="300"
        />
      </div>
    </div>
  );
};

export { RevenueByCategoryChart };

