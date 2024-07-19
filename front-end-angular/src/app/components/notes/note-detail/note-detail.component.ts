import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  WritableSignal,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TNote } from '../../../types/note';
import { NoteService } from '../../../services/note.service';
import { take } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-note-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FontAwesomeModule],
  templateUrl: './note-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteDetailComponent implements OnInit {
  id!: string;
  note: WritableSignal<TNote | null> = signal<TNote | null>(null);
  isEditing: WritableSignal<boolean> = signal<boolean>(false);
  penIcon = faPen;
  trashIcon = faTrash;
  editedNote: string = '';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private noteService: NoteService,
    private destroyRef: DestroyRef
  ) {}
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.id = id;
      this.getNote(id);
    } else {
      this.router.navigate(['/notes']);
    }
  }
  private getNote(noteId: string) {
    this.noteService
      .getNote(noteId)
      .pipe(takeUntilDestroyed(this.destroyRef))

      .subscribe((n) => {
        this.note.set(n);
        this.editedNote = n.text;
      });
  }

  handleEditClick() {
    this.isEditing.set(!this.isEditing());
  }

  handleKeyDown($event: KeyboardEvent) {
    const noteBeforeUpdate = this.note();
    if (noteBeforeUpdate) {
      if ($event.key === 'Enter') {
        $event.preventDefault();
        this.isEditing.set(false);
        this.noteService
          .updateNote(this.id, {
            title: noteBeforeUpdate.title,
            text: this.editedNote,
          })
          .pipe(take(1))
          .subscribe((n) => this.note.set(n));
      } else if ($event.key === 'Escape') {
        this.isEditing.set(false);
        this.note.set(noteBeforeUpdate);
      }
    }
  }
  handleRemoveClick(noteId: string | undefined) {
    if (noteId) {
      this.noteService
        .deleteNote(noteId)
        .pipe(take(1))
        .subscribe(() => this.router.navigate(['/notes']));
    }
  }
}
