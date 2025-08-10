import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Category, CategoryType, Transaction } from '../../models';

type EditForm = {
  id: number;
  type: CategoryType;
  category_id: number;
  amount: number;
  txn_date: string;
  method?: string;
  note?: string;
};

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent {
  // filters
  year = new Date().getFullYear();
  month = new Date().getMonth() + 1;
  typeFilter: '' | CategoryType = '';
  categoryFilter?: number;

  // data
  transactions: Transaction[] = [];
  categories: Category[] = [];

  // edit
  editForm?: EditForm;
  saving = false;
  msg = '';

  constructor(private api: ApiService) {
    this.load();
    this.loadCategories();
  }

  pad(n: number) { return String(n).padStart(2, '0'); }

  load() {
    const params: any = { year: this.year, month: this.month };
    if (this.typeFilter) params.type = this.typeFilter;
    if (this.categoryFilter) params.category_id = this.categoryFilter;
    this.api.getTxns(params).subscribe((rows: any) => this.transactions = rows as Transaction[]);
  }

  loadCategories() {
    if (this.typeFilter) {
      this.api.getCategories(this.typeFilter).subscribe(rows => this.categories = rows);
    } else {
      this.api.getCategories('SPEND').subscribe(sp =>
        this.api.getCategories('INCOME').subscribe(inc => this.categories = [...sp, ...inc]));
    }
  }

  onTypeFilterChange() {
    this.categoryFilter = undefined;
    this.loadCategories();
  }

  edit(row: Transaction) {
    this.editForm = {
      id: row.id,
      type: row.type,
      category_id: row.category_id,
      amount: row.amount,
      txn_date: row.txn_date,
      method: row.method || '',
      note: row.note || ''
    };
    this.typeFilter = row.type;
    this.onTypeFilterChange();
  }

  cancelEdit() {
    this.editForm = undefined;
    this.msg = '';
  }

  saveEdit() {
    if (!this.editForm) return;
    const f = this.editForm;
    if (!f.category_id || f.amount == null || f.amount < 0 || !/^\d{4}-\d{2}-\d{2}$/.test(f.txn_date)) {
      this.msg = 'Please fill all required fields.';
      return;
    }
    this.saving = true;
    this.api.updateTxn(f.id, {
      type: f.type,
      category_id: f.category_id,
      amount: Number(f.amount),
      txn_date: f.txn_date,
      method: f.method,
      note: f.note
    }).subscribe({
      next: () => {
        this.saving = false;
        this.msg = 'Updated!';
        this.editForm = undefined;
        this.load();
      },
      error: (e) => {
        this.saving = false;
        this.msg = e?.error?.error || 'Update failed';
      }
    });
  }

  remove(row: Transaction) {
    if (!confirm('Delete this transaction?')) return;
    this.api.deleteTxn(row.id).subscribe({
      next: () => this.load(),
      error: (e) => alert(e?.error?.error || 'Delete failed')
    });
  }

  years(): number[] {
    const y = new Date().getFullYear();
    return [y - 2, y - 1, y, y + 1];
  }
  months(): number[] { return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; }

}
