import { Injectable } from '@angular/core';

export interface Candidate {
  fullName: string;
  email: string;
  gymName: string;
  mobile: string;
}

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
private storageKey = 'candidates';

  getCandidates(): Candidate[] {
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  }

  addCandidate(candidate: Candidate): void {
    const candidates = this.getCandidates();
    candidates.push(candidate);
    localStorage.setItem(this.storageKey, JSON.stringify(candidates));
  }

  isEmailRegistered(email: string): boolean {
    return this.getCandidates().some(c => c.email === email);
  }

  updateCandidate(updatedCandidate: any): void {
  const candidates = this.getCandidates();
  const updatedCandidates = candidates.map((candidate: any) =>
    candidate.email === updatedCandidate.email ? updatedCandidate : candidate
  );
  localStorage.setItem('registeredCandidates', JSON.stringify(updatedCandidates));
}
}
