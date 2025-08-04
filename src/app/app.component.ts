import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderService } from './features/services/loader.service';
import { InactivityService } from './features/services/inactivity.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'gym-management';

  constructor(public loaderService: LoaderService, private inactivityService: InactivityService) {
  }

  ngOnInit(): void {
  }
}
