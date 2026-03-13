import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';

@Component({
  selector: 'app-factura-page',
  standalone: true,
  imports: [FormsModule, DecimalPipe, DatePipe, CurrencyPipe, RouterLink],
  templateUrl: './factura-page.html',
  styleUrls: ['./factura-page.scss'],
})
export class FacturaPage implements OnInit {
  private invoiceService = inject(InvoiceService);

  // --- SIGNALS ---
  today = new Date();
  invoice = signal<any>(null);
  lineasFactura = signal<any[]>([]);
  customerName = signal<string>('Cliente Genérico');
  invoiceDate = signal<any>(new Date());

  // --- CÁLCULOS REACTIVOS ---
  totalBase = computed(() => {
    return this.lineasFactura().reduce((acc, item) => 
      acc + (Number(item.cantidad || 0) * Number(item.precio || 0)), 0
    );
  });

  totalIVA = computed(() => this.totalBase() * 0.10);
  totalFinal = computed(() => this.totalBase() + this.totalIVA());

  ngOnInit() {
    const data = this.invoiceService.getInvoiceData();
    
    if (data && data.items) {
      this.invoice.set(data);
      this.customerName.set(data.customer);
      this.invoiceDate.set(data.date);

      const itemsMapeados = data.items.map((item: any) => ({
        codigo: item.codigo, 
        nombre: item.nombre, // <--- Aquí 'item.nombre' ya vendrá como "Chorizo..."
        cantidad: Number(item.quantity),
        precio: Number(item.price)
      }));
      
      this.lineasFactura.set(itemsMapeados);
    }
  }

  // --- MÉTODOS PARA EL HTML ---
  getTotalLinea(item: any): number {
    return (Number(item.cantidad) || 0) * (Number(item.precio) || 0);
  }

  getTotalFactura(): number {
    return this.totalBase();
  }

  getIVA(): number {
    return this.totalIVA();
  }

  getTotalConIVA(): number {
    return this.totalFinal();
  }

  generarPDF() {
    const electron = (window as any).electronAPI;
    if (electron?.generatePDF) {
      electron.generatePDF();
    } else {
      alert('La generación de PDF solo está disponible en Electron');
    }
  }
}