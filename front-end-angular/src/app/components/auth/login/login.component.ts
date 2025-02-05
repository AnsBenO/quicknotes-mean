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
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly destroyRef: DestroyRef
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
          error: () => {
            this.errorMessage.set('Invalid credentials');
          },
        });
    }
  }
}
