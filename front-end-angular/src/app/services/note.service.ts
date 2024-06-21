import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { TNote } from '../types/note';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class NoteService {
  API_URL = 'http://localhost:3003/api/notes';

  constructor(private http: HttpClient, private authService: AuthService) {}
  private createAuthHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getNotes(): Observable<TNote[]> {
    const headers = this.createAuthHeaders(this.authService.token() as string);
    return this.http
      .get<TNote[]>(this.API_URL, { headers })
      .pipe(catchError((err) => this.handleAuthError(err, this.getNotes())));
  }

  getNote(id: string): Observable<TNote> {
    const headers = this.createAuthHeaders(this.authService.token() as string);
    return this.http
      .get<TNote>(`${this.API_URL}/${id}`, { headers })
      .pipe(catchError((err) => this.handleAuthError(err, this.getNote(id))));
  }

  createNote(note: { title: string; text: string }): Observable<TNote> {
    const headers = this.createAuthHeaders(this.authService.token() as string);
    return this.http
      .post<TNote>(this.API_URL, note, { headers })
      .pipe(
        catchError((err) => this.handleAuthError(err, this.createNote(note)))
      );
  }

  updateNote(
    id: string,
    note: { title: string; text: string }
  ): Observable<TNote> {
    const headers = this.createAuthHeaders(this.authService.token() as string);
    return this.http
      .patch<TNote>(`${this.API_URL}/${id}`, note, { headers })
      .pipe(
        catchError((err) =>
          this.handleAuthError(err, this.updateNote(id, note))
        )
      );
  }

  deleteNote(id: string): Observable<void> {
    const headers = this.createAuthHeaders(this.authService.token() as string);
    return this.http
      .delete<void>(`${this.API_URL}/${id}`, {
        headers,
      })
      .pipe(
        catchError((err) => this.handleAuthError(err, this.deleteNote(id)))
      );
  }

  private handleAuthError(
    err: HttpErrorResponse,
    originalRequest: Observable<any>
  ): Observable<any> {
    if (err.status === 401) {
      return this.authService.refreshToken().pipe(
        switchMap(() => {
          this.authService.token() as string;
          return originalRequest;
        }),
        catchError((error) => {
          this.authService.logoutUser().subscribe();
          return throwError(() => error);
        })
      );
    }
    return throwError(() => err);
  }
}
