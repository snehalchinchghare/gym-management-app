import { Routes } from '@angular/router';
import { CandidateRegisterComponent } from './candidate-register/candidate-register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SendOfferMessageComponent } from './send-offer-message/send-offer-message.component';
import { UpdatePackageComponent } from './update-package/update-package.component';
import { DeleteCandidateComponent } from './delete-candidate/delete-candidate.component';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: 'create-candidate',
        component: CandidateRegisterComponent,
      },
      {
        path: 'delete-candidate',
        component: DeleteCandidateComponent,
      },
      {
        path: 'update-package',
        component: UpdatePackageComponent,
      },
      {
        path: 'send-offer',
        component: SendOfferMessageComponent,
      },
      //   {
      //     path: '',
      //     redirectTo: 'create-candidate',
      //     pathMatch: 'full'
      //   }
    ],
  },
];
