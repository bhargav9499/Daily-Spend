export type CategoryType = 'SPEND' | 'INCOME';
export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  created_at: string;
}

export interface Transaction {
  id: number;
  type: CategoryType;
  category_id: number;
  category_name: string;
  amount: number;
  method?: string | null;
  note?: string | null;
  txn_date: string;
  created_at: string;
}
