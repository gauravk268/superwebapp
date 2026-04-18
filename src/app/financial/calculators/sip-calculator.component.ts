import { Component, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalculatorLayoutComponent } from './calculator-layout.component';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-sip-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, CalculatorLayoutComponent],
  template: `
    <app-calculator-layout title="SIP Calculator" subtitle="Systematic Investment Plan" icon="📊">
      <div form-content class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5">Monthly Investment (₹)</label>
          <input type="number" [(ngModel)]="monthlyInvestment" (ngModelChange)="calculate()"
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
          <p class="text-2xl font-bold text-white">₹{{ totalInvestment().toLocaleString('en-IN') }}</p>
        </div>
        <div class="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl">
          <p class="text-xs text-emerald-300 mb-1 font-medium">Est. Returns</p>
          <p class="text-2xl font-bold text-emerald-400">₹{{ expectedReturns().toLocaleString('en-IN') }}</p>
        </div>
        <div class="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl">
          <p class="text-xs text-amber-300 mb-1 font-medium">Total Value</p>
          <p class="text-2xl font-bold text-amber-400">₹{{ totalValue().toLocaleString('en-IN') }}</p>
        </div>
      </ng-container>

      <div chart-content class="w-full max-w-sm mx-auto">
        <canvas #chartCanvas></canvas>
      </div>

      <table table-content class="w-full text-left text-sm text-slate-300 whitespace-nowrap">
        <thead class="text-xs uppercase bg-white/5 text-slate-400 sticky top-0">
          <tr>
            <th class="px-6 py-3 font-medium">Year</th>
            <th class="px-6 py-3 font-medium">Invested Amount</th>
            <th class="px-6 py-3 font-medium">Wealth Gained</th>
            <th class="px-6 py-3 font-medium text-right">Total Value</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          @for (row of schedule(); track row.year) {
            <tr class="hover:bg-white/5 transition-colors">
              <td class="px-6 py-3">{{ row.year }}</td>
              <td class="px-6 py-3">₹{{ row.invested.toLocaleString('en-IN') }}</td>
              <td class="px-6 py-3 text-emerald-400">₹{{ row.gained.toLocaleString('en-IN') }}</td>
              <td class="px-6 py-3 text-right font-medium text-white">₹{{ row.total.toLocaleString('en-IN') }}</td>
            </tr>
          }
        </tbody>
      </table>
    </app-calculator-layout>
  `
})
export class SipCalculatorComponent implements AfterViewInit {
  monthlyInvestment = signal(10000);
  rate = signal(12);
  time = signal(10);

  totalInvestment = signal(0);
  expectedReturns = signal(0);
  totalValue = signal(0);
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
    const p = this.monthlyInvestment() || 0;
    const r = this.rate() || 0;
    const t = this.time() || 0;

    const i = r / 12 / 100; // monthly rate
    const n = t * 12;       // total months

    // SIP Formula: M = P × ({[1 + i]^n - 1} / i) × (1 + i)
    let maturity = 0;
    if (r === 0) {
      maturity = p * n;
    } else {
      maturity = Math.round(p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i));
    }

    const invested = p * n;
    const gained = maturity - invested;

    this.totalInvestment.set(invested);
    this.totalValue.set(maturity);
    this.expectedReturns.set(gained);

    // Yearly schedule
    const sched = [];
    for (let yr = 1; yr <= t; yr++) {
      const months = yr * 12;
      const inv = p * months;
      let val = 0;
      if (r === 0) {
        val = inv;
      } else {
        val = Math.round(p * ((Math.pow(1 + i, months) - 1) / i) * (1 + i));
      }
      sched.push({
        year: yr,
        invested: inv,
        gained: val - inv,
        total: val
      });
    }
    this.schedule.set(sched);
    this.updateChart();
  }

  initChart() {
    if (!this.chartCanvas) return;
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Invested Amount', 'Est. Returns'],
        datasets: [{
          data: [this.totalInvestment(), this.expectedReturns()],
          backgroundColor: ['#6366f1', '#10b981'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#cbd5e1' } }
        },
        cutout: '70%'
      }
    });
  }

  updateChart() {
    if (!this.chart) return;
    this.chart.data.datasets[0].data = [this.totalInvestment(), this.expectedReturns()];
    this.chart.update();
  }
}
