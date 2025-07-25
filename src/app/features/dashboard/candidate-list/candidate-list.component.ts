import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../supabase/common.supabase.service';
import dayjs from 'dayjs';

@Component({
  selector: 'app-candidate-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './candidate-list.component.html',
  styleUrls: ['./candidate-list.component.scss'],
})
export class CandidateListComponent implements OnInit {
  registeredCandidates: any[] = [];
  userDetails: any;
  private readonly ADMIN_KEY = 'adminUser';

  constructor(
    private router: Router,
    private supabaseService: SupabaseService) {}

  async ngOnInit() {
    const stored = localStorage.getItem(this.ADMIN_KEY);
    this.userDetails = stored ? JSON.parse(stored) : null;
    this.registeredCandidates = await this.supabaseService.fetchCandidatesByUserId(this.userDetails.userId);
    this.registeredCandidates = this.registeredCandidates.sort((a, b) =>
      dayjs(a.end_date).isAfter(dayjs(b.end_date)) ? 1 : -1
    );
    
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
    // this.router.navigate(['/register']);
  }

  getCellStyle(endDate: string): any {
    if (this.isExpired(endDate)) {
      return { 'background-color': 'red', 'color': 'white' }; // Red
    } else if (this.isEndingSoon(endDate)) {
      return { 'background-color': 'orange', 'color': 'white' }; // Orange
    } else {
      return {};
    }
  }

  getStatus(endDate: string): 'due_passed' | 'due_soon' | 'active' {
    if (this.isExpired(endDate)) {
      return 'due_passed';
    } else if (this.isEndingSoon(endDate)) {
      return 'due_soon';
    } else {
      return 'active';
    }
  }

  isEndingSoon(endDate: string): boolean {
    const today = dayjs();
    const targetDate = dayjs(endDate);
    return targetDate.diff(today, 'day') <= 5;
  }

  isExpired(endDate: string): boolean {
    return dayjs(endDate).isBefore(dayjs(), 'day');
  }

  async remindViaWhatsapp(candidate: any) {
    let messageTemplates = await this.supabaseService.getAllTemplates();
    let templateKey = this.getStatus(candidate.end_date);
    const template = messageTemplates.find(t => t.template_key === templateKey).message;
    const phoneNumber = Number(candidate.mobile);
    const formattedDate = new Date(candidate.end_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const message = template
      .replace(/{{name}}/g, candidate.full_name)
      .replace(/\\n/g, '\n')
      .replace(/{{end_date}}/g, formattedDate)
      .replace(/{{gym_name}}/g, this.userDetails.gymName);

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }
}
