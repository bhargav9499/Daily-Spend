import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Category, CategoryType } from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  // simple health check to verify API base URL
  health() {
    return this.http.get(this.base + '/', { responseType: 'text' });
  }

  // Categories
  getCategories(type?: CategoryType) {
    const url = type ? `${this.base}/api/categories?type=${type}` : `${this.base}/api/categories`;
    return this.http.get<Category[]>(url);
  }
  createCategory(body: { name: string; type: CategoryType }) {
    return this.http.post<Category>(`${this.base}/api/categories`, body);
  }
  updateCategory(id: number, body: { name: string; type: CategoryType }) {
    return this.http.put<Category>(`${this.base}/api/categories/${id}`, body);
  }
  deleteCategory(id: number) {
    return this.http.delete<{ ok: boolean }>(`${this.base}/api/categories/${id}`);
  }

  // Transactions
  createTxn(body: {
    type: 'SPEND' | 'INCOME';
    category_id: number;
    amount: number;
    txn_date: string;
    method?: string;
    note?: string;
  }) {
    return this.http.post(`${this.base}/api/transactions`, body);
  }

  getTxns(params: { year: number; month: number; type?: 'SPEND' | 'INCOME'; category_id?: number }) {
    const q = new URLSearchParams(params as any).toString();
    return this.http.get(`${this.base}/api/transactions?${q}`);
  }

  updateTxn(id: number, body: {
    type: 'SPEND' | 'INCOME';
    category_id: number;
    amount: number;
    txn_date: string;
    method?: string;
    note?: string;
  }) {
    return this.http.put(`${this.base}/api/transactions/${id}`, body);
  }

  deleteTxn(id: number) {
    return this.http.delete(`${this.base}/api/transactions/${id}`);
  }

}
