import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  login(email: string, password: string): boolean {
    if (email === 'admin@gmail.com' && password === 'admin123') {
      localStorage.setItem('adminLoggedIn', 'true');
      return true;
    }
    return false;
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('adminLoggedIn') === 'true';
  }

  logout(): void {
    localStorage.removeItem('adminLoggedIn');
  }
}
