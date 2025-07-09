import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Toast from 'bootstrap/js/dist/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  constructor(private fb: FormBuilder, private router: Router) {}

  onLogin() {
    const { email, password } = this.loginForm.value;

    const admin = localStorage.getItem('adminUser');
    if (!admin) {
      this.showToast('Admin not registered. Please register first!', 'danger');
      return;
    }

    const storedUser = JSON.parse(admin);
    if (storedUser.email === email && storedUser.password === password) {
      this.router.navigate(['/dashboard']);
    } else {
      this.showToast('Invalid credentials!', 'danger');
    }
  }

  showToast(message: string, type: 'success' | 'danger') {
    const toastContainer = document.getElementById('loginToast');
    const toastBody = document.querySelector('#loginToast .toast-body');

    if (toastContainer && toastBody) {
      toastBody.textContent = message;
      toastContainer.classList.remove('bg-success', 'bg-danger');
      toastContainer.classList.add(`bg-${type}`);

      const toast = new Toast(toastContainer);
      toast.show();
    }
  }
}
