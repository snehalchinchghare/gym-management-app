import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderService } from './features/services/loader.service';
import { InactivityService } from './features/services/inactivity.service';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'gym-management';

  constructor(public loaderService: LoaderService, private inactivityService: InactivityService, private swUpdate: SwUpdate) {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe(() => {
        if (confirm('A new version is available. Load it now?')) {
          window.location.reload();
        }
      });
    }
  }

  ngOnInit(): void {
  }
}
