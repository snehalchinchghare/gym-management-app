import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { authGuard } from './core/auth.guard';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/auth/auth.routes').then((m) => m.AuthRoutes),
      },
    ],
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivateChild: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.dashboardRoutes
          ),
      },
    ],
  },
  {
    path: '**',
    component: PageNotFoundComponent
  },
];
