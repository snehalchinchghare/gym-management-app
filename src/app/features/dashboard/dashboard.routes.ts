import { Routes } from '@angular/router';
import { CandidateRegisterComponent } from './candidate-register/candidate-register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SendOfferMessageComponent } from './send-offer-message/send-offer-message.component';
import { UpdateGymComponent as UpdateGymComponent } from './update-gym/update-gym.component';
import { DeleteCandidateComponent } from './delete-candidate/delete-candidate.component';
import { CandidateListComponent } from './candidate-list/candidate-list.component';
import { AboutComponent } from '../about/about.component';
import { CandidateEditComponent } from './candidate-edit/candidate-edit.component';
import { SubscriptionsComponent } from '../subscriptions/subscriptions.component';
import { RevenueComponent } from '../revenue/revenue.component';

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
        path: 'update-gym',
        component: UpdateGymComponent,
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
      },
      {
        path: 'revenue',
        component: RevenueComponent,
      },
      {
        path: 'subscriptions',
        component: SubscriptionsComponent,
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
