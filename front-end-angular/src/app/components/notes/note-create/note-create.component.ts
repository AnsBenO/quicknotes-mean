import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TrimInputDirective } from '../../../directives/trim-input.directive';
import {
  faHeading,
  faPlus,
  faStickyNote,
} from '@fortawesome/free-solid-svg-icons';
import { NoteService } from '../../../services/note.service';
import { catchError, take, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-note-create-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    TrimInputDirective,
  ],
  templateUrl: './note-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteCreateFormComponent {
  noteForm!: FormGroup;
  errorMessage: WritableSignal<string | null> = signal(null);
  plusIcon = faPlus;
  headingIcon = faHeading;
  stickyNoteIcon = faStickyNote;

  constructor(
    private fb: FormBuilder,
    private noteService: NoteService,
    private router: Router
  ) {
    this.noteForm = fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      text: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  public handleSubmit(): void {
    if (!this.noteForm.valid) {
      return;
    }

    this.noteService
      .createNote({
        title: this.noteForm.value.title,
        text: this.noteForm.value.text,
      })
      .pipe(take(1))
      .subscribe({
        next: () => void this.router.navigate(['/notes']),
        error: (err) => {
          this.errorMessage.set(err.error.message || err.message);
          return throwError(() => err);
        },
      });
  }

  public isInvalidInput(inputName: string): boolean {
    return !!(
      this.noteForm.get(inputName)?.invalid && this.isDirtyAndTouched(inputName)
    );
  }

  public isDirtyAndTouched(inputName: string): boolean {
    return !!(
      this.noteForm.get(inputName)?.dirty &&
      this.noteForm.get(inputName)?.touched
    );
  }
}
