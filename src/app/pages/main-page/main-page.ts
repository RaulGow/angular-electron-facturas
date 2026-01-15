import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './main-page.html',
  styleUrls: ['./main-page.scss'],
})
export class MainPage {

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

  // Líneas de la factura
  lineasFactura: any[] = [];

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
