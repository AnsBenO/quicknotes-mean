import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./components/auth/signup/signup.component').then(
        (m) => m.SignupComponent
      ),
  },
  {
    path: 'notes',
    loadComponent: () =>
      import('./components/notes/list-notes/list-notes.component').then(
        (m) => m.ListNotesComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'notes/new',
    loadComponent: () =>
      import('./components/notes/note-create/note-create.component').then(
        (m) => m.NoteCreateFormComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'notes/:id',
    loadComponent: () =>
      import('./components/notes/note-detail/note-detail.component').then(
        (m) => m.NoteDetailComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/common/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
