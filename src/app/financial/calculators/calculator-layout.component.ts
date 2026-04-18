import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calculator-layout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto space-y-6">
      <div class="flex items-center gap-3 bg-slate-900 p-4 rounded-2xl border border-white/5 shadow-xl">
        <div class="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
          <span class="text-xl" [innerHTML]="icon()"></span>
        </div>
        <div>
          <h2 class="text-lg font-bold text-white">{{ title() }}</h2>
          <p class="text-xs text-slate-400">{{ subtitle() }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Input Form Section -->
        <div class="lg:col-span-4 space-y-6">
          <div class="bg-slate-900 rounded-2xl border border-white/5 p-6 shadow-xl">
            <ng-content select="[form-content]"></ng-content>
          </div>
        </div>

        <!-- Results & Visualization Section -->
        <div class="lg:col-span-8 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ng-content select="[summary-cards]"></ng-content>
          </div>
          
          <div class="bg-slate-900 rounded-2xl border border-white/5 p-6 shadow-xl flex items-center justify-center min-h-[300px]">
            <ng-content select="[chart-content]"></ng-content>
          </div>

          <div class="bg-slate-900 rounded-2xl border border-white/5 shadow-xl overflow-hidden">
            <div class="px-6 py-4 border-b border-white/5 bg-slate-800/30">
              <h3 class="font-semibold text-white">Schedule / Breakdown</h3>
            </div>
            <div class="overflow-x-auto max-h-[400px] scrollbar-thin scrollbar-thumb-white/10">
              <ng-content select="[table-content]"></ng-content>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CalculatorLayoutComponent {
  title = input<string>('');
  subtitle = input<string>('');
  icon = input<string>('📊');
}
