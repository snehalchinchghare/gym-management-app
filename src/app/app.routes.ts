import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { CandidateLoginComponent } from './features/dashboard/candidate-login/candidate-login.component';
import { CandidateRegisterComponent } from './features/dashboard/candidate-register/candidate-register.component';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'candidate/login', component: CandidateLoginComponent },
  { path: 'candidate/register', component: CandidateRegisterComponent },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then(
        (m) => m.dashboardRoutes
      ),
  },
];
