import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Category, CategoryType } from '../../models';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent {
  categories: Category[] = [];
  filterType: '' | CategoryType = '';
  form: Partial<Category> & { type?: CategoryType } = { name: '', type: 'SPEND' };

  constructor(private api: ApiService) { this.load(); }

  load() {
    const t = this.filterType || undefined;
    this.api.getCategories(t).subscribe(rows => this.categories = rows);
  }
  edit(c: Category) { this.form = { ...c }; }
  reset() { this.form = { name: '', type: 'SPEND' }; }
  save() {
    if (!this.form.name || !this.form.type) return;
    if (this.form.id) {
      this.api.updateCategory(this.form.id, { name: this.form.name, type: this.form.type })
        .subscribe(() => { this.reset(); this.load(); });
    } else {
      this.api.createCategory({ name: this.form.name, type: this.form.type })
        .subscribe(() => { this.reset(); this.load(); });
    }
  }
  remove(c: Category) {
    if (!confirm(`Delete "${c.name}"?`)) return;
    this.api.deleteCategory(c.id)
      .subscribe(() => this.load(), err => alert(err.error?.error || 'Delete failed'));
  }

}
