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

  constructor(private http: HttpClient) {}

  getNotes(): Observable<TNote[]> {
    return this.http.get<TNote[]>(this.API_URL);
  }

  getNote(id: string): Observable<TNote> {
    return this.http.get<TNote>(`${this.API_URL}/${id}`);
  }

  createNote(note: { title: string; text: string }): Observable<TNote> {
    return this.http.post<TNote>(this.API_URL, note);
  }

  updateNote(
    id: string,
    note: { title: string; text: string }
  ): Observable<TNote> {
    return this.http.patch<TNote>(`${this.API_URL}/${id}`, note);
  }

  deleteNote(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
