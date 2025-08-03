import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../supabase/common.supabase.service';
import dayjs from 'dayjs';
import { LoaderService } from '../../services/loader.service';
import { initZone } from 'zone.js/lib/zone-impl';

@Component({
  selector: 'app-candidate-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './candidate-register.component.html',
  styleUrls: ['./candidate-register.component.scss']
})
export class CandidateRegisterComponent implements OnInit {
  registerForm!: FormGroup;
  packageList: any[] = [];
  serviceList: any[] = [];
  userDetails: any;
  gymLogo: string = '';
  isRenew: boolean = false;
  candidateId: number | null = null;
  private readonly ADMIN_KEY = 'adminUser';
  isBalancePayment: boolean = false;
  initialBalanceAmt: number = 0;
  initialTotalAmt: number = 0;
  isManualTotal: boolean = false;
  baseUrl: string = window.location.origin;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private loader: LoaderService) { }

  async ngOnInit() {
    const today = dayjs().format('YYYY-MM-DD');
    const stored = localStorage.getItem(this.ADMIN_KEY);
    this.userDetails = stored ? JSON.parse(stored) : null;
    this.supabaseService.getGymLogoByUserId(this.userDetails.userId).then(logo => {
      this.gymLogo = logo;
    });

    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      dob: ['', Validators.required],
      packageType: [{ value: '', disabled: true }, Validators.required],
      serviceType: ['', Validators.required],
      admissionFee: [0.00, [Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]],
      totalAmt: [0.00, [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]],
      paidAmt: [0.00, [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]],
      balanceAmt: [{ value: 0.00, disabled: true }, [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]],
      admissionDate: [today, Validators.required],
      startDate: [today, Validators.required],
      endDate: [{ value: '', disabled: true }, Validators.required],
      isManual: [false],
    });

    this.packageList = await this.supabaseService.getPackageTypes();
    this.serviceList = await this.supabaseService.getServiceTypes();

    this.route.queryParams.subscribe(params => {
      const encoded = params['data'];
      if (encoded) {
        const decoded = JSON.parse(atob(encoded));
        this.candidateId = decoded.candidateId;
        this.isRenew = decoded.isRenew;
        this.isBalancePayment = decoded.isBalancePayment;
        if (this.isRenew || this.isBalancePayment) {
          this.loader.show();
          this.supabaseService.getCandidateForRenewal(this.candidateId).then(result => {
            if (result) {
              const newStartDate = dayjs(result.end_date).add(1, 'day').format('YYYY-MM-DD');
              const selectedPackage = this.packageList.find(p => p.packagetypeid === +result.packagetypeid);
              const packageMonthsMap: { [key: string]: number } = {
                'monthly': 1,
                'quarterly': 3,
                'half yearly': 6,
                'yearly': 12
              };
              const monthsToAdd = packageMonthsMap[selectedPackage.packagename.toLowerCase()];
              const newEndDate = dayjs(newStartDate).add(monthsToAdd, 'month').format('YYYY-MM-DD');

              this.registerForm.patchValue({
                fullName: result.full_name,
                email: result.email,
                mobile: result.mobile,
                dob: result.dateofbirth,
                packageType: result.packagetypeid,
                serviceType: result.servicetypeid,
                admissionFee: result.admissionfee,
                totalAmt: result.total_amount - result.admissionfee,
                balanceAmt: result.balance_amount,
                admissionDate: result.admission_date,
                startDate: newStartDate,
                endDate: newEndDate
              });
              this.initialBalanceAmt = result.balance_amount;
              this.initialTotalAmt = result.total_amount;
              this.registerForm.get('fullName')?.disable();
              this.registerForm.get('email')?.disable();
              this.registerForm.get('mobile')?.disable();
              this.registerForm.get('dob')?.disable();
              this.registerForm.get('admissionDate')?.disable();
              this.registerForm.get('admissionFee')?.disable();
              if (this.isBalancePayment) {
                this.registerForm.get('serviceType')?.disable();
                this.registerForm.get('packageType')?.disable();
                this.registerForm.get('totalAmt')?.disable();
                this.registerForm.get('startDate')?.disable();
                this.registerForm.get('isManual')?.disable();
              }
            }
          });

          this.loader.hide();
        }
      }
    });

    this.registerForm.get('totalAmt')?.disable();
    this.registerForm.get('isManual')?.valueChanges.subscribe(() => this.updateManualField());
    this.registerForm.get('totalAmt')?.valueChanges.subscribe(() => this.updateBalance('totalAmt'));
    this.registerForm.get('paidAmt')?.valueChanges.subscribe(() => this.updateBalance('paidAmt'));

    this.registerForm.get('serviceType')?.valueChanges.subscribe(serviceTypeId => {
      if (serviceTypeId) {
        this.registerForm.get('packageType')?.enable();
      } else {
        this.registerForm.get('packageType')?.disable();
        this.registerForm.patchValue({ totalAmt: '' });
        this.registerForm.patchValue({ package: '' });
      }
    });

    this.registerForm.get('packageType')?.valueChanges.subscribe(val => {
      this.calculateEndDate();
      this.setTotalAmount();
    });
    this.registerForm.get('startDate')?.valueChanges.subscribe(() => this.calculateEndDate());
    this.registerForm.get('admissionFee')?.valueChanges.subscribe(() => this.setTotalAmount());
  }

  async onRegister() {
    if (this.registerForm.invalid) {
      return;
    }
  
    try {
      this.loader.show();
  
      const formData = this.registerForm.getRawValue();
      const candidateData = {
        fullName: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        dob: formData.dob,
        userId: this.userDetails.userId,
        createdBy: this.userDetails.userId,
        packageTypeId: Number(formData.packageType),
        serviceTypeId: Number(formData.serviceType),
        admissionFee: formData.admissionFee,
        totalAmt: formData.totalAmt,
        paidAmt: formData.paidAmt,
        balanceAmt: Number(formData.balanceAmt),
        admissionDate: formData.admissionDate,
        startDate: formData.startDate,
        endDate: formData.endDate
      };
  
      let result: { candidateid: any; success: boolean; message: string };
      if (this.isRenew) {
        result = await this.supabaseService.renewMembership(this.candidateId, candidateData, 'Renewed');
      } else if (this.isBalancePayment) {
        result = await this.supabaseService.renewMembership(this.candidateId, candidateData, 'BalancePayment');
      } else {
        result = await this.supabaseService.registerCandidate(candidateData);
      }
  
      if (result.success) {
        const data = {
          candidateId: result.candidateid[0].out_candidateid
        };
        const encodedData = btoa(JSON.stringify(data));
        const receiptLink = this.baseUrl + '/receipt/' + encodedData;
        await this.supabaseService.updateReceiptLink(result.candidateid[0].out_registrationid, receiptLink);
        this.router.navigate(['/dashboard']);
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("Something went wrong during registration.");
    } finally {
      this.loader.hide();
    }
  }
  

  updateManualField() {
    if (!this.isBalancePayment) {
      this.isManualTotal = this.registerForm.get('isManual')?.value;
      if (this.isManualTotal) {
        this.registerForm.patchValue({ totalAmt: 0 });
        this.registerForm.patchValue({ admissionFee: 0 });
        this.registerForm.get('admissionFee')?.disable();
        this.registerForm.get('totalAmt')?.enable();
      }
      else {
        this.setTotalAmount();
        this.registerForm.get('admissionFee')?.enable();
        this.registerForm.get('totalAmt')?.disable();
      }
    }
  }

  updateBalance(eventType: any): void {
    const total = parseFloat(this.registerForm.get('totalAmt')?.value) || 0;
    const paid = parseFloat(this.registerForm.get('paidAmt')?.value) || 0;

    if (!this.isBalancePayment) {
      const balance = total - paid;
      this.registerForm.patchValue({ balanceAmt: balance.toFixed(2) });
    }
    else {
      if (!isNaN(paid)) {
        const newBalance = this.initialBalanceAmt - paid;
        this.registerForm.patchValue(
          {
            balanceAmt: newBalance
          },
          { emitEvent: false }
        );
      } else {
        // Reset to original if input is cleared or invalid
        this.registerForm.patchValue(
          {
            balanceAmt: this.initialBalanceAmt
          },
          { emitEvent: false }
        );
      }
    }
  }

  calculateEndDate(): void {
    if (!this.isBalancePayment) {
      const startDateValue = this.registerForm.get('startDate')?.value;
      const selectedPackageId = this.registerForm.get('packageType')?.value;

      if (!startDateValue || !selectedPackageId) return;

      const selectedPackage = this.packageList.find(p => p.packagetypeid === +selectedPackageId);
      if (!selectedPackage) return;

      const packageMonthsMap: { [key: string]: number } = {
        'monthly': 1,
        'quarterly': 3,
        'half yearly': 6,
        'yearly': 12
      };

      const monthsToAdd = packageMonthsMap[selectedPackage.packagename.toLowerCase()];
      if (!monthsToAdd) return;

      const newEndDate = dayjs(startDateValue).add(monthsToAdd, 'month').format('YYYY-MM-DD');
      this.registerForm.patchValue({ endDate: newEndDate });
    }
  }

  setTotalAmount(): void {
    if (!this.isBalancePayment && !this.isManualTotal) {
      const admissionFee = this.registerForm.get('admissionFee')?.value;
      const selectedPackageId = this.registerForm.get('packageType')?.value;
      const selectedServiceId = this.registerForm.get('serviceType')?.value;
      if (!this.userDetails || !selectedPackageId) return;

      const packageInfo = this.userDetails.packages.find(
        (p: any) => p.packagetypeid === +selectedPackageId && p.servicetypeid === +selectedServiceId
      );

      if (packageInfo) {
        this.registerForm.patchValue({ totalAmt: packageInfo.price + admissionFee });
      } else {
        this.registerForm.patchValue({ totalAmt: '' });
      }
    }
  }
}

