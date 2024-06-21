import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  WritableSignal,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { matchPasswords } from './match-paswords-validaor';
import { TrimInputDirective } from '../../../directives/trim-input.directive';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { take } from 'rxjs';
import { ErrorResponse } from '../../../types/errorResponse';
import { faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TrimInputDirective,
    FontAwesomeModule,
  ],
  templateUrl: './signup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../auth.css',
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  errorMessage: WritableSignal<string | null> = signal(null);
  pswIcon = faLock;
  userIcon = faUser;
  emailIcon = faEnvelope;
  isLargeScreen: WritableSignal<boolean | null> = signal(null);

  constructor(
    fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
          ],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/
            ),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: matchPasswords,
      }
    );
  }
  ngOnInit(): void {
    this.checkScreenSize();
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.errorMessage.set(null);
      this.authService
        .signUpUser(
          this.signupForm.value.username,
          this.signupForm.value.email,
          this.signupForm.value.password
        )
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.router.navigate(['/login']);
          },
          error: (response) => {
            this.errorMessage.set((response.error as ErrorResponse).error);
          },
        });
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
  }

  checkScreenSize(): void {
    this.isLargeScreen.set(window.innerWidth >= 1024);
  }

  public isInvalidInput(inputName: string): boolean {
    return !!(
      this.signupForm.get(inputName)?.invalid &&
      this.isDirtyAndTouched(inputName)
    );
  }

  public isDirtyAndTouched(inputName: string): boolean {
    return !!(
      this.signupForm.get(inputName)?.dirty &&
      this.signupForm.get(inputName)?.touched
    );
  }
}
