import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class DialogService {

    constructor(private confirmationService: ConfirmationService) { }

    /**
     * Generic confirm dialog
     */
    confirm(message: string, onOk?: () => void) {
        this.confirmationService.confirm({
            message,
            header: 'Confirm',
            icon: 'pi pi-question-circle',
            acceptLabel: 'OK',
            accept: () => onOk?.()
        });
    }

    /**
     * Warning dialog with triangle icon
     */
    warn(message: string, onOk?: () => void) {
        this.confirmationService.confirm({
            message,
            header: 'Warning',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            acceptButtonStyleClass: 'p-button-warning',
            rejectButtonStyleClass: 'p-button-warning',
            rejectVisible: true,
            accept: () => onOk?.(),
            reject: () => { }
        });
    }

    /**
     * Success dialog with check icon
     */
    success(message: string, onOk?: () => void) {
        this.confirmationService.confirm({
            message,
            header: 'Success',
            icon: 'pi pi-check-circle',
            rejectVisible: true,
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-success',
            accept: () => onOk?.(),
            reject: () => { }
        });
    }
}
