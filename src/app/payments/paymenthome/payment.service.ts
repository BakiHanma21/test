import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private apiUrl = 'https://checkout-test.adyen.com/v67/payments'; // Replace with your API endpoint

  constructor(private http: HttpClient) {}

  createPayment(amount: number, currency: string, type: string): Observable<any> {
    const body = {
      merchantAccount: 'YOUR_MERCHANT_ACCOUNT', // Replace with your actual merchant account
      amount: {
        currency: currency,
        value: amount,
      },
      paymentMethod: {
        type: type, // e.g., 'gcash'
      },
      reference: 'YOUR_ORDER_REFERENCE',
      returnUrl: 'https://your-angular-app.com/payment-success',
    };

    return this.http.post(this.apiUrl, body);
  }
}
