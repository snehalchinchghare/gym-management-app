import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Toast from 'bootstrap/js/dist/toast';
import { SupabaseService } from '../../supabase/common.supabase.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  errorMessage:string | null = null;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private supabaseService: SupabaseService) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['reason'] === 'unauthorized') {
        this.errorMessage = 'Please login to access the requested page.';
      }
    });
  }

  registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    gymName: ['', Validators.required],
    gym_monthly: ['', Validators.required],
    gymCardio_monthly: ['', Validators.required],
    gym_quarterly: ['', Validators.required],
    gymCardio_quarterly: ['', Validators.required],
    gym_halfYearly: ['', Validators.required],
    gymCardio_halfYearly: ['', Validators.required],
    gym_yearly: ['', Validators.required],
    gymCardio_yearly: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const {
      fullName,
      email,
      gymName,
      gym_monthly,
      gymCardio_monthly,
      gym_quarterly,
      gymCardio_quarterly,
      gym_halfYearly,
      gymCardio_halfYearly,
      gym_yearly,
      gymCardio_yearly,
      password,
      confirmPassword,
    } = this.registerForm.value;

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const admin = {
      fullName,
      email,
      gymName,
      gym_monthly,
      gymCardio_monthly,
      gym_quarterly,
      gymCardio_quarterly,
      gym_halfYearly,
      gymCardio_halfYearly,
      gym_yearly,
      gymCardio_yearly,
      password,
    };
    
    const payload = this.mapAdminToInsertPayload(admin);
    console.log(payload);
    this.supabaseService.insertAdminUser(payload);

    // Show toast
    const toastEl = document.getElementById('registerSuccessToast');
    if (toastEl) {
      const toast = new Toast(toastEl);
      toast.show();
    }

    // Navigate to login after delay
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2500);
  }

  mapAdminToInsertPayload(admin: any) {
    const packages = this.supabaseService.getPackageTypes();  
    const services = this.supabaseService.getServiceTypes();
    const packageList = [];
  
    for (const p of packages) {
      for (const s of services) {
        const key = this.getKeyName(p.packagename, s.servicename);
        const price = admin[key];
    
        if (price !== undefined && price !== null && price !== '') {
          packageList.push({
            PackageTypeId: p.packagetypeid,
            ServiceTypeId: s.servicetypeid,
            Price: Number(price)
          });
        }
      }
    }
  
    return {
      p_fullname: admin.fullName,
      p_email: admin.email,
      p_gymname: admin.gymName,
      p_password: admin.password,
      p_created_by: 1,
      p_packages: packageList
    };
  }

  getKeyName(packageName: any, serviceName: any) {
    let serviceKeyPrefix = '';

    switch(serviceName){
      case 'Gym':
        serviceKeyPrefix = 'gym';
        break;
      case 'Gym + Cardio':
        serviceKeyPrefix = 'gymCardio';
        break;
    }

    let packageTypeKey = '';

    switch(packageName){
      case 'Monthly':
        packageTypeKey = 'monthly';
        break;
      case 'Quarterly':
        packageTypeKey = 'quarterly';
        break;
      case 'Half Yearly':
        packageTypeKey = 'halfYearly';
        break;
      case 'Yearly':
        packageTypeKey = 'yearly';
        break;
    }

    return `${serviceKeyPrefix}_${packageTypeKey}`;
  }
}
