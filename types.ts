
export enum TransactionStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE'
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: TransactionStatus;
  entity: string;
  bank?: string;
}

export interface Investment {
  id: string;
  institution: string;
  type: string;
  investedAmount: number;
  currentAmount: number;
  yield: number;
}

export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  nome: string;
  email: string;
  celular: string;
  funcao: string;
  role: UserRole;
  password?: string;
  isFirstAccess: boolean;
}
