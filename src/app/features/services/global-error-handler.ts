import { ErrorHandler, Injectable, inject } from '@angular/core';
import { LoaderService } from './loader.service';
import { SupabaseService } from '../supabase/common.supabase.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private loader = inject(LoaderService);
  private supabase = inject(SupabaseService);

  handleError(error: any): void {
    console.log('exception');
    this.supabase.logError(
        error.message || error.toString(),
        error.stack || '',
        {
          url: window.location.href,
          userAgent: navigator.userAgent
        }
      );
    this.loader.hide();
  }
}

