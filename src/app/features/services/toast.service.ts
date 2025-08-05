// src/app/shared/toast.service.ts
import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private messageService: MessageService) {}

  success(summary: string, detail: string = '', life: number = 1000) {
    this.messageService.add({
      severity: 'contrast',
      summary,
      detail,
      life,
      closable: false
    });
  }

  error(summary: string, detail: string = '', life: number = 1500) {
    this.messageService.add({
      severity: 'contrast',
      summary,
      detail,
      life,
      closable: false
    });
  }

  info(summary: string, detail: string = '', life: number = 1000) {
    this.messageService.add({
      severity: 'contrast',
      summary,
      detail,
      life,
      closable: false
    });
  }

  warn(summary: string, detail: string = '', life: number = 1500) {
    this.messageService.add({
      severity: 'contrast',
      summary,
      detail,
      life,
      closable: false
    });
  }

  clear() {
    this.messageService.clear();
  }
}
