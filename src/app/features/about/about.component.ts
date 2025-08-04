import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {
  showBackButtons: boolean = false;

  constructor(
    private router: Router,
  ){
  }

  ngOnInit(): void {
    if(this.router.url.includes('/dashboard/about')){
      this.showBackButtons = true;
    }
  }
}
