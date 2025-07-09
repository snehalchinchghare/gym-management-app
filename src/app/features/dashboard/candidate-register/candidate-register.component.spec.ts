import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateRegisterComponent } from './candidate-register.component';

describe('CandidateRegisterComponent', () => {
  let component: CandidateRegisterComponent;
  let fixture: ComponentFixture<CandidateRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateRegisterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CandidateRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
