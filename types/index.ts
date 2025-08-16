export interface User {
  name: string;
  money: number;
}

export interface Action {
  debitor: string;
  creditor: string;
  money: number;
}

export interface Transaction {
  debitor: string;
  creditor: string;
  money: number;
}
