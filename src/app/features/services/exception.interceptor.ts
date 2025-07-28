import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class ExceptionInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Interceptor is working!'); // ✅ LOG should appear

    return next.handle(req).pipe(
      finalize(() => {
        console.log('Request completed');
        // your loaderService.hide() or other final logic
      })
    );
  }
}
