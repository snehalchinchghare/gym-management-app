import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private deferredPrompt: any;
  public installAvailable$ = new BehaviorSubject<boolean>(false);

  constructor() {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferredPrompt = event;
      this.installAvailable$.next(true);
    });
  }

  promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) return Promise.resolve(false);

    return this.deferredPrompt.prompt().then((choiceResult: any) => {
      const accepted = choiceResult.outcome === 'accepted';
      this.deferredPrompt = null;
      this.installAvailable$.next(false);
      return accepted;
    });
  }
}
