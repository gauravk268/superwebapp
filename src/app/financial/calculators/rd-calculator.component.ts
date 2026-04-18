import { Component, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalculatorLayoutComponent } from './calculator-layout.component';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-rd-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, CalculatorLayoutComponent],
  template: `
    <app-calculator-layout title="RD Calculator" subtitle="Recurring Deposit" icon="🔄">
      <div form-content class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5">Monthly Installment (₹)</label>
          <input type="number" [(ngModel)]="monthlyDeposit" (ngModelChange)="calculate()"
                 class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5">Rate of Interest (% p.a.)</label>
          <input type="number" [(ngModel)]="rate" (ngModelChange)="calculate()" step="0.1"
                 class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5">Time Period (Years)</label>
          <input type="number" [(ngModel)]="time" (ngModelChange)="calculate()"
                 class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
          <input type="range" [(ngModel)]="time" (ngModelChange)="calculate()" min="1" max="10" class="w-full mt-3 accent-indigo-500">
        </div>
      </div>

      <ng-container summary-cards>
        <div class="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-2xl">
          <p class="text-xs text-indigo-300 mb-1 font-medium">Total Investment</p>
          <p class="text-2xl font-bold text-white">₹{{ totalInvestment().toLocaleString('en-IN') }}</p>
        </div>
        <div class="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl">
          <p class="text-xs text-emerald-300 mb-1 font-medium">Total Interest Earned</p>
          <p class="text-2xl font-bold text-emerald-400">₹{{ expectedReturns().toLocaleString('en-IN') }}</p>
        </div>
        <div class="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl">
          <p class="text-xs text-amber-300 mb-1 font-medium">Maturity Value</p>
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
            <th class="px-6 py-3 font-medium">Total Deposited</th>
            <th class="px-6 py-3 font-medium">Interest Earned</th>
            <th class="px-6 py-3 font-medium text-right">Balance</th>
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
export class RdCalculatorComponent implements AfterViewInit {
  monthlyDeposit = signal(5000);
  rate = signal(6.5);
  time = signal(5);

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
    const p = this.monthlyDeposit() || 0;
    const r = this.rate() || 0;
    const t = this.time() || 0;

    const n = t * 12; // total months
    const i = r / 400; // quarterly rate

    // Standard RD uses quarterly compounding, but deposits are monthly.
    // Maturity value formula for RD with quarterly compounding:
    // M = P * [ (1+i)^n - 1 ] / [ 1 - (1+i)^(-1/3) ] 
    // where n is quarters, which makes it complex. 
    // Let's use standard iterative monthly calculation with quarterly compounding logic.
    
    let maturity = 0;
    let balance = 0;
    let totalInt = 0;

    const sched = [];
    
    for (let yr = 1; yr <= t; yr++) {
      let yrInt = 0;
      for (let month = 1; month <= 12; month++) {
        balance += p; // deposit at beginning of month
        // In actual bank RD, interest is calculated quarterly. 
        // For simplicity and approximation across banks, we will use monthly compounding (r/1200).
        const mInt = balance * (r / 1200);
        balance += mInt;
        yrInt += mInt;
      }
      sched.push({
        year: yr,
        invested: yr * 12 * p,
        gained: Math.round(balance - (yr * 12 * p)),
        total: Math.round(balance)
      });
    }

    const invested = p * n;
    this.totalInvestment.set(invested);
    this.totalValue.set(Math.round(balance));
    this.expectedReturns.set(Math.round(balance - invested));
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
