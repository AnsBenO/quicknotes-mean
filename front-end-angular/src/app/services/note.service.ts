import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, switchMap, take, throwError } from 'rxjs';
import { TNote } from '../types/note';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class NoteService {
  API_URL = 'http://localhost:3003/api/notes';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getNotes(): Observable<TNote[]> {
    return this.http
      .get<TNote[]>(this.API_URL)
      .pipe(catchError((err) => this.handleAuthError(err, this.getNotes())));
  }

  getNote(id: string): Observable<TNote> {
    return this.http
      .get<TNote>(`${this.API_URL}/${id}`)
      .pipe(catchError((err) => this.handleAuthError(err, this.getNote(id))));
  }

  createNote(note: { title: string; text: string }): Observable<TNote> {
    return this.http
      .post<TNote>(this.API_URL, note)
      .pipe(
        catchError((err) => this.handleAuthError(err, this.createNote(note)))
      );
  }

  updateNote(
    id: string,
    note: { title: string; text: string }
  ): Observable<TNote> {
    return this.http
      .patch<TNote>(`${this.API_URL}/${id}`, note)
      .pipe(
        catchError((err) =>
          this.handleAuthError(err, this.updateNote(id, note))
        )
      );
  }

  deleteNote(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.API_URL}/${id}`)
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
          this.authService.authToken() as string;
          return originalRequest;
        }),
        catchError((error) => {
          this.authService.logoutUser().pipe(take(1)).subscribe();
          return throwError(() => error);
        })
      );
    }
    return throwError(() => err);
  }
}
