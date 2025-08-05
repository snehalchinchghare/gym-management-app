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
        this.isUpdating$.next(true);

        // Simulate progress (since Angular does not expose actual progress)
        let percent = 0;
        const progressInterval = interval(100).subscribe(() => {
          percent += 5;
          this.progress$.next(percent);

          if (percent >= 100) {
            progressInterval.unsubscribe();
            this.swUpdate.activateUpdate().then(() => {
              location.reload();
            });
          }
        });
      }
    });
  }
}
