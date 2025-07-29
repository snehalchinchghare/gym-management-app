import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private timeoutId: any;
  private readonly timeoutDuration = 10 * 60 * 1000; // 10 minutes in milliseconds

  constructor(private router: Router, private ngZone: NgZone) {
    this.initListener();
    this.resetTimer();
  }

  initListener() {
    ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      window.addEventListener(event, () => this.resetTimer());
    });
  }

  resetTimer() {
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => this.logout(), this.timeoutDuration);
  }

  logout() {
    console.log('User inactive for 10 minutes. Logging out...');
    // Clear session (customize this part as needed)
    localStorage.clear();
    sessionStorage.clear();
    
    // Navigate to login or landing page
    this.ngZone.run(() => this.router.navigate(['/login']));
  }
}
