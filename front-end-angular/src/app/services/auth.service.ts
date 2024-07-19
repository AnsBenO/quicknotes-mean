import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, take, tap } from 'rxjs/operators';
import {
  AuthTokenPayload,
  LoginResponse,
  LogoutResponse,
  SignupResponse,
} from '../types/auth';

const API_URL = 'http://localhost:3003/api/users';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(
    !!localStorage.getItem('authToken')
  );
  public isAuthenticated$ = this.loggedIn.asObservable();
  private refreshTokenTimeout!: ReturnType<typeof setTimeout>;

  constructor(private http: HttpClient) {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      this.loggedIn.next(true);

      this.startRefreshTokenTimer();
    }
  }

  loginUser(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${API_URL}/login`, { username, password })
      .pipe(
        tap((response) => {
          if (response.authToken && response.refreshToken) {
            localStorage.setItem('authToken', response.authToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            this.loggedIn.next(true);
            this.startRefreshTokenTimer();
          }
        })
      );
  }

  refreshToken(): Observable<{ authToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      this.logoutUser().subscribe({
        next: (response) => {
          console.log('Logout successful:', response);
        },
        error: (err) => {
          console.error('Logout failed:', err);
        },
      });
      return throwError(() => new Error('No refresh authToken found'));
    }

    return this.http
      .post<{ authToken: string }>(`${API_URL}/refresh-token`, {
        refreshToken: refreshToken,
      })
      .pipe(
        take(1),
        tap((response) => {
          if (response.authToken) {
            localStorage.setItem('authToken', response.authToken);
            this.startRefreshTokenTimer();
          } else {
            throw new Error('Invalid response');
          }
        }),
        catchError((err) => {
          this.logoutUser().subscribe({
            next: (response) => {
              console.log('Logout successful:', response);
            },
            error: (err) => {
              console.error('Logout failed:', err);
            },
          });
          console.error(err);
          return throwError(() => err);
        })
      );
  }

  private startRefreshTokenTimer() {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) return;
    try {
      const jwtToken = JSON.parse(
        atob(authToken.split('.')[1])
      ) as AuthTokenPayload;
      const expires = new Date(jwtToken.exp * 1000);
      const timeout = expires.getTime() - Date.now() - 60 * 1000;

      if (timeout < 180000) {
        // Refresh the token if it is near expiration
        this.refreshToken().pipe(take(1)).subscribe();
      } else {
        // If token is valid, set the user as logged in
        this.loggedIn.next(true);
        this.refreshTokenTimeout = setTimeout(
          () => this.refreshToken().pipe(take(1)).subscribe(),
          timeout - 180000
        );
      }
    } catch (error) {
      console.error('Failed to parse JWT:', error);
      this.logoutUser().subscribe({
        next: (response) => {
          console.log('Logout successful:', response);
        },
        error: (err) => {
          console.error('Logout failed:', err);
        },
      });
    }
  }

  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }

  signUpUser(
    username: string,
    email: string,
    password: string
  ): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${API_URL}/signup`, {
      username,
      email,
      password,
    });
  }

  logoutUser(): Observable<LogoutResponse> {
    return this.http.post<LogoutResponse>(`${API_URL}/logout`, {}).pipe(
      take(1),
      tap({
        next: () => {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          this.loggedIn.next(false);
          this.stopRefreshTokenTimer();
        },
        error: (err) => throwError(() => err),
      })
    );
  }
}
