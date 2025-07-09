import { Routes } from '@angular/router';
import { CandidateLoginComponent } from './candidate-login/candidate-login.component';
import { CandidateRegisterComponent } from './candidate-register/candidate-register.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'candidate/login', pathMatch: 'full' },
    ]
  }
];
