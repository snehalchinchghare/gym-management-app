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
  errorMessage: string | null = null;
  fileError: boolean = false;
  gymLogoBase64: string | null = null;
  isAccordionOpen = false; // ✅ Toggle control for Packages

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
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

  toggleAccordion() {
    this.isAccordionOpen = !this.isAccordionOpen;
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const form = this.registerForm.value;
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const payload = this.mapAdminToInsertPayload({
      ...form,
      gymLogo: this.gymLogoBase64,
    });
    console.log(payload);
    this.supabaseService.insertAdminUser(payload);

    const toastEl = document.getElementById('registerToast');
    if (toastEl) {
      const toast = new Toast(toastEl);
      toast.show();
    }

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
            Price: Number(price),
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
      p_gym_logo: admin.gymLogo,
      p_packages: packageList,
    };
  }

  getKeyName(packageName: any, serviceName: any) {
    const servicePrefixMap: Record<string, string> = {
      'Gym': 'gym',
      'Gym + Cardio': 'gymCardio',
      'Cardio': 'cardio',
      'Personal Trainer': 'pt',
    };

    const packageSuffixMap: Record<string, string> = {
      'Monthly': 'monthly',
      'Quarterly': 'quarterly',
      'Half Yearly': 'halfYearly',
      'Yearly': 'yearly',
    };

    return `${servicePrefixMap[serviceName]}_${packageSuffixMap[packageName]}`;
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
      this.gymLogoBase64 = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}
