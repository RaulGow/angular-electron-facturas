import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe, KeyValuePipe } from '@angular/common';
import { InvoiceService } from '../../services/invoice.service';
import { ActionButtonComponent } from '../../components/action-button/action-button.component';

@Component({
  selector: 'app-factura-page',
  standalone: true,
  imports: [FormsModule, DecimalPipe, DatePipe, KeyValuePipe, ActionButtonComponent],
  templateUrl: './factura-page.html',
  styleUrls: ['./factura-page.scss'],
})
export class FacturaPage implements OnInit {
  private invoiceService = inject(InvoiceService);

  // --- SIGNALS ---
  today = new Date();
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

  // 1. Base Imponible Total (Suma de cantidad * precio de todas las líneas)
  totalBase = computed(() => {
    return this.lineasFactura().reduce((acc, item) =>
      acc + (Number(item.cantidad || 0) * Number(item.precio || 0)), 0
    );
  });

  // 2. Desglose de IVA: Agrupa por tipo (4, 10, etc.) y calcula base y cuota por separado
  desgloseIVA = computed(() => {
    const mapaIVA: { [key: number]: { base: number, cuota: number } } = {};

    this.lineasFactura().forEach(item => {
      const tipo = Number(item.iva) || 0;
      const subtotalLinea = Number(item.cantidad) * Number(item.precio);

      if (!mapaIVA[tipo]) {
        mapaIVA[tipo] = { base: 0, cuota: 0 };
      }

      mapaIVA[tipo].base += subtotalLinea;
      mapaIVA[tipo].cuota += (subtotalLinea * (tipo / 100));
    });

    return mapaIVA;
  });

  // 3. Suma total de todas las cuotas de IVA
  totalIVA = computed(() => {
    return Object.values(this.desgloseIVA()).reduce((acc, curr) => acc + curr.cuota, 0);
  });

  // 4. Total Final (Base + IVA)
  totalFinal = computed(() => this.totalBase() + this.totalIVA());

  ngOnInit() {
    const data = this.invoiceService.getInvoiceData();

    if (data) {
      this.invoiceDate.set(data.date);

      if (data.customer) {
        this.customerData.set(data.customer);
      }

      if (data.items) {
        // Mapeamos asegurándonos de que el IVA llega desde el formulario anterior
        const itemsMapeados = data.items.map((item: any) => ({
          codigo: item.codigo,
          nombre: item.nombre,
          cantidad: Number(item.quantity),
          precio: Number(item.price),
          iva: Number(item.iva || 0)
        }));
        this.lineasFactura.set(itemsMapeados);
      }
    }
  }

  // --- MÉTODOS AUXILIARES ---
  getTotalLinea(item: any): number {
    return (Number(item.cantidad) || 0) * (Number(item.precio) || 0);
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