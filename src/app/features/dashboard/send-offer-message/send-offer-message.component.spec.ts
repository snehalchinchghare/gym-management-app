import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendOfferMessageComponent } from './send-offer-message.component';

describe('SendOfferMessageComponent', () => {
  let component: SendOfferMessageComponent;
  let fixture: ComponentFixture<SendOfferMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendOfferMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SendOfferMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
