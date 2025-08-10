import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Category, CategoryType } from '../../models';

type FormModel = {
  type: CategoryType;
  category_id?: number;
  amount?: number;
  txn_date: string;
  method?: string;
  note?: string;
};

@Component({
  selector: 'app-add-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-entry.component.html',
  styleUrl: './add-entry.component.scss'
})
export class AddEntryComponent {
  // form state
  form: FormModel = {
    type: 'SPEND',
    txn_date: new Date().toISOString().slice(0, 10)
  };
  saving = false;
  message = '';

  // categories
  categories: Category[] = [];

  constructor(private api: ApiService) {
    this.loadCategories();
  }

  loadCategories() {
    this.api.getCategories(this.form.type).subscribe(rows => {
      this.categories = rows;
      if (!rows.find(c => c.id === this.form.category_id)) {
        this.form.category_id = undefined;
      }
    });
  }

  onTypeChange() {
    this.loadCategories();
  }

  reset() {
    this.form = {
      type: this.form.type,
      txn_date: new Date().toISOString().slice(0, 10)
    };
    this.message = '';
  }

  save() {
    this.message = '';
    if (!this.form.category_id || !this.form.amount || this.form.amount < 0 || !this.form.txn_date) {
      this.message = 'Please fill all required fields.';
      return;
    }
    this.saving = true;
    this.api.createTxn({
      type: this.form.type,
      category_id: this.form.category_id,
      amount: Number(this.form.amount),
      txn_date: this.form.txn_date,
      method: this.form.method,
      note: this.form.note
    }).subscribe({
      next: () => {
        this.saving = false;
        this.message = 'Saved!';
        this.reset();
      },
      error: (e) => {
        this.saving = false;
        this.message = e?.error?.error || 'Save failed';
      }
    });
  }

}
