import { Routes } from '@angular/router';
import { CategoriesComponent } from './pages/categories/categories.component';
import { AddEntryComponent } from './pages/add-entry/add-entry.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'add', component: AddEntryComponent },
    { path: 'transactions', component: TransactionsComponent },
    { path: 'categories', component: CategoriesComponent },
    { path: '**', redirectTo: 'dashboard' }
];
