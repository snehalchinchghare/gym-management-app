import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  showHeaderfooter: boolean = true;

  constructor(private router: Router){
    let currentUrl = this.router.url;
    if(currentUrl.includes('/receipt')){
      this.showHeaderfooter = false;
    }
    else{
      this.showHeaderfooter = true;
    }
  }

}
