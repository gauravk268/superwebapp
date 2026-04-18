import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-950 pt-4 px-4 pb-12">
      <div class="max-w-5xl mx-auto">
        <!-- Page header -->
        <div class="mb-8">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-3">
            <span>{{ section }}</span>
          </div>
          <h1 class="text-3xl font-bold text-white">{{ title }}</h1>
          <p class="text-slate-400 mt-1 text-sm">{{ subtitle }}</p>
        </div>

        <!-- Stats row -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          @for (stat of stats; track stat.label) {
            <div class="p-5 rounded-2xl bg-slate-900 border border-white/6 hover:border-indigo-500/20 transition-all">
              <p class="text-xs text-slate-500 mb-1 font-medium">{{ stat.label }}</p>
              <p class="text-2xl font-bold text-white">{{ stat.value }}</p>
              <p class="text-xs mt-1" [class.text-emerald-400]="stat.trend > 0" [class.text-rose-400]="stat.trend < 0">
                {{ stat.trend > 0 ? '↑' : '↓' }} {{ stat.trendText }}
              </p>
            </div>
          }
        </div>

        <!-- Content area -->
        <div class="rounded-3xl bg-slate-900 border border-white/6 p-6 lg:p-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="flex gap-1.5">
              <span class="w-3 h-3 rounded-full bg-rose-500/70"></span>
              <span class="w-3 h-3 rounded-full bg-yellow-500/70"></span>
              <span class="w-3 h-3 rounded-full bg-emerald-500/70"></span>
            </div>
            <span class="text-xs text-slate-600 font-mono">{{ title | lowercase }}.view</span>
          </div>

          <!-- Skeleton rows -->
          <div class="space-y-1">
            @for (row of skeletonRows; track row) {
              <div class="flex gap-3 items-center py-3 border-b border-white/4 last:border-0">
                <div class="w-9 h-9 rounded-xl bg-white/5 shrink-0 animate-pulse"></div>
                <div class="flex-1 space-y-1.5">
                  <div class="h-3 bg-white/8 rounded-full animate-pulse" [style.width]="row + '%'"></div>
                  <div class="h-2.5 bg-white/4 rounded-full animate-pulse" [style.width]="(row * 0.6) + '%'"></div>
                </div>
                <div class="w-16 h-6 rounded-lg bg-indigo-500/15 animate-pulse shrink-0"></div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PageComponent implements OnInit {
  private route = inject(ActivatedRoute);

  title = 'Page';
  subtitle = 'Manage and explore your data';
  section = 'Module';

  stats = [
    { label: 'Total Items', value: '2,847', trend: 1, trendText: '12% this week' },
    { label: 'Active', value: '1,203', trend: 1, trendText: '5% today' },
    { label: 'Pending', value: '84', trend: -1, trendText: '3 new' },
    { label: 'Revenue', value: '$48.2K', trend: 1, trendText: '8.1% MoM' },
  ];

  skeletonRows = [90, 75, 82, 65, 88, 70, 78];

  ngOnInit() {
    const data = this.route.snapshot.data;
    this.title = data['title'] ?? this.title;
    this.subtitle = data['subtitle'] ?? this.subtitle;
    this.section = data['section'] ?? this.section;
  }
}
