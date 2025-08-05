import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Toast from 'bootstrap/js/dist/toast';
import { SupabaseService } from '../../supabase/common.supabase.service';
import { LoaderService } from '../../services/loader.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  errorMessage: string | null = null;
  fileError: boolean = false;
  gymLogoBase64: string | null = null;
  isMembershipTableCollapsed: boolean = false;
  passwordRules = {
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  };
  otpSent: boolean = false;
  otpValidated: boolean = false;
  messageTemplates: any[] = [];
  manuallyEnterOtp: boolean = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private supabaseService: SupabaseService,
    private loader: LoaderService,
    private toast: ToastService) { }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['reason'] === 'unauthorized') {
        this.errorMessage = 'Please login to access the requested page.';
      }
    });
    this.messageTemplates = await this.supabaseService.getAllTemplates();
  }

  registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    gymName: ['', Validators.required],
    gymAddress: ['', Validators.required],
    gymmobile: ['', Validators.required],
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
    emailOtp: [{ value: '', disabled: true }, Validators.required],
    otpExists: [false]
  });

  async onRegister() {
    try {
      this.loader.show();

      if (this.registerForm.invalid) {
        this.registerForm.markAllAsTouched();
        alert('Form is invalid');
        return;
      }

      const {
        fullName,
        email,
        gymName,
        gymAddress,
        gymmobile,
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
      } = this.registerForm.getRawValue();

      if (password !== confirmPassword) {
        alert('Password mismatch');
        return;
      }

      const passwordValid =
        password != null && password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password);

      if (!passwordValid) {
        alert('Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.');
        return;
      }

      const admin = {
        fullName,
        email,
        gymName,
        gymAddress,
        gymmobile,
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
      let res = await this.supabaseService.insertAdminUser(payload);

      if (res.error?.details.includes(`Key (email)=(${payload.p_email}) already exists.`)) {
        this.toast.error('Error', `${payload.p_email} already exists`);
      } else if (res.status != 200) {
        this.toast.error('Error', 'Some error occured');
      }
      else {
        this.toast.success('Success', 'Registered successfully');
        this.router.navigate(['/login']);
      }
    } catch (error) {
      alert('Registration error:' + error);
      throw error;
    } finally {
      this.loader.hide();
    }
  }

  onToggleManualOtp() {
    this.manuallyEnterOtp = !this.manuallyEnterOtp;
    if (this.manuallyEnterOtp) {
      this.otpSent = true;
      this.registerForm.get('emailOtp')?.enable();
    }
    else {
      this.otpSent = false;
      this.registerForm.get('emailOtp')?.disable();
      this.registerForm.patchValue({
        emailOtp: ''
      })
    }
    this.cdr.detectChanges();
  }

  async sendOtp() {
    try {
      this.loader.show();
      const fullName = this.registerForm.get('fullName')?.value;
      const email = this.registerForm.get('email')?.value;
      if (!email || this.registerForm.get('email')?.invalid || !fullName || this.registerForm.get('fullName')?.invalid) {
        this.registerForm.get('email')?.markAsTouched();
        this.registerForm.get('fullName')?.markAsTouched();
        return;
      }

      let otpEmailTemplate = this.messageTemplates.find(m => m.template_key == "otp_email_template");
      const message = otpEmailTemplate.message
        .replace(/{{name}}/g, fullName.trim()).toString();

      let otpResult = await this.supabaseService.sendOtp(email, otpEmailTemplate.title, message);

      if (otpResult) {
        this.registerForm.get('emailOtp')?.enable();
        this.otpSent = true;
      }
      else {
        this.otpSent = false;
      }
    }
    catch (error) {
      alert('send otp error:' + error);
      throw error;
    }
    finally {
      this.loader.hide();
    }
  }

  async validateOtp() {
    try {
      this.loader.show();
      if (!this.otpValidated) {
        const emailOtp = this.registerForm.get('emailOtp')?.value;
        const email = this.registerForm.get('email')?.value;
        if (!emailOtp || this.registerForm.get('emailOtp')?.invalid || !email || this.registerForm.get('email')?.invalid) {
          this.registerForm.get('emailOtp')?.markAsTouched();
          this.registerForm.get('email')?.markAsTouched();
          return;
        }

        let otpResult = await this.supabaseService.validateOtp(email, emailOtp);

        if (otpResult) {
          this.otpValidated = true;
          this.registerForm.get('otpExists')?.disable();
          this.registerForm.get('emailOtp')?.disable();
          this.registerForm.get('email')?.disable();
        }
        else {
          this.otpValidated = false;
          this.registerForm.get('otpExists')?.enable();
          this.registerForm.get('emailOtp')?.enable();
          this.registerForm.get('email')?.enable();
        }
      }
    }
    catch (error) {
      alert('validate otp error:' + error);
      throw error;
    }
    finally {
      this.loader.hide();
    }
  }

  onPasswordInput() {
    const passwordControl = this.registerForm.get('password');
    const password = passwordControl?.value || '';

    // Check rules
    const isValid =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // Store rule status for UI
    this.passwordRules = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    // Set or clear error
    if (!isValid) {
      passwordControl?.setErrors({ passwordInvalid: true });
    } else {
      passwordControl?.setErrors(null);
    }
  }

  togglemembershipTable() {
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
      p_gymmobile: admin.gymmobile,
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

  matchPassword() {
    const passwordControl = this.registerForm.get('password');
    const confirmPasswordControl = this.registerForm.get('confirmPassword');

    if (!passwordControl || !confirmPasswordControl) return;

    const password = passwordControl.value;
    const confirmPassword = confirmPasswordControl.value;

    if (password !== confirmPassword) {
      confirmPasswordControl.setErrors({ mismatch: true });
      confirmPasswordControl.markAsTouched();
    } else {
      if (confirmPasswordControl.hasError('mismatch')) {
        const errors = { ...confirmPasswordControl.errors };
        delete errors['mismatch'];
        const hasOtherErrors = Object.keys(errors).length > 0;
        confirmPasswordControl.setErrors(hasOtherErrors ? errors : null);
      }
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
