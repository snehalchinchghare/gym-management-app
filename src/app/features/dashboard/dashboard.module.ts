import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SendOfferMessageComponent } from './send-offer-message/send-offer-message.component';
import { CandidateRegisterComponent } from './candidate-register/candidate-register.component';



@NgModule({
  declarations: [SendOfferMessageComponent],
  imports: [
    CommonModule,
  ]
})
export class DashboardModule { }
