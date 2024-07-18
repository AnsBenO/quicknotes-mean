import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, take, tap } from 'rxjs/operators';
import { LoginResponse, LogoutResponse, SignupResponse } from '../types/auth';

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
  authToken: WritableSignal<string | null> = signal<string | null>(null);

  constructor(private http: HttpClient) {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      this.loggedIn.next(true);
      this.authToken.set(authToken);
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
            this.authToken.set(response.authToken);
            this.startRefreshTokenTimer();
          }
        })
      );
  }

  refreshToken(): Observable<{ authToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh authToken found'));
    }

    return this.http
      .post<{ authToken: string }>(`${API_URL}/refresh-token`, {
        authToken: refreshToken,
      })
      .pipe(
        tap((response) => {
          if (response.authToken) {
            localStorage.setItem('authToken', response.authToken);
            this.authToken.set(response.authToken);
            this.startRefreshTokenTimer();
          } else {
            throw new Error('Invalid response');
          }
        }),
        catchError((err) => {
          this.logoutUser().pipe(take(1)).subscribe();
          console.error(err);
          return throwError(() => err);
        })
      );
  }

  private startRefreshTokenTimer() {
    type AuthTokenPayload = {
      exp: number; // Expiration time in Unix timestamp format
      iat: number; // Issued at time in Unix timestamp format
      userId: string; // User ID
    };
    const authToken = localStorage.getItem('authToken');
    if (!authToken) return;

    const jwtToken = JSON.parse(
      atob(authToken.split('.')[1])
    ) as AuthTokenPayload;
    const expires = new Date(jwtToken.exp * 1000);

    const timeout = expires.getTime() - Date.now() - 60 * 1000;
    this.refreshTokenTimeout = setTimeout(
      () => this.refreshToken().pipe(take(1)).subscribe(),
      timeout
    );
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
      tap({
        next: () => {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          this.authToken.set(null);
          this.loggedIn.next(false);
          this.stopRefreshTokenTimer();
        },
        error: (err) => throwError(() => err),
      })
    );
  }
}
