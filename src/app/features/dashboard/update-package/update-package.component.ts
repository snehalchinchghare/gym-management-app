import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule  } from '@angular/forms';
import { SupabaseService } from '../../supabase/common.supabase.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from '../../services/loader.service';
import { Toast } from 'bootstrap';

@Component({
  selector: 'app-update-package',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './update-package.component.html',
  styleUrl: './update-package.component.scss'
})
export class UpdatePackageComponent {
  errorMessage: string | null = null;
  fileError: boolean = false;
  gymLogoBase64: string | null = null;
  private readonly ADMIN_KEY = 'adminUser';
  private readonly TOKEN_KEY = 'adminToken';
  userDetails: any;
  isMembershipTableCollapsed: boolean = false;
  packageMaster: any[] = [];
  serviceMaster: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private loader: LoaderService) { }

  async ngOnInit() {
    this.packageMaster = await this.supabaseService.getPackageTypes();
    this.serviceMaster = await this.supabaseService.getServiceTypes();
    this.route.queryParams.subscribe(params => {
      if (params['reason'] === 'unauthorized') {
        this.errorMessage = 'Please login to access the requested page.';
      }
    });

    const stored = localStorage.getItem(this.ADMIN_KEY);
    this.userDetails = stored ? JSON.parse(stored) : null;
      this.supabaseService.getGymLogoByUserId(this.userDetails.userId).then(logo => {
      this.loader.show();
        this.gymLogoBase64 = logo;
        this.registerForm.patchValue({
          fullName: this.userDetails.fullname,
          email: this.userDetails.email,
          gymName: this.userDetails.gymName,
          gymmobile: this.userDetails.gymmobile,
          gymAddress: this.userDetails.gymAddress
        });
        this.loader.hide();    
      });
      this.populatePackages(this.userDetails.packages);
  }

  populatePackages(packages: any[]) {
        for (const pkg of packages) {
          const packageMatch = this.packageMaster.find(p => p.packagetypeid == pkg.packagetypeid);
          const serviceMatch = this.serviceMaster.find(p => p.servicetypeid == pkg.servicetypeid);
          if (!packageMatch || !serviceMatch) {
            continue;
          }
          const packType = packageMatch.packagename;
          const servType = serviceMatch.servicename;
          if (packType && servType) {
            const controlName = this.getKeyName(packType, servType);
            if (this.registerForm.get(controlName)) {
              this.registerForm.get(controlName)?.setValue(pkg.price);
            }
          }
        }
  }

  togglemembershipTable(){
    this.isMembershipTableCollapsed = !this.isMembershipTableCollapsed;
  }

  registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    gymName: ['', Validators.required],
    gymmobile: ['', Validators.required],
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
    gymLogo: [''],
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
        gymmobile,
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
      } = this.registerForm.value;
      
      let userid = this.userDetails.userId;

      const admin = {
        userid,
        fullName,
        email,
        gymmobile,
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
        gymLogo: this.gymLogoBase64,
      };

      const payload = await this.mapAdminToInsertPayload(admin);
      this.supabaseService.updateAdminUser(payload);

      const toastEl = document.getElementById('registerSuccessToast');
      if (toastEl) {
        const toast = new Toast(toastEl);
        toast.show();
      }


      const loggedInUser = {
        userId: payload.p_user_id,
        fullname: payload.p_fullname,
        email: payload.p_email,
        gymName: payload.p_gymname,
        gymAddress: payload.p_gymaddress,
        gymmobile: payload.p_mobile,
        packages: payload.p_packages,
      };

      localStorage.setItem(this.ADMIN_KEY, JSON.stringify(loggedInUser));
      localStorage.removeItem(this.TOKEN_KEY);
      const token = btoa(`${email}:${new Date().getTime()}`);
      localStorage.setItem(this.TOKEN_KEY, token);

      this.router.navigate(['/dashboard']);
    }
    finally {
      this.loader.hide();
    }

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
            packagetypeid: p.packagetypeid,
            servicetypeid: s.servicetypeid,
            price: Number(price)
          });
        }
      }
    }

    return {
      p_user_id: admin.userid,
      p_fullname: admin.fullName,
      p_email: admin.email,
      p_gymname: admin.gymName,
      p_mobile: admin.gymmobile,
      p_gymaddress: admin.gymAddress,
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
