import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define the Transaction interface to type the response
export interface Transaction {
  id: number;
  title: string;
  description: string;
  amount: number;
  status: string;
  transaction_id: string;
  request_id: string;
  customer_id: string;
  payment_status: string;
  payment_date: string;
}


@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private apiUrl = 'http://localhost:8000/api/transactions';

  constructor(private http: HttpClient) {}

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl);
  }

  updateTransaction(transactionId: number, status: string): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${transactionId}`, { payment_status: status });
  }
}
