import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  WritableSignal,
  signal,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ErrorResponse } from '../../../types/errorResponse';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: '../auth.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: WritableSignal<string | null> = signal(null);
  pswIcon = faLock;
  userIcon = faUser;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private destroyRef: DestroyRef
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.errorMessage.set(null);
      this.authService
        .loginUser(this.loginForm.value.username, this.loginForm.value.password)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.router.navigate(['/notes']);
          },
          error: (response) => {
            this.errorMessage.set((response.error as ErrorResponse).error);
          },
        });
    }
  }
}
