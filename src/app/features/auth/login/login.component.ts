import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { CommonModule } from '@angular/common';
// import { AuthService } from 'src/app/core/services/auth.service';
// import { ToastService } from 'src/app/shared/services/toast.service'; // optional for showing messages

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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    // private toastService: ToastService // Optional
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['reason'] === 'unauthorized') {
        this.errorMessage = 'Please login to access the requested page.';
      }
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;

    const isValid = this.authService.login(email, password);
    if (isValid) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Invalid email or password!';
      // this.toastService?.show('Invalid credentials!', 'danger');
    }
  }
}
