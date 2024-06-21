import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faShareAlt,
  faSignInAlt,
  faStickyNote,
  faSyncAlt,
  faTags,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterModule],
  templateUrl: './home.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  signinIcon = faSignInAlt;
  userIcon = faUserPlus;
  stickyNoteIcon = faStickyNote;
  tagsIcon = faTags;
  syncIcon = faSyncAlt;
  shareIcon = faShareAlt;

  constructor(public authService: AuthService) {}
}
