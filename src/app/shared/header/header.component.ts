import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../features/supabase/common.supabase.service';

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
  isNavbarCollapsed: boolean = false;

  constructor(
    public router: Router,
    private supabaseService: SupabaseService) {}

  async ngOnInit() {
    const admin = localStorage.getItem(this.ADMIN_KEY);
    if (admin) {
      const parsed = JSON.parse(admin);
      this.adminName = parsed.fullname;
      this.gymName = parsed.gymName;

      this.supabaseService.getGymLogoByUserId(parsed.userId).then(logo => {
        this.gymLogo = logo;
      });
    }
  }

  toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  closeNavbar() {
    this.isNavbarCollapsed = false;
  }

  logout() {
    localStorage.removeItem(this.ADMIN_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/login']);
  }
}
