// invoice.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { Invoice } from '../interfaces/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  // 1. Inicializamos el signal como null o un objeto vacío tipado
  private _currentInvoice = signal<Invoice | null>(null);

  // 2. Exponemos una versión de solo lectura para los componentes
  public currentInvoice = this._currentInvoice.asReadonly();

  // 3. Opcional: Un signal computado para el total (si no quieres calcularlo manualmente)
  public totalAmount = computed(() => {
    const invoice = this._currentInvoice();
    return invoice ? invoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0) : 0;
  });

  setInvoiceData(data: Omit<Invoice, 'totalAmount'>) {
    // Calculamos el total
    const totalAmount = data.items.reduce(
      (acc, item) => acc + (item.quantity * item.price),
      0
    );

    // 4. Actualizamos el valor del signal
    this._currentInvoice.set({
      ...data,
      totalAmount
    } as Invoice);
  }

  getInvoiceData() {
    return this._currentInvoice();
  }
}