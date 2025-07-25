import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  adminName: string = '';
  gymName: string = '';
  gymLogo: string = '';
  isDashboardRoute: boolean = false;
  private readonly ADMIN_KEY = 'adminUser';
  private readonly TOKEN_KEY = 'adminToken';

  constructor(public router: Router) {}

  ngOnInit(): void {
    const admin = localStorage.getItem(this.ADMIN_KEY);
    if (admin) {
      console.log(admin);
      const parsed = JSON.parse(admin);
      this.adminName = parsed.fullname;
      this.gymName = parsed.gymName;
      this.gymLogo = parsed.gymLogo;
    }

    // this.router.events.subscribe(() => {
    //   this.isDashboardRoute = this.router.url.includes('/dashboard');
    // });
  }

  logout() {
    localStorage.removeItem(this.ADMIN_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/login']);
  }
}
