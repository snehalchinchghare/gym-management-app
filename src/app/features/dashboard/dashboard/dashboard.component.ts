import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import Toast from 'bootstrap/js/dist/toast';
import { CandidateListComponent } from '../candidate-list/candidate-list.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule,CandidateListComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  adminName: string = '';

  constructor(public router: Router) {}

  ngOnInit(): void {
    const admin = localStorage.getItem('adminUser');
    if (admin) {
      const parsed = JSON.parse(admin);
      this.adminName = parsed.fullName || 'Admin';
    }
  }

  logout() {
    localStorage.removeItem('adminUser');
    this.showToast('You have been logged out.', 'success');
    setTimeout(() => {
      this.router.navigate(['/auth/login']);
    }, 2000);
  }

  showToast(message: string, type: 'success' | 'danger') {
    const toastEl = document.getElementById('dashboardToast');
    const toastBody = document.querySelector('#dashboardToast .toast-body');

    if (toastEl && toastBody) {
      toastBody.textContent = message;
      toastEl.classList.remove('bg-success', 'bg-danger');
      toastEl.classList.add(`bg-${type}`);
      const toast = new Toast(toastEl);
      toast.show();
    }
  }
}
