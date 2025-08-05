import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderService } from './features/services/loader.service';
import { InactivityService } from './features/services/inactivity.service';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { VersionUpdateService } from './features/services/version-update.service';
import { BehaviorSubject, interval } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ToastModule, ConfirmDialogModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'gym-management';
  showUpdateModal = false;
  progress$ = new BehaviorSubject<number>(0);
  gifList: string[] = [
    'assets/gym/chest.gif',
    'assets/gym/deadlift.gif',
    'assets/gym/push-ups.gif',
    'assets/gym/treadmill.gif',
    'assets/gym/weightlifting.gif'
  ];
  selectedGif: string = '';

  constructor(public loaderService: LoaderService, private inactivityService: InactivityService, public updateService: VersionUpdateService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(){
    this.selectRandomGif();
  }

  selectRandomGif() {
    const randomIndex = Math.floor(Math.random() * this.gifList.length);
    this.selectedGif = this.gifList[randomIndex];
  }

  // function to test the updates installing UI
//   startFakeUpdate() {
//     this.selectRandomGif();
//     this.showUpdateModal = true;
//     let percent = 0;

//     const progressInterval = interval(80).subscribe(() => {
//       percent += 1.1;
//       if (percent > 100) percent = 100;
//       this.progress$.next(Math.round(percent));

//       if (percent >= 100) {
//         progressInterval.unsubscribe();
//         setTimeout(() => {
//           this.showUpdateModal = false;
//           this.progress$.next(0);
//           alert('Update Installed! (Simulated)');
//         }, 500);
//       }
//     });
//   }

}
