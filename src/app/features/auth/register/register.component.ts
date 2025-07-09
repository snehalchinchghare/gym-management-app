import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import  Toast  from 'bootstrap/js/dist/toast';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  constructor(private fb: FormBuilder, private router: Router) {}

  registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    packages: ['',Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

 
  onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { fullName, email, password, confirmPassword } = this.registerForm.value;

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const admin = {
      fullName,
      email,
      password,
    };

    // Save admin to localStorage
    localStorage.setItem('adminUser', JSON.stringify(admin));

    // Show toast
    const toastEl = document.getElementById('registerSuccessToast');
    if (toastEl) {
      const toast = new Toast(toastEl);
      toast.show();
    }

    // Navigate to login after delay
    setTimeout(() => {
      this.router.navigate(['/auth/login']);
    }, 2500);
  }


}
