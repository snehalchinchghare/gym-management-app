import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../supabase/common.supabase.service';
import { LoaderService } from '../../services/loader.service';
import dayjs from 'dayjs';

@Component({
  selector: 'app-candidate-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './candidate-edit.component.html',
  styleUrl: './candidate-edit.component.scss'
})
export class CandidateEditComponent implements OnInit {
  registerForm!: FormGroup;
  packageList: any[] = [];
  serviceList: any[] = [];
  candidateId: any;
  userDetails: any;
  private readonly ADMIN_KEY = 'adminUser';
  registrations: any[] = [];
  messageTemplates: any[] = [];

  filteredRegistrations = [...this.registrations];
  paginatedRegistrations: any[] = [];

  searchTerm = '';
  startDate: string | null = null;
  endDate: string | null = null;

  pageSize = 5;
  currentPage = 1;
  totalPages = 1;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private loader: LoaderService) { }

  async ngOnInit() {    
    const stored = localStorage.getItem(this.ADMIN_KEY);
    this.userDetails = stored ? JSON.parse(stored) : null;

    this.registerForm = this.fb.group({
      fullName: ['abcd', Validators.required],
      email: ['', [Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      dob: ['', Validators.required]
    });

    this.route.queryParams.subscribe(async params => {
      const encoded = params['data'];
      if (encoded) {
        const decoded = JSON.parse(atob(encoded));
        this.candidateId = decoded.candidateId;
  
        try {
          const result = await this.supabaseService.getCandidateWithRegistrations(this.candidateId);
  
          // Patch candidate form
          if (result?.candidate) {
            this.registerForm.patchValue({
              fullName: result.candidate.full_name,
              email: result.candidate.email,
              mobile: result.candidate.mobile,
              dob: result.candidate.dateofbirth
            });
          }
  
          // Transform registrations
          if (result?.registrations) {
            this.registrations = result.registrations.map((r: any) => ({
              startDate: r.start_date,
              endDate: r.end_date,
              package: r.package,
              service: r.service,
              fee: r.total_amount,
              paid: r.paid_amount,
              balance: r.balance_amount,
              receiptUrl: r.receiptlink,
              receipttype: r.receipttype,
            }))
            .sort((a: any, b: any) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
            
            this.filteredRegistrations = [...this.registrations];
            this.updatePaginatedData();
          }
        } catch (err) {
          console.error('Error fetching candidate data:', err);
        }
      }
    });
    this.messageTemplates = await this.supabaseService.getAllTemplates();
  }

  async onRegister() {
    if (this.registerForm.invalid) return;

    const formData = this.registerForm.getRawValue();
    const candidateData = {
      candidateId: this.candidateId,
      userid: this.userDetails.userId,
      fullName: formData.fullName,
      email: formData.email,
      mobile: formData.mobile,
      dob: formData.dob
    }
    
    let result = await this.supabaseService.updateCandidate(candidateData);

    if (result) {
      this.router.navigate(['/dashboard']);
    } else {
      alert("Failed to update candidate.");
    }
  }

  filterRegistrations() {
    let result = [...this.registrations];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        r =>
          r.package.toLowerCase().includes(term) ||
          r.service.toLowerCase().includes(term) ||
          r.receipttype.toString().includes(term)
      );
    }

    if (this.startDate) {
      result = result.filter(r => new Date(r.startDate) >= new Date(this.startDate!));
    }

    if (this.endDate) {
      result = result.filter(r => new Date(r.endDate) <= new Date(this.endDate!));
    }

    this.filteredRegistrations = result;
    this.totalPages = Math.ceil(result.length / this.pageSize);
    this.currentPage = 1;
    this.updatePaginatedData();
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePaginatedData();
  }

  updatePaginatedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedRegistrations = this.filteredRegistrations.slice(start, end);
  }

  async sendMessageReceipt(row: any, source: string) {
    const formData = this.registerForm.getRawValue();
    const template = this.messageTemplates.find(t => t.template_key === 'gym_receipt').message;
    const phoneNumber = Number(formData.mobile);
    const formattedendDate = new Date(row.endDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedstartDate = new Date(row.startDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    let receiptLink = row.receiptUrl;
    const message = template
      .replace(/{{name}}/g, formData.fullName.trim())
      .replace(/\\n/g, '\n')
      .replace(/{{end_date}}/g, formattedendDate)
      .replace(/{{start_date}}/g, formattedstartDate)
      .replace(/{{gym_name}}/g, this.userDetails.gymName.trim())
      .replace(/{{receiptLink}}/g, receiptLink);

    if (source == 'whatsapp') {
      const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
    if (source == 'text') {
      const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
      window.open(smsUrl, '_blank');
    }
  }

  downloadReceipt(candidate: any) {
    if (candidate.receiptUrl) {
      window.open(candidate.receiptUrl, '_blank');
    }
    else {
      alert("No receipt found.");
    }
  }
}
