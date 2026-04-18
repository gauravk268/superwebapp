import { Component, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalculatorLayoutComponent } from './calculator-layout.component';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-fd-tdr',
  standalone: true,
  imports: [CommonModule, FormsModule, CalculatorLayoutComponent],
  template: `
    <app-calculator-layout title="FD TDR Calculator" subtitle="Fixed Deposit - Term Deposit Receipt (Interest Payout)" icon="🏦">
      <div form-content class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5">Deposit Amount (₹)</label>
          <input type="number" [(ngModel)]="principal" (ngModelChange)="calculate()"
                 class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5">Rate of Interest (% p.a.)</label>
          <input type="number" [(ngModel)]="rate" (ngModelChange)="calculate()" step="0.1"
                 class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5">Tenure (Years)</label>
          <input type="number" [(ngModel)]="time" (ngModelChange)="calculate()"
                 class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5">Interest Payout Frequency</label>
          <select [(ngModel)]="frequency" (ngModelChange)="calculate()"
                  class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none">
            <option [ngValue]="12">Monthly</option>
            <option [ngValue]="4">Quarterly</option>
            <option [ngValue]="2">Half-Yearly</option>
            <option [ngValue]="1">Yearly</option>
          </select>
        </div>
      </div>

      <ng-container summary-cards>
        <div class="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-2xl">
          <p class="text-xs text-indigo-300 mb-1 font-medium">Principal Amount</p>
          <p class="text-2xl font-bold text-white">₹{{ principal().toLocaleString('en-IN') }}</p>
        </div>
        <div class="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl">
          <p class="text-xs text-emerald-300 mb-1 font-medium">Periodic Payout</p>
          <p class="text-2xl font-bold text-emerald-400">₹{{ periodicPayout().toLocaleString('en-IN') }}</p>
          <p class="text-[10px] text-emerald-500 mt-1">per {{ freqLabel() }}</p>
        </div>
        <div class="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl">
          <p class="text-xs text-amber-300 mb-1 font-medium">Total Interest Earned</p>
          <p class="text-2xl font-bold text-amber-400">₹{{ totalInterest().toLocaleString('en-IN') }}</p>
        </div>
      </ng-container>

      <div chart-content class="w-full">
        <canvas #chartCanvas></canvas>
      </div>

      <table table-content class="w-full text-left text-sm text-slate-300 whitespace-nowrap">
        <thead class="text-xs uppercase bg-white/5 text-slate-400 sticky top-0">
          <tr>
            <th class="px-6 py-3 font-medium">Year</th>
            <th class="px-6 py-3 font-medium">Principal</th>
            <th class="px-6 py-3 font-medium">Interest Paid Out</th>
            <th class="px-6 py-3 font-medium text-right">Remaining Principal</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          @for (row of schedule(); track row.year) {
            <tr class="hover:bg-white/5 transition-colors">
              <td class="px-6 py-3">{{ row.year }}</td>
              <td class="px-6 py-3">₹{{ row.principal.toLocaleString('en-IN') }}</td>
              <td class="px-6 py-3 text-emerald-400">₹{{ row.interestPaid.toLocaleString('en-IN') }}</td>
              <td class="px-6 py-3 text-right font-medium text-white">₹{{ row.remaining.toLocaleString('en-IN') }}</td>
            </tr>
          }
        </tbody>
      </table>
    </app-calculator-layout>
  `
})
export class FdTdrComponent implements AfterViewInit {
  principal = signal(1000000);
  rate = signal(7.5);
  time = signal(5);
  frequency = signal(4); // 4 = quarterly payout

  periodicPayout = signal(0);
  totalInterest = signal(0);
  schedule = signal<any[]>([]);

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  chart: Chart | null = null;

  constructor() {
    this.calculate();
  }

  ngAfterViewInit() {
    this.initChart();
  }

  freqLabel() {
    switch(this.frequency()) {
      case 12: return 'month';
      case 4: return 'quarter';
      case 2: return 'half-year';
      case 1: return 'year';
      default: return 'period';
    }
  }

  calculate() {
    const p = this.principal() || 0;
    const r = this.rate() || 0;
    const t = this.time() || 0;
    const f = this.frequency();

    // Simple interest calculation for payout period
    // Formula for period interest: P * (R/100) / freq
    const periodInterest = Math.round(p * (r / 100) / f);
    const yearlyInterest = periodInterest * f;
    const totInt = yearlyInterest * t;

    this.periodicPayout.set(periodInterest);
    this.totalInterest.set(totInt);

    const sched = [];
    for (let yr = 1; yr <= t; yr++) {
      sched.push({
        year: yr,
        principal: p,
        interestPaid: yearlyInterest,
        remaining: yr === t ? 0 : p // At maturity (last year), principal is returned
      });
    }
    this.schedule.set(sched);
    
    this.updateChart();
  }

  initChart() {
    if (!this.chartCanvas) return;
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: this.getChartData(),
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: '#ffffff10' }, ticks: { color: '#94a3b8' } },
          y: { grid: { color: '#ffffff10' }, ticks: { color: '#94a3b8' } }
        },
        plugins: {
          legend: { labels: { color: '#cbd5e1' } }
        }
      }
    });
  }

  updateChart() {
    if (!this.chart) return;
    this.chart.data = this.getChartData();
    this.chart.update();
  }

  private getChartData() {
    const labels = this.schedule().map(s => 'Year ' + s.year);
    const interestData = this.schedule().map(s => s.interestPaid);
    // Principal return is only in the last year
    const principalReturn = this.schedule().map((s, i) => i === this.schedule().length - 1 ? s.principal : 0);

    return {
      labels,
      datasets: [
        {
          label: 'Interest Payout',
          data: interestData,
          backgroundColor: '#10b981',
          borderRadius: 4
        },
        {
          label: 'Principal Returned',
          data: principalReturn,
          backgroundColor: '#6366f1',
          borderRadius: 4
        }
      ]
    };
  }
}
