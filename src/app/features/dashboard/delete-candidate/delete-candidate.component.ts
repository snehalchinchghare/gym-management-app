import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-delete-candidate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './delete-candidate.component.html',
  styleUrl: './delete-candidate.component.scss'
})
export class DeleteCandidateComponent {
  
}
