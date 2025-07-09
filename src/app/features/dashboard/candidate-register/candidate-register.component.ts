import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-candidate-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './candidate-register.component.html',
  styleUrl: './candidate-register.component.scss',
})
export class CandidateRegisterComponent {
  registerForm = this.fb.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      gymName: ['', [Validators.required]],
      mobile: [
        '',
        [
          Validators.required
        ],
      ],
      password: [
        '',
        [
          Validators.required
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: (form) => {
        const pwd = form.get('password')?.value;
        const confirm = form.get('confirmPassword')?.value;
        return pwd === confirm ? null : { mismatch: true };
      },
    }
  );

  constructor(private fb: FormBuilder, private router: Router) {}

  onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const form = this.registerForm.value;
    const candidates = JSON.parse(localStorage.getItem('candidates') || '[]');

    const alreadyExists = candidates.some((c: any) => c.email === form.email);
    if (alreadyExists) {
      alert('Email already registered!');
      return;
    }

    candidates.push({
      fullName: form.fullName,
      email: form.email,
      mobile: form.mobile,
      gymName: form.gymName,
      password: form.password,
    });

    localStorage.setItem('candidates', JSON.stringify(candidates));
    alert('Candidate registered successfully!');
    this.router.navigate(['/dashboard/candidate/login']);
  }
}
