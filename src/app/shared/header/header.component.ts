import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CandidateRegisterComponent } from '../../features/dashboard/candidate-register/candidate-register.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule,CandidateRegisterComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  adminName: string = '';
  isDashboardRoute: boolean = false;

  constructor(public router: Router) {}

  ngOnInit(): void {
    const admin = localStorage.getItem('adminUser');
    if (admin) {
      const parsed = JSON.parse(admin);
      this.adminName = parsed.fullName?.split('')[0] || '';
    }

    this.router.events.subscribe(() => {
      this.isDashboardRoute = this.router.url.includes('/dashboard');
    });
  }

  logout() {
    localStorage.removeItem('adminUser');
    this.router.navigate(['/login']);
  }
}
