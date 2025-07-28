import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Toast from 'bootstrap/js/dist/toast';
import { SupabaseService } from '../../supabase/common.supabase.service';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  errorMessage: string | null = null;
  fileError: boolean = false;
  gymLogoBase64: string | null = null;
  isMembershipTableCollapsed: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private loader: LoaderService) { }

  async ngOnInit() {
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
    gymAddress: ['', Validators.required],
    gym_monthly: ['', Validators.required],
    gymCardio_monthly: ['', Validators.required],
    cardio_monthly: ['', Validators.required],
    gym_quarterly: ['', Validators.required],
    gymCardio_quarterly: ['', Validators.required],
    cardio_quarterly: ['', Validators.required],
    gym_halfYearly: ['', Validators.required],
    gymCardio_halfYearly: ['', Validators.required],
    cardio_halfYearly: ['', Validators.required],
    gym_yearly: ['', Validators.required],
    gymCardio_yearly: ['', Validators.required],
    cardio_yearly: ['', Validators.required],
    pt_monthly: ['', Validators.required],
    pt_quarterly: ['', Validators.required],
    pt_halfYearly: ['', Validators.required],
    pt_yearly: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
    gymLogo: ['', Validators.required],
  });

  async onRegister() {
    try {
      this.loader.show();
      if (this.registerForm.invalid) {
        this.registerForm.markAllAsTouched();
        return;
      }

      const {
        fullName,
        email,
        gymName,
        gymAddress,
        gym_monthly,
        gymCardio_monthly,
        cardio_monthly,
        gym_quarterly,
        gymCardio_quarterly,
        cardio_quarterly,
        gym_halfYearly,
        gymCardio_halfYearly,
        cardio_halfYearly,
        gym_yearly,
        gymCardio_yearly,
        cardio_yearly,
        pt_monthly,
        pt_quarterly,
        pt_halfYearly,
        pt_yearly,
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
        gymAddress,
        gym_monthly,
        gymCardio_monthly,
        cardio_monthly,
        gym_quarterly,
        gymCardio_quarterly,
        cardio_quarterly,
        gym_halfYearly,
        gymCardio_halfYearly,
        cardio_halfYearly,
        gym_yearly,
        gymCardio_yearly,
        cardio_yearly,
        pt_monthly,
        pt_quarterly,
        pt_halfYearly,
        pt_yearly,
        password,
        gymLogo: this.gymLogoBase64,
      };

      const payload = await this.mapAdminToInsertPayload(admin);

      this.supabaseService.insertAdminUser(payload);

      const toastEl = document.getElementById('registerSuccessToast');
      if (toastEl) {
        const toast = new Toast(toastEl);
        toast.show();
      }

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2500);
    }
    finally {
      this.loader.hide();
    }

  }

  togglemembershipTable(){
    this.isMembershipTableCollapsed = !this.isMembershipTableCollapsed;
  }

  async mapAdminToInsertPayload(admin: any) {
    const packages = await this.supabaseService.getPackageTypes();
    const services = await this.supabaseService.getServiceTypes();
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
      p_gymaddress: admin.gymAddress,
      p_password: admin.password,
      p_created_by: 1,
      p_gym_logo: admin.gymLogo,
      p_packages: packageList
    };
  }

  getKeyName(packageName: any, serviceName: any) {
    let serviceKeyPrefix = '';

    switch (serviceName) {
      case 'Gym':
        serviceKeyPrefix = 'gym';
        break;
      case 'Gym + Cardio':
        serviceKeyPrefix = 'gymCardio';
        break;
      case 'Cardio':
        serviceKeyPrefix = 'cardio';
        break;
      case 'Personal Trainer':
        serviceKeyPrefix = 'pt';
        break;
    }

    let packageTypeKey = '';

    switch (packageName) {
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

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.fileError = true;
      this.registerForm.patchValue({ gymLogo: null });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      this.gymLogoBase64 = base64String;
    };

    reader.readAsDataURL(file);
  }
}
