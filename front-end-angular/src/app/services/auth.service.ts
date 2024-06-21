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
  token: WritableSignal<string | null> = signal<string | null>(null);

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.loggedIn.next(true);
      this.token.set(token);
      this.startRefreshTokenTimer();
    }
  }

  loginUser(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${API_URL}/login`, { username, password })
      .pipe(
        tap((response) => {
          if (response.token && response.refreshToken) {
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('refreshToken', response.refreshToken);
            this.loggedIn.next(true);
            this.token.set(response.token);
            this.startRefreshTokenTimer();
          }
        })
      );
  }

  refreshToken(): Observable<{ token: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token found'));
    }

    return this.http
      .post<{ token: string }>(`${API_URL}/refresh-token`, {
        token: refreshToken,
      })
      .pipe(
        tap((response) => {
          if (response.token) {
            localStorage.setItem('authToken', response.token);
            this.token.set(response.token);
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
    type JwtToken = {
      exp: number;
      iat: number;
      userId: string;
    };
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const jwtToken = JSON.parse(atob(token.split('.')[1])) as JwtToken;
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
          this.token.set(null);
          this.loggedIn.next(false);
          this.stopRefreshTokenTimer();
        },
        error: (err) => throwError(() => err),
      })
    );
  }
}
