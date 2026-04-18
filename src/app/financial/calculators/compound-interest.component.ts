import { Component, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalculatorLayoutComponent } from './calculator-layout.component';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-compound-interest',
  standalone: true,
  imports: [CommonModule, FormsModule, CalculatorLayoutComponent],
  template: `
    <app-calculator-layout title="Compound Interest" subtitle="Calculate compounding returns over time" icon="🚀">
      <div form-content class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5">Principal Amount (₹)</label>
          <input type="number" [(ngModel)]="principal" (ngModelChange)="calculate()"
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
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5">Compounding Frequency</label>
          <select [(ngModel)]="frequency" (ngModelChange)="calculate()"
                  class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none">
            <option [ngValue]="1">Yearly</option>
            <option [ngValue]="2">Half-Yearly</option>
            <option [ngValue]="4">Quarterly</option>
            <option [ngValue]="12">Monthly</option>
          </select>
        </div>
      </div>

      <ng-container summary-cards>
        <div class="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-2xl">
          <p class="text-xs text-indigo-300 mb-1 font-medium">Principal Amount</p>
          <p class="text-2xl font-bold text-white">₹{{ principal().toLocaleString('en-IN') }}</p>
        </div>
        <div class="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl">
          <p class="text-xs text-emerald-300 mb-1 font-medium">Total Interest</p>
          <p class="text-2xl font-bold text-emerald-400">₹{{ totalInterest().toLocaleString('en-IN') }}</p>
        </div>
        <div class="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl">
          <p class="text-xs text-amber-300 mb-1 font-medium">Total Amount</p>
          <p class="text-2xl font-bold text-amber-400">₹{{ totalAmount().toLocaleString('en-IN') }}</p>
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
            <th class="px-6 py-3 font-medium">Interest Earned</th>
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
export class CompoundInterestComponent implements AfterViewInit {
  principal = signal(100000);
  rate = signal(10);
  time = signal(10);
  frequency = signal(1); // 1=yearly, 2=half-yearly, etc.

  totalInterest = signal(0);
  totalAmount = signal(0);
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
    const n = this.frequency();

    const amount = Math.round(p * Math.pow((1 + r / n), n * t));
    const interest = amount - p;

    this.totalInterest.set(interest);
    this.totalAmount.set(amount);

    // Yearly schedule
    const sched = [];
    let currentBal = p;
    for (let i = 1; i <= t; i++) {
      const closingBal = Math.round(currentBal * Math.pow((1 + r / n), n));
      sched.push({
        year: i,
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
      type: 'line',
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
    const principalData = this.schedule().map(() => this.principal());
    const interestData = this.schedule().map(s => s.closingBalance - this.principal());

    return {
      labels,
      datasets: [
        {
          label: 'Principal',
          data: principalData,
          borderColor: '#6366f1',
          backgroundColor: '#6366f140',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Total Interest',
          data: interestData,
          borderColor: '#10b981',
          backgroundColor: '#10b98140',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }
}
