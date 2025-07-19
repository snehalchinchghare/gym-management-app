import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-candidate-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './candidate-list.component.html',
  styleUrls: ['./candidate-list.component.scss'],
})
export class CandidateListComponent implements OnInit {
  registeredCandidates: any[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    const data = localStorage.getItem('candidates');
    this.registeredCandidates = data ? JSON.parse(data) : [];
  }

  trackByEmail(index: number, candidate: any): string {
    return candidate.email;
  }

  deleteCandidate(candidateToDelete: any): void {
    const confirmed = confirm('Are you sure you want to delete this candidate?');
    if (confirmed) {
      this.registeredCandidates = this.registeredCandidates.filter(
        (candidate) => candidate.email !== candidateToDelete.email
      );
      localStorage.setItem('candidates', JSON.stringify(this.registeredCandidates));
    }
  }

  editCandidate(candidate: any): void {
    // Store candidate to be edited in localStorage
    localStorage.setItem('editCandidate', JSON.stringify(candidate));
    // Navigate to registration component where you can pre-fill and update
    this.router.navigate(['/register']);
  }
}
