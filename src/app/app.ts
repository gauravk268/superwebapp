import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  pageTitle = '';
  pageSubtitle = '';
  pageSection = '';

  ngOnInit() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        map(() => {
          let child = this.route.firstChild;
          while (child?.firstChild) child = child.firstChild;
          return child?.snapshot.data ?? {};
        }),
      )
      .subscribe((data) => {
        this.pageTitle = data['title'] ?? '';
        this.pageSubtitle = data['subtitle'] ?? '';
        this.pageSection = data['section'] ?? '';
      });
  }
}
