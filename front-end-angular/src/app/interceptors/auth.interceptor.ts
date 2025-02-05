import {
  HttpErrorResponse,
  HttpRequest,
  HttpInterceptorFn,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authToken = localStorage.getItem('authToken') ?? '';
  const authService = inject(AuthService);

  if (!req.url.includes('/refresh-token')) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.includes('/login')) {
        // Attempt to refresh the token
        return authService.refreshToken().pipe(
          switchMap((response) => {
            const newAuthToken = response.authToken;
            const authReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newAuthToken}`,
              },
            });
            // Retry the request with the new auth token
            return next(authReq);
          }),
          catchError((refreshError) => {
            // If refreshing fails, log out the user
            authService.logoutUser().subscribe({
              next: (response) => {
                console.log('Logout successful:', response);
              },
              error: (err) => {
                console.error('Logout failed:', err);
              },
            });
            return throwError(() => refreshError);
          })
        );
      }
      // Propagate other errors
      return throwError(() => err);
    })
  );
};
