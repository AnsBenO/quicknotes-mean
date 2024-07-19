import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
})
export class NavigationComponent {
  isNavOpen: boolean = false;
  threeBarsIcon = faBars;
  xMarkIcon = faXmark;

  constructor(public authService: AuthService, private router: Router) {}

  handleLogout() {
    this.authService.logoutUser().subscribe({
      next: () => {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        this.router.navigate(['/login']);
      },
    });
  }

  toggleNav(): void {
    this.isNavOpen = !this.isNavOpen;
  }
  @HostListener('document:click', ['$event'])
  @HostListener('document:touchstart', ['$event'])
  handleOutsideClick(event: Event) {
    const sideBarElement = document.querySelector('#sidebar');
    const closeButton = document.querySelector('#nav_button');
    if (this.isNavOpen) {
      if (
        sideBarElement &&
        !sideBarElement.contains(event.target as Node) &&
        !closeButton?.contains(event.target as Node)
      ) {
        console.log('outside click');

        this.isNavOpen = false;
      }
    }
  }
}
