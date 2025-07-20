import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SupabaseService } from './features/supabase/common.supabase.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'gym-management';

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit(): void {
    this.supabaseService.loadMasters().then(() => {
      console.log('Masters loaded:', this.supabaseService.masters);
    });
  }
}
