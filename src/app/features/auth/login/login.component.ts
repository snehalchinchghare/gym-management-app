import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../supabase/common.supabase.service';
import { Toast } from 'bootstrap';
import { LoaderService } from '../../services/loader.service';

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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private loader: LoaderService,
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
    this.checkIsMobile();
  }

  // Detect 'beforeinstallprompt' event
  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(event: Event) {
    event.preventDefault();
    this.deferredPrompt = event;
    this.showInstallButton = this.isMobile(); // Show only on mobile
  }

  installApp() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((result: any) => {
        if (result.outcome === 'accepted') {
        }
        this.deferredPrompt = null;
        this.showInstallButton = false;
      });
    }
  }

  // Check if user is on a mobile device
  isMobile(): boolean {
    return /Mobi|Android|iPhone/i.test(navigator.userAgent);
  }

  checkIsMobile() {
    this.showInstallButton = this.isMobile();
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
}
