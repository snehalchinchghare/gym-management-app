import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ReceiptComponent } from '../dashboard/receipt/receipt.component';
import { PricingComponent } from '../pricing/pricing.component';
import { AboutComponent } from '../about/about.component';
import { SubscriptionsComponent } from '../subscriptions/subscriptions.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'receipt/:data', component: ReceiptComponent, },
  { path: 'contactus', component: AboutComponent, },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutes {
}
