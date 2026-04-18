import { Component, signal, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavSubItem {
  label: string;
  route: string;
  icon?: string;
  badge?: string;
}

export interface NavItem {
  label: string;
  route?: string;
  icon: string;
  children?: NavSubItem[];
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  /** Mobile sidebar open/close */
  mobileOpen = signal(false);

  /** Which top-level item has its dropdown open on desktop (by label) */
  activeDropdown = signal<string | null>(null);

  /** Which mobile accordion items are expanded */
  expandedMobile = signal<Set<string>>(new Set());

  /** Scroll threshold for navbar shadow */
  scrolled = signal(false);

  readonly navItems: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
    },
    {
      label: 'Financial',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
      children: [
        { label: 'Credit Cards', route: '/financial/credit-cards', icon: '💳', badge: 'Secure' },
        { label: 'Simple Interest', route: '/financial/simple-interest', icon: '📈' },
        { label: 'Compound Interest', route: '/financial/compound-interest', icon: '🚀' },
        { label: 'SIP Calculator', route: '/financial/sip', icon: '📊' },
        { label: 'SWP Calculator', route: '/financial/swp', icon: '💸' },
        { label: 'FD (TDR)', route: '/financial/fd-tdr', icon: '🏦' },
        { label: 'FD (STDR)', route: '/financial/fd-stdr', icon: '💰' },
        { label: 'RD Calculator', route: '/financial/rd', icon: '🔄' },
      ],
    },
  ];

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 10);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('[data-navbar]')) {
      this.activeDropdown.set(null);
    }
  }

  toggleMobile() {
    this.mobileOpen.update((v) => !v);
  }

  closeMobile() {
    this.mobileOpen.set(false);
    this.expandedMobile.set(new Set());
  }

  toggleDesktopDropdown(label: string) {
    this.activeDropdown.update((cur) => (cur === label ? null : label));
  }

  isDropdownOpen(label: string) {
    return this.activeDropdown() === label;
  }

  toggleMobileAccordion(label: string) {
    this.expandedMobile.update((set) => {
      const next = new Set(set);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }

  isMobileExpanded(label: string) {
    return this.expandedMobile().has(label);
  }
}
