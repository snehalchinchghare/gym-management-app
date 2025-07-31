import { Component } from '@angular/core';
import { SupabaseService } from '../supabase/common.supabase.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.scss'
})
export class SubscriptionsComponent {
  selectedDurations: { [key: string]: number } = {};
  private readonly ADMIN_KEY = 'adminUser';
  userDetails: any;
  packageList: any[] = [];
  plans: any[] = [];
  features: any[] = [];
  planPrice: any[] = [];

  selectedPackageType: any = null;
  startDate: Date = new Date(); // default to today
  endDate: Date | null = null;

  constructor(
    // private cashfreeService: CashfreeService,
    private supabaseService: SupabaseService,) {
    this.supabaseService.getPackageTypes().then(data => {
      this.packageList = data;
      this.selectedPackageType = this.packageList.find(pkg => pkg.duration_months === 1);
      this.onPackageTypeChange();
    });

    this.supabaseService.getPlans().then(data =>{
      this.plans = data;
    });

    this.supabaseService.getFeatures().then(data =>{
      this.features = data;
    });
    }

  ngOnInit(){
  }

  buyPlan(planType: string, duration: number) {
    const userId = this.getLoggedInUserId(); // Replace with actual user ID logic
    //const planDetails = this.getPlanDetails(planType, duration, userId);

    // if (!planDetails) {
    //   alert('Please select a valid plan');
    //   return;
    // }

    // this.cashfreeService.createOrder(planDetails).subscribe({
    //   next: (res: any) => {
    //     if (res?.paymentLink) {
    //       window.location.href = res.paymentLink;
    //     } else {
    //       alert('Failed to generate payment link');
    //     }
    //   },
    //   error: () => alert('Something went wrong. Try again.')
    // });
  }

  getPlanDetails(planid: number): any {
    return this.plans.find(p => p.planid === planid) || {};
  }

  getFeatures(planid: number): any {
    return this.features.filter(f => f.planid == planid) || {};
  }

  getLoggedInUserId(): number {
    const stored = localStorage.getItem(this.ADMIN_KEY);
    this.userDetails = stored ? JSON.parse(stored) : null;
    return this.userDetails.userId;
  }

  onPackageTypeChange() {
    if (this.selectedPackageType) {
      const months = this.selectedPackageType.duration_months;
      const end = new Date(this.startDate);
      end.setMonth(end.getMonth() + months);
      end.setDate(end.getDate() - 1); // last day of plan
      this.endDate = end;
    }
  }
}
