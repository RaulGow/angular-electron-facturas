import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { InvoiceService } from '../../services/invoice.service';
import { ActionButtonComponent } from '../../components/action-button/action-button.component';

@Component({
  selector: 'app-factura-page',
  standalone: true,
  imports: [FormsModule, DecimalPipe, DatePipe, ActionButtonComponent],
  templateUrl: './factura-page.html',
  styleUrls: ['./factura-page.scss'],
})
export class FacturaPage implements OnInit {
  private invoiceService = inject(InvoiceService);

  // --- SIGNALS ---
  today = new Date();
  invoice = signal<any>(null);
  lineasFactura = signal<any[]>([]);
  customerData = signal<any>({
    nombre: 'Cliente Genérico',
    cif: '',
    direccion: '',
    poblacion: '',
    telefono: '',
    email: ''
  });
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
    console.log('Datos de la factura recibidos:', data);

    if (data) {
      this.invoice.set(data);
      this.invoiceDate.set(data.date);

      // 1. Mapeamos los datos del cliente (objeto enviado desde GenerationPage)
      if (data.customer) {
        this.customerData.set(data.customer);
      }

      // 2. Mapeamos los artículos
      if (data.items) {
        const itemsMapeados = data.items.map((item: any) => ({
          codigo: item.codigo,
          nombre: item.nombre,
          cantidad: Number(item.quantity),
          precio: Number(item.price)
        }));
        this.lineasFactura.set(itemsMapeados);
      }
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