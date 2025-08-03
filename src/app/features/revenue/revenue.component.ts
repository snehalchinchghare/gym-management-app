import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexLegend,
  NgApexchartsModule
} from 'ng-apexcharts';
import { SupabaseService } from '../supabase/common.supabase.service';
import { endWith, window } from 'rxjs';
import { LoaderService } from '../services/loader.service';

@Component({
  selector: 'app-revenue',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgApexchartsModule],
  templateUrl: './revenue.component.html',
  styleUrl: './revenue.component.scss'
})
export class RevenueComponent implements OnInit {
  chartType: string = 'monthlyRevenue';
  chartOptions: any = {};
  availableCharts = [
    { id: 'monthlyRevenue', label: 'Monthly Revenue' },
    { id: 'packageDistribution', label: 'Package Wise Revenue' },
    { id: 'serviceDistribution', label: 'Service Wise Revenue' },
  ];
  fromDate!: Date;
  toDate!: Date;

  constructor(private supabaseService: SupabaseService, private loader: LoaderService) {

  }

  async ngOnInit() {
    await this.loadChart(this.chartType);
  }

  async onDateRangeChange() {
    await this.loadChart(this.chartType);
  }

  async loadChart(type: string) {
    this.chartType = type;

    switch (type) {
      case 'monthlyRevenue':
        await this.loadMonthlyRevenueChart();
        break;
      case 'packageDistribution':
        await this.loadPackageDistributionChart();
        break;
      case 'serviceDistribution':
        await this.loadServiceDistributionChart();
        break;
    }
  }

  async loadMonthlyRevenueChart() {
    if (this.fromDate && this.toDate) {
      this.loader.show();
  
      try {
        const data = await this.supabaseService.loadMonthlyRevenueChart(this.fromDate, this.toDate);
  
        if (data && Object.keys(data).length > 0) {
          this.chartOptions = {
            series: [{
              name: 'Revenue',
              data: Object.values(data)
            }],
            chart: {
              type: 'bar',
              height: 350
            },
            xaxis: {
              categories: Object.keys(data),
              title: {
                text: 'Month'
              }
            },
            dataLabels: {
              enabled: true,
              formatter: function (val: number) {
                return `₹${val}`;
              }
            },
            tooltip: {
              y: {
                formatter: function (val: number) {
                  return `₹${val}`;
                }
              }
            },
            title: {
              text: 'Monthly Revenue',
              align: 'center'
            }
          };
        } else {
          alert("No revenue data found for the selected period.");
        }
  
      } catch (error) {
        alert('Error loading revenue chart: ' + error);
      } finally {
        this.loader.hide();
      }
    }
  }
  


  async loadPackageDistributionChart() {
    if (this.fromDate && this.toDate) {
      this.loader.show();
  
      try {
        const data = await this.supabaseService.loadPackageDistributionChart(this.fromDate, this.toDate);
  
        if (data && Object.keys(data).length > 0) {
          const series = Object.values(data);
          const labels = Object.keys(data);
  
          this.chartOptions = {
            series: series,
            chart: {
              type: 'pie',
              height: 350
            },
            labels: labels,
            title: {
              text: 'Revenue by Package',
              align: 'center'
            },
            dataLabels: {
              enabled: true,
              formatter: function (val: number, opts: any) {
                const value = opts?.w?.config?.series?.[opts.seriesIndex] || 0;
                return `₹${value} (${val.toFixed(1)}%)`;
              }
            },
            tooltip: {
              y: {
                formatter: function (val: number, opts: any) {
                  const total = opts?.w?.config?.series?.reduce?.((a: number, b: number) => a + b, 0) || 1;
                  const percent = ((val / total) * 100).toFixed(1);
                  return `₹${val} (${percent}%)`;
                }
              }
            },
            responsive: [
              {
                breakpoint: 480,
                options: {
                  chart: {
                    height: 300
                  },
                  legend: {
                    position: 'bottom'
                  }
                }
              }
            ]
          };
        } else {
          alert("No package revenue data found for the selected period.");
        }
  
      } catch (error) {
        alert('Error loading package chart: ' + error);
      } finally {
        this.loader.hide();
      }
    }
  }
  

  async loadServiceDistributionChart() {
    if (this.fromDate && this.toDate) {
      this.loader.show();
  
      try {
        const data = await this.supabaseService.loadServiceDistributionChart(this.fromDate, this.toDate);
  
        if (data && Object.keys(data).length > 0) {
          const series = Object.values(data);
          const labels = Object.keys(data);
  
          this.chartOptions = {
            series: series,
            chart: {
              type: 'pie',
              height: 350
            },
            labels: labels,
            title: {
              text: 'Revenue by Service',
              align: 'center'
            },
            dataLabels: {
              enabled: true,
              formatter: function (val: number, opts: any) {
                const value = opts?.w?.config?.series?.[opts.seriesIndex] || 0;
                return `₹${value} (${val.toFixed(1)}%)`;
              }
            },
            tooltip: {
              y: {
                formatter: function (val: number, opts: any) {
                  const total = opts?.w?.config?.series?.reduce?.((a: number, b: number) => a + b, 0) || 1;
                  const percent = ((val / total) * 100).toFixed(1);
                  return `₹${val} (${percent}%)`;
                }
              }
            },
            responsive: [
              {
                breakpoint: 480,
                options: {
                  chart: {
                    height: 300
                  },
                  legend: {
                    position: 'bottom'
                  }
                }
              }
            ]
          };
        } else {
          alert("No service revenue data found for the selected period.");
        }
  
      } catch (error) {
        alert('Error loading service chart: ' + error);
      } finally {
        this.loader.hide();
      }
    }
  }
  

  // async loadPaidVsBalanceChart() {
  //   const { data } = await supabase
  //     .from('registrations')
  //     .select('paid_amount, balance_amount');

  //   let paid = 0, balance = 0;
  //   data?.forEach(row => {
  //     paid += Number(row.paid_amount);
  //     balance += Number(row.balance_amount);
  //   });

  //   this.chartOptions = {
  //     series: [paid, balance],
  //     chart: { type: 'pie' },
  //     labels: ['Paid', 'Balance'],
  //     title: { text: 'Paid vs Balance' }
  //   };
  // }

  // async loadActiveVsInactiveChart() {
  //   const { data } = await supabase
  //     .from('registrations')
  //     .select('end_date');

  //   let active = 0, inactive = 0;
  //   const today = new Date();
  //   data?.forEach(row => {
  //     const end = new Date(row.end_date);
  //     if (end >= today) active++;
  //     else inactive++;
  //   });

  //   this.chartOptions = {
  //     series: [active, inactive],
  //     chart: { type: 'pie' },
  //     labels: ['Active', 'Inactive'],
  //     title: { text: 'Active vs Inactive' }
  //   };
  // }

  // async loadRegistrationTrendChart() {
  //   const { data } = await supabase
  //     .from('registrations')
  //     .select('start_date')
  //     .order('start_date');

  //   const grouped: { [month: string]: number } = {};
  //   data?.forEach(row => {
  //     const month = new Date(row.start_date).toLocaleString('default', { month: 'short', year: 'numeric' });
  //     grouped[month] = (grouped[month] || 0) + 1;
  //   });

  //   this.chartOptions = {
  //     series: [{ name: 'New Registrations', data: Object.values(grouped) }],
  //     chart: { type: 'line', height: 350 },
  //     xaxis: { categories: Object.keys(grouped) },
  //     title: { text: 'Registration Trend' }
  //   };
  // }
}