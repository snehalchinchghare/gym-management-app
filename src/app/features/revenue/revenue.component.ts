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
import { window } from 'rxjs';

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
    { id: 'paidVsBalance', label: 'Paid vs Balance' },
    { id: 'activeVsInactive', label: 'Active vs Inactive' },
    { id: 'registrationTrend', label: 'New Registrations Over Time' },
  ];

  constructor(private supabaseService: SupabaseService){
    
  }

  async ngOnInit() {
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
      // case 'serviceDistribution':
      //   await this.loadServiceDistributionChart();
      //   break;
      // case 'paidVsBalance':
      //   await this.loadPaidVsBalanceChart();
      //   break;
      // case 'activeVsInactive':
      //   await this.loadActiveVsInactiveChart();
      //   break;
      // case 'registrationTrend':
      //   await this.loadRegistrationTrendChart();
      //   break;
    }
  }

  async loadMonthlyRevenueChart() {
    this.supabaseService.loadMonthlyRevenueChart().then(data =>{
      this.chartOptions = {
        series: [{
          name: 'Revenue',
          data: Object.values(data)
        }],
        chart: { type: 'bar', height: 350 },
        xaxis: { categories: Object.keys(data) },
        title: { text: 'Monthly Revenue' }
      };
    });
  }

  async loadPackageDistributionChart() {
    this.supabaseService.loadPackageDistributionChart().then(data =>{
      this.chartOptions = {
        series: [{
          name: 'Revenue',
          data: Object.values(data)
        }],
        chart: { type: 'bar', height: 350 },
        xaxis: { categories: Object.keys(data) },
        labels: Object.keys(data),
        title: { text: 'Revenue by Package' }
      };
    });
  }

  // async loadServiceDistributionChart() {
  //   const { data } = await supabase
  //     .from('registrations')
  //     .select('servicetypeid, paid_amount');

  //   const grouped: { [service: string]: number } = {};
  //   data?.forEach(row => {
  //     const key = `Service ${row.servicetypeid}`;
  //     grouped[key] = (grouped[key] || 0) + Number(row.paid_amount);
  //   });

  //   this.chartOptions = {
  //     series: Object.values(grouped),
  //     chart: { type: 'donut' },
  //     labels: Object.keys(grouped),
  //     title: { text: 'Revenue by Service' }
  //   };
  // }

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