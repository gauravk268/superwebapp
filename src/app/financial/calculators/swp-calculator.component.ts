import { Component, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalculatorLayoutComponent } from './calculator-layout.component';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-swp-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, CalculatorLayoutComponent],
  template: `
    <app-calculator-layout title="SWP Calculator" subtitle="Systematic Withdrawal Plan" icon="💸">
      <div form-content class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5">Total Investment (₹)</label>
          <input type="number" [(ngModel)]="principal" (ngModelChange)="calculate()"
                 class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5">Monthly Withdrawal (₹)</label>
          <input type="number" [(ngModel)]="withdrawal" (ngModelChange)="calculate()"
                 class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5">Expected Return Rate (% p.a.)</label>
          <input type="number" [(ngModel)]="rate" (ngModelChange)="calculate()" step="0.1"
                 class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5">Time Period (Years)</label>
          <input type="number" [(ngModel)]="time" (ngModelChange)="calculate()"
                 class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
          <input type="range" [(ngModel)]="time" (ngModelChange)="calculate()" min="1" max="40" class="w-full mt-3 accent-indigo-500">
        </div>
      </div>

      <ng-container summary-cards>
        <div class="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-2xl">
          <p class="text-xs text-indigo-300 mb-1 font-medium">Total Investment</p>
          <p class="text-2xl font-bold text-white">₹{{ principal().toLocaleString('en-IN') }}</p>
        </div>
        <div class="bg-rose-500/10 border border-rose-500/20 p-5 rounded-2xl">
          <p class="text-xs text-rose-300 mb-1 font-medium">Total Withdrawal</p>
          <p class="text-2xl font-bold text-rose-400">₹{{ totalWithdrawal().toLocaleString('en-IN') }}</p>
        </div>
        <div class="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl">
          <p class="text-xs text-amber-300 mb-1 font-medium">Final Value</p>
          <p class="text-2xl font-bold" [ngClass]="finalValue() > 0 ? 'text-amber-400' : 'text-slate-500'">
            {{ finalValue() > 0 ? '₹' + finalValue().toLocaleString('en-IN') : 'Depleted' }}
          </p>
        </div>
      </ng-container>

      <div chart-content class="w-full">
        <canvas #chartCanvas></canvas>
      </div>

      <table table-content class="w-full text-left text-sm text-slate-300 whitespace-nowrap">
        <thead class="text-xs uppercase bg-white/5 text-slate-400 sticky top-0">
          <tr>
            <th class="px-6 py-3 font-medium">Year</th>
            <th class="px-6 py-3 font-medium">Opening Balance</th>
            <th class="px-6 py-3 font-medium">Withdrawal</th>
            <th class="px-6 py-3 font-medium">Interest Earned</th>
            <th class="px-6 py-3 font-medium text-right">Closing Balance</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          @for (row of schedule(); track row.year) {
            <tr class="hover:bg-white/5 transition-colors">
              <td class="px-6 py-3">{{ row.year }}</td>
              <td class="px-6 py-3">₹{{ row.openingBalance.toLocaleString('en-IN') }}</td>
              <td class="px-6 py-3 text-rose-400">₹{{ row.withdrawal.toLocaleString('en-IN') }}</td>
              <td class="px-6 py-3 text-emerald-400">₹{{ row.interestEarned.toLocaleString('en-IN') }}</td>
              <td class="px-6 py-3 text-right font-medium text-white">₹{{ row.closingBalance.toLocaleString('en-IN') }}</td>
            </tr>
          }
        </tbody>
      </table>
    </app-calculator-layout>
  `
})
export class SwpCalculatorComponent implements AfterViewInit {
  principal = signal(5000000);
  withdrawal = signal(25000);
  rate = signal(10);
  time = signal(10);

  totalWithdrawal = signal(0);
  finalValue = signal(0);
  schedule = signal<any[]>([]);

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  chart: Chart | null = null;

  constructor() {
    this.calculate();
  }

  ngAfterViewInit() {
    this.initChart();
  }

  calculate() {
    const p = this.principal() || 0;
    const w = this.withdrawal() || 0;
    const r = this.rate() || 0;
    const t = this.time() || 0;

    const i = r / 12 / 100; // monthly rate

    let currentBal = p;
    let totWithdrawn = 0;
    const sched = [];

    for (let yr = 1; yr <= t; yr++) {
      let yrInt = 0;
      let yrWithdrawn = 0;
      let openBal = currentBal;

      for (let m = 1; m <= 12; m++) {
        if (currentBal <= 0) break;
        let intEarned = currentBal * i;
        yrInt += intEarned;
        currentBal += intEarned;

        let withdrawAmount = Math.min(w, currentBal);
        yrWithdrawn += withdrawAmount;
        currentBal -= withdrawAmount;
      }

      totWithdrawn += yrWithdrawn;
      
      sched.push({
        year: yr,
        openingBalance: Math.round(openBal),
        withdrawal: Math.round(yrWithdrawn),
        interestEarned: Math.round(yrInt),
        closingBalance: Math.max(0, Math.round(currentBal))
      });

      if (currentBal <= 0) {
        currentBal = 0;
        break; // Stop calculation if corpus is depleted
      }
    }

    this.totalWithdrawal.set(Math.round(totWithdrawn));
    this.finalValue.set(Math.round(currentBal));
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
          legend: { labels: { color: '#cbd5e1' } },
          tooltip: { mode: 'index', intersect: false }
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
    const balanceData = this.schedule().map(s => s.closingBalance);
    const withdrawalData = this.schedule().map((_, idx) => {
      // Cumulative withdrawal
      let c = 0;
      for(let j=0; j<=idx; j++) c += this.schedule()[j].withdrawal;
      return c;
    });

    return {
      labels,
      datasets: [
        {
          type: 'line' as const,
          label: 'Closing Balance',
          data: balanceData,
          borderColor: '#6366f1',
          backgroundColor: '#6366f140',
          tension: 0.4,
          fill: true
        },
        {
          type: 'bar' as const,
          label: 'Cumulative Withdrawal',
          data: withdrawalData,
          backgroundColor: '#f43f5e',
          borderRadius: 4
        }
      ]
    };
  }
}
