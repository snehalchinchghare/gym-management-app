import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../supabase/common.supabase.service';
import dayjs from 'dayjs';

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
  private readonly ADMIN_KEY = 'adminUser';

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private supabaseService: SupabaseService) {}

  ngOnInit(): void {
    const today = dayjs().format('YYYY-MM-DD');
    const stored = localStorage.getItem(this.ADMIN_KEY);
    this.userDetails = stored ? JSON.parse(stored) : null;

    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      packageType: [{ value: '', disabled: true }, Validators.required],
      serviceType: ['', Validators.required],
      personalTraining: [0.00, [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]],
      totalAmt: [0.00, [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]],
      paidAmt: [0.00, [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]],
      balanceAmt: [{ value: 0.00, disabled: true }, [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]],
      admissionDate: [today, Validators.required],
      startDate: [today, Validators.required],
      endDate: [{ value: '', disabled: true }, Validators.required]
    });

    this.registerForm.get('totalAmt')?.valueChanges.subscribe(() => this.updateBalance());
    this.registerForm.get('paidAmt')?.valueChanges.subscribe(() => this.updateBalance());

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
    
    // const editData = localStorage.getItem('editCandidate');
    // if (editData) {
    //   const candidate = JSON.parse(editData);
    //   this.registerForm.patchValue({
    //     fullName: candidate.fullName,
    //     email: candidate.email,
    //     gymName: candidate.gymName,
    //     mobile: candidate.mobile
    //   });
    //   localStorage.removeItem('editCandidate');
    // }

    this.supabaseService.loadMasters().then(() => {
      this.packageList = this.supabaseService.getPackageTypes();
      this.serviceList = this.supabaseService.getServiceTypes();
    });
  }

  async onRegister() {
    if (this.registerForm.invalid) return;

    const formData = this.registerForm.getRawValue();
    const candidateData = {
        fullName: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        userId: this.userDetails.userId,
        createdBy: this.userDetails.userId,
        packageTypeId: Number(formData.packageType),
        serviceTypeId: Number(formData.serviceType),
        personalTraining: formData.personalTraining,
        totalAmt: formData.totalAmt,
        paidAmt: formData.paidAmt,
        balanceAmt: Number(formData.balanceAmt),
        admissionDate: formData.admissionDate,
        startDate: formData.startDate,
        endDate: formData.startDate
    }
    var result = await this.supabaseService.registerCandidate(candidateData);
    if (result.success) {
      this.router.navigate(['/dashboard']);
    } else {
      alert(result.message);
    }

    // let candidates = JSON.parse(localStorage.getItem('candidates') || '[]');
    // const existingIndex = candidates.findIndex((c: any) => c.email === formData.email);

    // if (existingIndex !== -1) {
    //   candidates[existingIndex] = formData;
    // } else {
    //   candidates.push(formData);
    // }

    // localStorage.setItem('candidates', JSON.stringify(candidates));
    // this.router.navigate(['/dashboard']);
  }

  updateBalance(): void {
    const total = parseFloat(this.registerForm.get('totalAmt')?.value) || 0;
    const paid = parseFloat(this.registerForm.get('paidAmt')?.value) || 0;
    const balance = total - paid;
    this.registerForm.patchValue({ balanceAmt: balance.toFixed(2) });
  }

  calculateEndDate(): void {
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

  setTotalAmount(): void {
    const selectedPackageId = this.registerForm.get('packageType')?.value;
    const selectedServiceId = this.registerForm.get('serviceType')?.value;
    if (!this.userDetails || !selectedPackageId) return;
    
    const packageInfo = this.userDetails.packages.find(
      (p: any) => p.packagetypeid === +selectedPackageId && p.servicetypeid === +selectedServiceId
    );
  
    if (packageInfo) {
      this.registerForm.patchValue({ totalAmt: packageInfo.price });
    } else {
      this.registerForm.patchValue({ totalAmt: '' });
    }
  }
}

