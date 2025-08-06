import { ErrorHandler, Injectable, inject } from '@angular/core';
import { LoaderService } from './loader.service';
import { SupabaseService } from '../supabase/common.supabase.service';
import { ToastService } from './toast.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private loader = inject(LoaderService);
  private supabase = inject(SupabaseService);
  private toast = inject(ToastService);
  private readonly ADMIN_KEY = 'adminUser';

  handleError(error: any): void {
    if (
      error?.toString()?.includes('NavigatorLockAcquireTimeoutError')
    ) {
      return;
    }

    const stored = localStorage.getItem(this.ADMIN_KEY);
    let userDetails = stored ? JSON.parse(stored) : null;
    this.toast.error('Error', 'Something went wrong, please contact administrator');
    this.supabase.logError(
        error.message || error.toString(),
        error.stack || '',
        {
          url: window.location.href,
          userAgent: navigator.userAgent,
          userid: userDetails?.userId || 0,
        }
      );
    this.loader.hide();
  }
}

