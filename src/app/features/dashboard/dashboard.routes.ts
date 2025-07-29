import { Routes } from '@angular/router';
import { CandidateRegisterComponent } from './candidate-register/candidate-register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SendOfferMessageComponent } from './send-offer-message/send-offer-message.component';
import { UpdatePackageComponent } from './update-package/update-package.component';
import { DeleteCandidateComponent } from './delete-candidate/delete-candidate.component';
import { CandidateListComponent } from './candidate-list/candidate-list.component';
import { ReceiptComponent } from './receipt/receipt.component';
import { AboutComponent } from '../about/about.component';
import { CandidateEditComponent } from './candidate-edit/candidate-edit.component';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        redirectTo: 'candidate-list',
        pathMatch: 'full',
      },
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
      {
        path: 'candidate-list',
        component: CandidateListComponent,
      },
      {
        path: 'about',
        component: AboutComponent,
      },
      {
        path: 'candidate-edit',
        component: CandidateEditComponent,
      }
      // ,
      // {
      //   path: 'receipt',
      //   component: ReceiptComponent,
      // },
        // {
        //   path: '',
        //   redirectTo: 'candidate-list',
        //   pathMatch: 'full'
        // }
    ],
  },
];
