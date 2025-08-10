import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Transaction } from '../../models';

type Row = { category: string; total: number };

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  year = new Date().getFullYear();
  month = new Date().getMonth() + 1;

  totalSpend = 0;
  totalIncome = 0;
  net = 0;

  spendByCat: Row[] = [];
  incomeByCat: Row[] = [];

  transactions: Transaction[] = [];

  constructor(private api: ApiService) { this.load(); }

  pad(n: number) { return String(n).padStart(2, '0'); }
  years() { const y = new Date().getFullYear(); return [y - 2, y - 1, y, y + 1]; }
  months() { return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; }

  load() {
    this.api.getTxns({ year: this.year, month: this.month }).subscribe((rows: any) => {
      this.transactions = rows as Transaction[];
      this.compute();
    });
  }

  private compute() {
    this.totalSpend = 0;
    this.totalIncome = 0;
    const spendMap = new Map<string, number>();
    const incomeMap = new Map<string, number>();

    for (const t of this.transactions) {
      if (t.type === 'SPEND') {
        this.totalSpend += Number(t.amount);
        spendMap.set(t.category_name, (spendMap.get(t.category_name) || 0) + Number(t.amount));
      } else {
        this.totalIncome += Number(t.amount);
        incomeMap.set(t.category_name, (incomeMap.get(t.category_name) || 0) + Number(t.amount));
      }
    }
    this.net = this.totalIncome - this.totalSpend;

    const toRows = (m: Map<string, number>) =>
      Array.from(m.entries()).map(([category, total]) => ({ category, total }))
        .sort((a, b) => b.total - a.total);

    this.spendByCat = toRows(spendMap);
    this.incomeByCat = toRows(incomeMap);
  }

}
