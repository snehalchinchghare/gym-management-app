import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../supabase/common.supabase.service';
import dayjs from 'dayjs';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-candidate-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule],
  templateUrl: './candidate-list.component.html',
  styleUrls: ['./candidate-list.component.scss'],
})
export class CandidateListComponent implements OnInit {
  registeredCandidates: any[] = [];
  userDetails: any;
  private readonly ADMIN_KEY = 'adminUser';
  messageTemplates: any[] = [];
  searchText = '';
  currentPage = 1;
  pageSize = 10;
  baseUrl: string = window.location.origin;

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
    private loaderService: LoaderService) {}

  async ngOnInit() {
    const stored = localStorage.getItem(this.ADMIN_KEY);
    this.userDetails = stored ? JSON.parse(stored) : null;
    this.registeredCandidates = await this.supabaseService.fetchCandidatesByUserId(this.userDetails.userId);
    this.registeredCandidates = this.registeredCandidates.sort((a, b) =>
      dayjs(a.end_date).isAfter(dayjs(b.end_date)) ? 1 : -1
    );
    
    this.messageTemplates = await this.supabaseService.getAllTemplates();
  }

  get Math() {
    return Math;
  }

  get filteredCandidates() {
    if (!this.searchText.trim()) return this.registeredCandidates;
  
    const text = this.searchText.toLowerCase();
    return this.registeredCandidates.filter(c =>
      c.full_name?.toLowerCase().includes(text) ||
      c.servicetype_name?.toLowerCase().includes(text) ||
      c.packagetype_name?.toLowerCase().includes(text)
    );
  }
  
  get totalPages(): number {
    return Math.ceil(this.filteredCandidates.length / this.pageSize) || 1;
  }
  
  get paginatedCandidates() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCandidates.slice(start, start + this.pageSize);
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
    let templateKey = this.getStatus(candidate.end_date);
    const template = this.messageTemplates.find(t => t.template_key === templateKey).message;
    const phoneNumber = Number(candidate.mobile);
    const formattedDate = new Date(candidate.end_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const message = template
      .replace(/{{name}}/g, candidate.full_name.trim())
      .replace(/\\n/g, '\n')
      .replace(/{{end_date}}/g, formattedDate)
      .replace(/{{gym_name}}/g, this.userDetails.gymName.trim());

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  async sendLatestReceipt(candidate: any){
    const template = this.messageTemplates.find(t => t.template_key === 'gym_receipt').message;
    const phoneNumber = Number(candidate.mobile);
    const formattedendDate = new Date(candidate.end_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedstartDate = new Date(candidate.start_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const data = {
      candidateId: candidate.candidateid,
      receiptType: 'New',
    };
    const encodedData = btoa(JSON.stringify(data));
    let receiptLink = this.baseUrl + '/receipt/' + encodedData;
    await this.supabaseService.updateReceiptLink(candidate.registrationid, receiptLink);
    const message = template
      .replace(/{{name}}/g, candidate.full_name.trim())
      .replace(/\\n/g, '\n')
      .replace(/{{end_date}}/g, formattedendDate)
      .replace(/{{start_date}}/g, formattedstartDate)
      .replace(/{{gym_name}}/g, this.userDetails.gymName.trim())
      .replace(/{{receiptLink}}/g, receiptLink);

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  renewMembership(candidateid: any){
    try{
      this.loaderService.show();
      const data = {
        candidateId: candidateid,
        isRenew: true,
      };
      const encodedData = btoa(JSON.stringify(data));
      let renewalCandidateLink = '/dashboard/create-candidate?data=' + encodedData;
      this.router.navigate(['/dashboard/create-candidate'], {
        queryParams: {
          data: encodedData
        }
      });
    }
    finally{
      this.loaderService.hide();
    }
  }
}
