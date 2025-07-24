import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../supabase/common.supabase.service';
import { Toast } from 'bootstrap';

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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
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
  }


  async onLogin() {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    let data = await this.supabaseService.verifyAdminLogin(email, password);
    if (data) {
      const admin = {
        fullname: data.fullname,
        email: data.email,
        gymName: data.gymname,
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

  showToast(message: string) {
    const toastEl = document.getElementById('loginToast');
    const toastBody = toastEl?.querySelector('.toast-body');
    
    if (toastBody) toastBody.textContent = message;

    const toast = new Toast(toastEl!);
    toast.show();
  }

}
