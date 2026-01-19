import { Injectable } from '@angular/core';
import { Articulo, Cliente } from '../models/charcuteria.models';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private api: any;

  constructor() {
    // Accedemos al objeto expuesto en el preload.js
    this.api = (window as any).charcuteriaAPI;

    if (!this.api) {
      console.error('El API de Electron no está disponible. ¿Estás en el navegador o en Electron?');
    }
  }

  // ARTÍCULOS
  async getArticulos(): Promise<Articulo[]> {
    if (!this.api) {
      console.warn('Simulando datos: Estás en el navegador');
      return [
        { id: 1, nombre: 'Jamón Serrano Gran Reserva (+15 meses)', precio_kilo: 18.50, stock: 100000 },
        { id: 2, nombre: 'Jamón Serrano Bodega', precio_kilo: 14.20, stock: 100000 },
        { id: 3, nombre: 'Jamón Ibérico Cebo (50% Raza Ibérica)', precio_kilo: 42.00, stock: 100000 },
        { id: 4, nombre: 'Jamón Ibérico Cebo Campo (75% Raza Ibérica)', precio_kilo: 58.00, stock: 100000 },
        { id: 5, nombre: 'Jamón Ibérico Bellota (100% Pata Negra)', precio_kilo: 95.00, stock: 100000 },
        { id: 6, nombre: 'Jamón 5J (Cinco Jotas) 100% Ibérico Bellota', precio_kilo: 125.00, stock: 100000 },
        { id: 7, nombre: 'Paleta Ibérica de Bellota (100% Raza Ibérica)', precio_kilo: 48.00, stock: 100000 },
        { id: 8, nombre: 'Jamón York Extra (90% carne)', precio_kilo: 16.90, stock: 100000 },
        { id: 9, nombre: 'Jamón Cocido Calidad Suprema (80% carne)', precio_kilo: 12.50, stock: 100000 },
        { id: 10, nombre: 'Fiambre de Jamón (55% carne)', precio_kilo: 7.90, stock: 100000 },
        { id: 11, nombre: 'Lomo Ibérico de Bellota', precio_kilo: 44.50, stock: 100000 },
        { id: 12, nombre: 'Lomo Ibérico de Cebo', precio_kilo: 32.00, stock: 100000 },
        { id: 13, nombre: 'Lomito Ibérico de Presa', precio_kilo: 52.00, stock: 100000 },
        { id: 14, nombre: 'Chorizo Ibérico de Bellota Vela', precio_kilo: 19.50, stock: 100000 },
        { id: 15, nombre: 'Chorizo de Cantimpalo', precio_kilo: 13.80, stock: 100000 },
        { id: 16, nombre: 'Chorizo Picante de León', precio_kilo: 14.50, stock: 100000 },
        { id: 17, nombre: 'Fuet dOlot Artesano', precio_kilo: 16.20, stock: 100000 },
        { id: 18, nombre: 'Salami Milano', precio_kilo: 15.40, stock: 100000 },
        { id: 19, nombre: 'Salami con Pimienta', precio_kilo: 16.80, stock: 100000 },
        { id: 20, nombre: 'Salchichón de Vic', precio_kilo: 21.00, stock: 100000 },
        { id: 21, nombre: 'Taquitos de Jamón Ibérico (Sobre vacío 150g)', precio_kilo: 6.50, stock: 100000 },
        { id: 22, nombre: 'Jamón Ibérico Picado (Saquito para cocinar)', precio_kilo: 12.90, stock: 100000 },
        { id: 23, nombre: 'Hueso de Jamón Ibérico (Unidad)', precio_kilo: 1.50, stock: 100000 },
        { id: 24, nombre: 'Orégano Seco en Hoja (Bote 50g)', precio_kilo: 2.20, stock: 100000 },
        { id: 25, nombre: 'Pimentón Dulce de la Vera', precio_kilo: 3.75, stock: 100000 },
        { id: 26, nombre: 'Pimentón Picante de la Vera', precio_kilo: 3.75, stock: 100000 },
        { id: 27, nombre: 'Pesta de Trufa Negra (Tarro)', precio_kilo: 12.40, stock: 100000 },
        { id: 28, nombre: 'Queso Manchego DOP (12 meses maduración)', precio_kilo: 26.90, stock: 100000 },
        { id: 29, nombre: 'Pechuga de Pavo Natural (95% libre grasa)', precio_kilo: 14.90, stock: 100000 },
        { id: 30, nombre: 'Chistorra de Navarra', precio_kilo: 9.50, stock: 100000 },
        { id: 31, nombre: 'Sobrasada de Mallorca de Cerdo Negro', precio_kilo: 18.20, stock: 100000 },
        { id: 32, nombre: 'Mortadela de Bologna IGP', precio_kilo: 13.50, stock: 100000 },
        { id: 33, nombre: 'Paté de Campaña al Armagnac', precio_kilo: 19.00, stock: 100000 },
        { id: 34, nombre: 'Cabeza de Jabalí', precio_kilo: 11.40, stock: 100000 },
        { id: 35, nombre: 'Aceite de Oliva VE (5 Litros)', precio_kilo: 45.00, stock: 100000 }
      ];
    }
    return await this.api.getArticulos();
  }

  async guardarArticulo(articulo: Articulo): Promise<number> {
    return await this.api.saveArticulo(articulo);
  }

  // CLIENTES
  async getClientes(): Promise<Cliente[]> {
    return await this.api.getClientes();
  }

  // FACTURACIÓN
  async crearFactura(clienteId: number, items: any[], total: number): Promise<number> {
    return await this.api.crearFactura({ clienteId, items, total });
  }

  // Guardar Cliente
  async guardarCliente(cliente: { nombre: string }): Promise<number> {
    // En Electron main.js deberías crear el handle para 'save-cliente'
    return await this.api.saveCliente(cliente);
  }

  // PDF (El que ya tenías)
  async generarPDF(): Promise<string> {
    return await this.api.generatePDF();
  }
}
