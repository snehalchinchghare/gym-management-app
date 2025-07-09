import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Toast from 'bootstrap/js/dist/toast';

@Component({
  selector: 'app-candidate-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './candidate-login.component.html',
  styleUrl: './candidate-login.component.scss'
})
export class CandidateLoginComponent {
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  constructor(private fb: FormBuilder, private router: Router) {}

  onLogin() {
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  const { email, password } = this.loginForm.value;
  const candidates = JSON.parse(localStorage.getItem('candidates') || '[]');

  const candidate = candidates.find(
    (c: any) => c.email === email && c.password === password
  );

  if (candidate) {
    localStorage.setItem('loggedInCandidate', JSON.stringify(candidate));
    this.router.navigate(['/dashboard']);
  } else {
    this.showToast("❌ Candidate not registered or wrong credentials!", 'danger');
  }
}

showToast(message: string, type: 'danger' | 'success') {
  const toastEl = document.getElementById('loginErrorToast');
  const toastBody = document.querySelector('#loginErrorToast .toast-body');

  if (toastEl && toastBody) {
    toastBody.textContent = message;
    toastEl.classList.remove('bg-success', 'bg-danger');
    toastEl.classList.add(`bg-${type}`);
    const toast = new Toast(toastEl);
    toast.show();
  }
}

}
