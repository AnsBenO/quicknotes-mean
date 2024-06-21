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
  WritableSignal,
  signal,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { take } from 'rxjs';
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
    private router: Router
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
        .pipe(take(1))
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
