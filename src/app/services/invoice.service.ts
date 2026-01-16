// invoice.service.ts
import { Injectable } from '@angular/core';
import { Invoice } from '../interfaces/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private currentInvoice: Invoice | null = null;

  setInvoiceData(data: Invoice) {
    // Calculamos totales antes de guardar
    const totalAmount = data.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    this.currentInvoice = { ...data, totalAmount };
  }

  getInvoiceData() {
    return this.currentInvoice;
  }
}
