import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Invoice } from '../../interfaces/invoice.model';
import { InvoiceService } from '../../services/invoice.service';

@Component({
  selector: 'app-factura-page',
  standalone: true,
  imports: [FormsModule, DecimalPipe, DatePipe, RouterLink],
  templateUrl: './factura-page.html',
  styleUrls: ['./factura-page.scss'],
})
export class FacturaPage implements OnInit {

  invoice: Invoice | null = null;
  lineasFactura: any[] = [];
  customerName: string = 'Cliente Genérico';
  invoiceDate: string = '';

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit() {
    this.invoice = this.invoiceService.getInvoiceData();
    if (this.invoice) {
      console.log('Datos recibidos en Factura:', this.invoice);

      // 2. Mapeamos los datos recibidos a tus variables locales
      this.customerName = this.invoice.customer;
      this.invoiceDate = this.invoice.date instanceof Date ? this.invoice.date.toISOString().split('T')[0] : this.invoice.date;

      // Adaptamos el formato de los items del formulario a tu tabla
      this.lineasFactura = this.invoice.items.map((item: any) => ({
        codigo: item.codigo,
        nombre: item.description,
        cantidad: item.quantity,
        precio: item.price
      }));
    }
  }

  today = new Date();

  // Artículos disponibles (puede venir de JSON/BBDD)
  disponibles = [
    { codigo: "PROD-00000001", nombre: "Jamón Serrano Reserva", precio: 18.90 },
    { codigo: "PROD-00000002", nombre: "Chorizo Ibérico de Bellota", precio: 16.50 },
    { codigo: "PROD-00000003", nombre: "Salchichón Extra", precio: 14.20 },
    { codigo: "PROD-00000004", nombre: "Lomo Embuchado", precio: 21.80 },
    { codigo: "PROD-00000005", nombre: "Queso Manchego Curado", precio: 25.40 },
    { codigo: "PROD-00000006", nombre: "Aceite de Oliva Virgen Extra", precio: 9.75 },
    { codigo: "PROD-00000007", nombre: "Vino Tinto Reserva", precio: 12.30 },
    { codigo: "PROD-00000008", nombre: "Pimentón de la Vera", precio: 4.50 }
  ];

  // Formulario temporal
  articuloSeleccionado: any = null;
  cantidadSeleccionada: number = 0;

  // Añadir línea a la factura
  agregarLinea() {
    if (!this.articuloSeleccionado || this.cantidadSeleccionada <= 0) {
      alert('Selecciona un artículo y una cantidad válida');
      return;
    }

    const nuevaLinea = {
      ...this.articuloSeleccionado,
      cantidad: this.cantidadSeleccionada
    };

    this.lineasFactura.push(nuevaLinea);

    // Reiniciar selección
    this.articuloSeleccionado = null;
    this.cantidadSeleccionada = 0;
  }

  // Cálculos
  getTotalLinea(item: any): number {
    return item.cantidad * item.precio;
  }

  getTotalFactura(): number {
    return this.lineasFactura.reduce(
      (total, item) => total + this.getTotalLinea(item),
      0
    );
  }

  getIVA(): number {
    return this.getTotalFactura() * 0.10;
  }

  getTotalConIVA(): number {
    return this.getTotalFactura() + this.getIVA();
  }

  // Generar PDF con Electron
  generarPDF() {
    const electron = (window as any).electronAPI;
    if (electron?.generatePDF) {
      electron.generatePDF();
    } else {
      alert('La generación de PDF solo está disponible en Electron');
    }
  }
}
