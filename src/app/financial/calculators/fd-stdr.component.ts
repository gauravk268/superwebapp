import { Component, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalculatorLayoutComponent } from './calculator-layout.component';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-fd-stdr',
  standalone: true,
  imports: [CommonModule, FormsModule, CalculatorLayoutComponent],
  template: `
    <app-calculator-layout title="FD STDR Calculator" subtitle="Fixed Deposit - Cumulative (Interest Reinvested)" icon="💰">
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
          <input type="range" [(ngModel)]="time" (ngModelChange)="calculate()" min="1" max="20" class="w-full mt-3 accent-indigo-500">
        </div>
      </div>

      <ng-container summary-cards>
        <div class="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-2xl">
          <p class="text-xs text-indigo-300 mb-1 font-medium">Principal Amount</p>
          <p class="text-2xl font-bold text-white">₹{{ principal().toLocaleString('en-IN') }}</p>
        </div>
        <div class="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl">
          <p class="text-xs text-emerald-300 mb-1 font-medium">Total Interest Earned</p>
          <p class="text-2xl font-bold text-emerald-400">₹{{ totalInterest().toLocaleString('en-IN') }}</p>
        </div>
        <div class="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl">
          <p class="text-xs text-amber-300 mb-1 font-medium">Maturity Amount</p>
          <p class="text-2xl font-bold text-amber-400">₹{{ maturityAmount().toLocaleString('en-IN') }}</p>
        </div>
      </ng-container>

      <div chart-content class="w-full max-w-sm mx-auto">
        <canvas #chartCanvas></canvas>
      </div>

      <table table-content class="w-full text-left text-sm text-slate-300 whitespace-nowrap">
        <thead class="text-xs uppercase bg-white/5 text-slate-400 sticky top-0">
          <tr>
            <th class="px-6 py-3 font-medium">Year</th>
            <th class="px-6 py-3 font-medium">Opening Balance</th>
            <th class="px-6 py-3 font-medium">Interest Earned (Compounded)</th>
            <th class="px-6 py-3 font-medium text-right">Closing Balance</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          @for (row of schedule(); track row.year) {
            <tr class="hover:bg-white/5 transition-colors">
              <td class="px-6 py-3">{{ row.year }}</td>
              <td class="px-6 py-3">₹{{ row.openingBalance.toLocaleString('en-IN') }}</td>
              <td class="px-6 py-3 text-emerald-400">₹{{ row.interestEarned.toLocaleString('en-IN') }}</td>
              <td class="px-6 py-3 text-right font-medium text-white">₹{{ row.closingBalance.toLocaleString('en-IN') }}</td>
            </tr>
          }
        </tbody>
      </table>
    </app-calculator-layout>
  `
})
export class FdStdrComponent implements AfterViewInit {
  principal = signal(100000);
  rate = signal(7.5);
  time = signal(5);

  totalInterest = signal(0);
  maturityAmount = signal(0);
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
    const r = (this.rate() || 0) / 100;
    const t = this.time() || 0;
    const n = 4; // STDR typically compounds quarterly

    const maturity = Math.round(p * Math.pow((1 + r / n), n * t));
    const interest = maturity - p;

    this.totalInterest.set(interest);
    this.maturityAmount.set(maturity);

    const sched = [];
    let currentBal = p;
    for (let yr = 1; yr <= t; yr++) {
      const closingBal = Math.round(currentBal * Math.pow((1 + r / n), n));
      sched.push({
        year: yr,
        openingBalance: Math.round(currentBal),
        interestEarned: closingBal - Math.round(currentBal),
        closingBalance: closingBal
      });
      currentBal = closingBal;
    }
    this.schedule.set(sched);
    this.updateChart();
  }

  initChart() {
    if (!this.chartCanvas) return;
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Deposit Amount', 'Total Interest'],
        datasets: [{
          data: [this.principal(), this.totalInterest()],
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
    this.chart.data.datasets[0].data = [this.principal(), this.totalInterest()];
    this.chart.update();
  }
}
