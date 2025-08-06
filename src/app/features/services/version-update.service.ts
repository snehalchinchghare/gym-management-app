import { Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { BehaviorSubject, interval } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VersionUpdateService {
  isUpdating$ = new BehaviorSubject<boolean>(false);
  progress$ = new BehaviorSubject<number>(0);

  constructor(private swUpdate: SwUpdate) {}

  checkAndUpdateApp(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.checkForUpdate().then((hasUpdate) => {
        if (hasUpdate) {
          this.listenForUpdate();
        }
      });
    }
  }

  private listenForUpdate(): void {
    this.swUpdate.versionUpdates.subscribe(event => {
      if (event.type === 'VERSION_READY') {
        const alreadyReloaded = sessionStorage.getItem('alreadyReloaded');
        if (alreadyReloaded === 'true') {
          return; // Don't reload again
        }
  
        // Set the reload flag
        sessionStorage.setItem('alreadyReloaded', 'true');
  
        this.isUpdating$.next(true);
        let percent = 0;
  
        const progressInterval = interval(200).subscribe(() => {
          percent += 1.1;
          this.progress$.next(percent);
  
          if (percent >= 100) {
            progressInterval.unsubscribe();
  
            this.swUpdate.activateUpdate().then(() => {
              location.reload(); // Refresh the app ONCE
            });
          }
        });
      }
    });
  }
  
}
