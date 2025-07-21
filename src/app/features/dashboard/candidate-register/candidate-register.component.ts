import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-candidate-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './candidate-register.component.html',
  styleUrls: ['./candidate-register.component.scss']
})
export class CandidateRegisterComponent implements OnInit {
  registerForm!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gymName: ['', Validators.required],
      mobile: ['', Validators.required]
    });

    const editData = localStorage.getItem('editCandidate');
    if (editData) {
      const candidate = JSON.parse(editData);
      this.registerForm.patchValue({
        fullName: candidate.fullName,
        email: candidate.email,
        gymName: candidate.gymName,
        mobile: candidate.mobile
      });
      localStorage.removeItem('editCandidate');
    }
  }

  onRegister(): void {
    if (this.registerForm.invalid) return;

    const formData = this.registerForm.value;

    let candidates = JSON.parse(localStorage.getItem('candidates') || '[]');
    const existingIndex = candidates.findIndex((c: any) => c.email === formData.email);

    if (existingIndex !== -1) {
      candidates[existingIndex] = formData;
    } else {
      candidates.push(formData);
    }

    localStorage.setItem('candidates', JSON.stringify(candidates));
    this.router.navigate(['/dashboard']);
  }
}
