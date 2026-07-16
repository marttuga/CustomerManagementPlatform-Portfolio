import {
  HttpRequest,
  HttpEvent,
  HttpInterceptorFn,
  HttpHandlerFn
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Global HTTP error interceptor.
 * Catches all HTTP errors, logs them to the console and rethrows
 * a standardised Error so components can handle it consistently.
 */
export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  return next(req).pipe(
    catchError(error => {
      let errorMessage = 'An unknown error occurred.';

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = `Network error: ${error.error.message}`;
      } else {
        // Server-side error returned by the API
        errorMessage = `Error ${error.status}: ${error.message}`;
      }

      console.error('HTTP error intercepted:', errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
};