import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'adminToken';
  private readonly ADMIN_KEY = 'adminUser';

  registerAdmin(adminData: { email: string; password: string }): boolean {
    const existingAdmin = localStorage.getItem(this.ADMIN_KEY);
    if (!existingAdmin) {
      localStorage.setItem(this.ADMIN_KEY, JSON.stringify(adminData));
      return true;
    }
    return false; // already registered
  }

  login(email: string, password: string): boolean {
    const admin = localStorage.getItem(this.ADMIN_KEY);
    if (!admin) return false;

    const storedAdmin = JSON.parse(admin);
    if (storedAdmin.email === email && storedAdmin.password === password) {
      const token = btoa(`${email}:${new Date().getTime()}`);
      localStorage.setItem(this.TOKEN_KEY, token);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }
}
