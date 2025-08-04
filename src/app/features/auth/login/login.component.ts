import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../supabase/common.supabase.service';
import { Toast } from 'bootstrap';
import { LoaderService } from '../../services/loader.service';
import { PwaInstallService } from '../../services/pwa-install.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  private readonly ADMIN_KEY = 'adminUser';
  private readonly TOKEN_KEY = 'adminToken';
  deferredPrompt: any;
  showInstallButton = false;
  installAvailable$ = this.pwaInstallService.installAvailable$;
  showIOSNote: boolean = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private loader: LoaderService,
    private pwaInstallService: PwaInstallService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['reason'] === 'unauthorized') {
        this.showToast('Please login to access the requested page.');
      }
    });
    window.addEventListener('beforeinstallprompt', (event: any) => {
      event.preventDefault();
      this.showInstallButton = true;
      this.deferredPrompt = event;
    });
  
    // iOS note for Safari only (where beforeinstallprompt is NOT available)
    if (this.isIOS() && !this.supportsPWAInstall()) {
      this.showIOSNote = true;
    }
  }

  isIOS(): boolean {
    return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  }
  
  supportsPWAInstall(): boolean {
    return 'onbeforeinstallprompt' in window;
  }

  installApp() {
    this.pwaInstallService.promptInstall().then(success => {
      if (success) {
        console.log('App installed');
      } else {
        console.log('User dismissed install prompt');
      }
    });
  }

  async onLogin() {
    try {
      this.loader.show();
      if (this.loginForm.invalid) return;

      const { email, password } = this.loginForm.value;
      let data = await this.supabaseService.verifyAdminLogin(email, password);
      if (data) {
        const admin = {
          userId: data.userid,
          fullname: data.fullname,
          email: data.email,
          gymName: data.gymname,
          gymAddress: data.gymaddress,
          gymmobile: data.gymmobile,
          packages: data.packages,
        };

        localStorage.setItem(this.ADMIN_KEY, JSON.stringify(admin));
        const token = btoa(`${email}:${new Date().getTime()}`);
        localStorage.setItem(this.TOKEN_KEY, token);

        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = 'Invalid email or password!';
      }
    }
    finally {
      this.loader.hide();
    }
  }

  showToast(message: string) {
    const toastEl = document.getElementById('loginToast');
    const toastBody = toastEl?.querySelector('.toast-body');

    if (toastBody) toastBody.textContent = message;

    const toast = new Toast(toastEl!);
    toast.show();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
