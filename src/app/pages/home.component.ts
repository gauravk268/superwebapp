import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center px-4">
      <div class="text-center max-w-2xl">
        <!-- Glow orb -->
        <div class="relative mx-auto w-28 h-28 mb-8">
          <div class="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 blur-2xl opacity-60 animate-pulse"></div>
          <div class="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-14 h-14 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
        </div>

        <h1 class="text-5xl sm:text-6xl font-extrabold text-white mb-4 tracking-tight">
          Welcome to <span class="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">SuperApp</span>
        </h1>
        <p class="text-slate-400 text-lg mb-10 leading-relaxed">
          A fully responsive Angular application with a beautiful two-level navigation bar — works seamlessly on desktop and mobile.
        </p>

        <div class="flex flex-wrap items-center justify-center gap-3">
          <a routerLink="/dashboard" class="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 hover:-translate-y-0.5">
            Go to Dashboard →
          </a>
          <a routerLink="/analytics" class="px-6 py-3 rounded-2xl bg-white/8 hover:bg-white/12 border border-white/10 text-slate-300 hover:text-white font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5">
            View Analytics
          </a>
        </div>

        <!-- Feature cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-14">
          @for (card of cards; track card.title) {
            <div class="p-5 rounded-2xl bg-white/4 border border-white/8 hover:bg-white/6 transition-all duration-200 text-left group hover:-translate-y-1">
              <div class="text-2xl mb-3">{{ card.icon }}</div>
              <h3 class="text-white font-semibold text-sm mb-1">{{ card.title }}</h3>
              <p class="text-slate-500 text-xs leading-relaxed">{{ card.desc }}</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class HomeComponent {
  cards = [
    { icon: '🎨', title: 'Two-Level Navbar', desc: 'Dropdown menus on desktop, accordion on mobile.' },
    { icon: '📱', title: 'Fully Responsive', desc: 'Looks great on any screen size.' },
    { icon: '⚡', title: 'Tailwind CSS v4', desc: 'Utility-first styling with zero config.' },
  ];
}
