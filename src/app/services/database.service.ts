import { Injectable } from '@angular/core';
import { Articulo, Cliente } from '../models/charcuteria.models';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private api = (window as any).electronAPI;

  constructor() {
    if (!this.api) {
      console.warn('⚠️ Ejecutando en navegador (sin Electron)');
    }
  }

  // ARTÍCULOS
  async getArticulos(): Promise<Articulo[]> {
    // Si NO estamos en Electron (ng serve)
    if (!this.api) {
      console.warn('🌐 Navegador: Cargando datos de prueba');
      return [
        { id: 1, nombre: 'Jamón Serrano Gran Reserva (+15 meses)', categoria: 'Jamones', precio_venta: 18.50, unidadMedida: 'kg', iva: 10, stock: 45 },
        { id: 2, nombre: 'Jamón Serrano Bodega', categoria: 'Jamones', precio_venta: 14.20, unidadMedida: 'kg', iva: 10, stock: 60 },
        { id: 3, nombre: 'Jamón Ibérico Cebo (50% Raza Ibérica)', categoria: 'Jamones', precio_venta: 42.00, unidadMedida: 'kg', iva: 10, stock: 12 },
        { id: 4, nombre: 'Jamón Ibérico Cebo Campo (75% Raza Ibérica)', categoria: 'Jamones', precio_venta: 58.00, unidadMedida: 'kg', iva: 10, stock: 8 },
        { id: 5, nombre: 'Jamón Ibérico Bellota (100% Pata Negra)', categoria: 'Jamones', precio_venta: 95.00, unidadMedida: 'kg', iva: 10, stock: 5 },
        { id: 6, nombre: 'Jamón 5J 100% Ibérico Bellota', categoria: 'Jamones', precio_venta: 125.00, unidadMedida: 'kg', iva: 10, stock: 3 },
        { id: 7, nombre: 'Paleta Ibérica de Bellota (100% Raza Ibérica)', categoria: 'Jamones', precio_venta: 48.00, unidadMedida: 'kg', iva: 10, stock: 10 },
        { id: 8, nombre: 'Jamón York Extra (90% carne)', categoria: 'Cocidos', precio_venta: 16.90, unidadMedida: 'kg', iva: 10, stock: 25 },
        { id: 9, nombre: 'Jamón Cocido Calidad Suprema', categoria: 'Cocidos', precio_venta: 12.50, unidadMedida: 'kg', iva: 10, stock: 30 },
        { id: 10, nombre: 'Fiambre de Jamón (55% carne)', categoria: 'Cocidos', precio_venta: 7.90, unidadMedida: 'kg', iva: 10, stock: 50 },
        { id: 11, nombre: 'Lomo Ibérico de Bellota', categoria: 'Embutidos', precio_venta: 44.50, unidadMedida: 'kg', iva: 10, stock: 15 },
        { id: 12, nombre: 'Lomo Ibérico de Cebo', categoria: 'Embutidos', precio_venta: 32.00, unidadMedida: 'kg', iva: 10, stock: 20 },
        { id: 13, nombre: 'Lomito Ibérico de Presa', categoria: 'Embutidos', precio_venta: 52.00, unidadMedida: 'kg', iva: 10, stock: 10 },
        { id: 14, nombre: 'Chorizo Ibérico de Bellota Vela', categoria: 'Embutidos', precio_venta: 19.50, unidadMedida: 'kg', iva: 10, stock: 25 },
        { id: 15, nombre: 'Chorizo de Cantimpalo', categoria: 'Embutidos', precio_venta: 13.80, unidadMedida: 'kg', iva: 10, stock: 40 },
        { id: 16, nombre: 'Chorizo Picante de León', categoria: 'Embutidos', precio_venta: 14.50, unidadMedida: 'kg', iva: 10, stock: 35 },
        { id: 17, nombre: 'Fuet dOlot Artesano', categoria: 'Embutidos', precio_venta: 16.20, unidadMedida: 'ud', iva: 10, stock: 100 },
        { id: 18, nombre: 'Salami Milano', categoria: 'Embutidos', precio_venta: 15.40, unidadMedida: 'kg', iva: 10, stock: 20 },
        { id: 19, nombre: 'Salami con Pimienta', categoria: 'Embutidos', precio_venta: 16.80, unidadMedida: 'kg', iva: 10, stock: 18 },
        { id: 20, nombre: 'Salchichón de Vic', categoria: 'Embutidos', precio_venta: 21.00, unidadMedida: 'kg', iva: 10, stock: 15 },
        { id: 21, nombre: 'Taquitos de Jamón Ibérico (150g)', categoria: 'Precocinados', precio_venta: 6.50, unidadMedida: 'ud', iva: 10, stock: 80 },
        { id: 22, nombre: 'Jamón Ibérico Picado', categoria: 'Precocinados', precio_venta: 12.90, unidadMedida: 'kg', iva: 10, stock: 10 },
        { id: 23, nombre: 'Hueso de Jamón Ibérico', categoria: 'Varios', precio_venta: 1.50, unidadMedida: 'ud', iva: 10, stock: 200 },
        { id: 24, nombre: 'Orégano Seco en Hoja (50g)', categoria: 'Especias', precio_venta: 2.20, unidadMedida: 'ud', iva: 10, stock: 50 },
        { id: 25, nombre: 'Pimentón Dulce de la Vera', categoria: 'Especias', precio_venta: 3.75, unidadMedida: 'ud', iva: 10, stock: 40 },
        { id: 26, nombre: 'Pimentón Picante de la Vera', categoria: 'Especias', precio_venta: 3.75, unidadMedida: 'ud', iva: 10, stock: 30 },
        { id: 27, nombre: 'Pasta de Trufa Negra (Tarro)', categoria: 'Gourmet', precio_venta: 12.40, unidadMedida: 'ud', iva: 10, stock: 15 },
        { id: 28, nombre: 'Queso Manchego DOP (12 meses)', categoria: 'Quesos', precio_venta: 26.90, unidadMedida: 'kg', iva: 10, stock: 12 },
        { id: 29, nombre: 'Pechuga de Pavo Natural', categoria: 'Cocidos', precio_venta: 14.90, unidadMedida: 'kg', iva: 10, stock: 22 },
        { id: 30, nombre: 'Chistorra de Navarra', categoria: 'Embutidos Frescos', precio_venta: 9.50, unidadMedida: 'kg', iva: 10, stock: 40 },
        { id: 31, nombre: 'Sobrasada de Mallorca', categoria: 'Embutidos', precio_venta: 18.20, unidadMedida: 'kg', iva: 10, stock: 15 },
        { id: 32, nombre: 'Mortadela de Bologna IGP', categoria: 'Cocidos', precio_venta: 13.50, unidadMedida: 'kg', iva: 10, stock: 20 },
        { id: 33, nombre: 'Paté de Campaña al Armagnac', categoria: 'Gourmet', precio_venta: 19.00, unidadMedida: 'kg', iva: 10, stock: 8 },
        { id: 34, nombre: 'Cabeza de Jabalí', categoria: 'Cocidos', precio_venta: 11.40, unidadMedida: 'kg', iva: 10, stock: 12 },
        { id: 35, nombre: 'Aceite de Oliva VE (5L)', categoria: 'Aceites', precio_venta: 45.00, unidadMedida: 'ud', iva: 10, stock: 100 }
    ];
  }
    try {
      // Usamos "this.api!" para decirle a TS: "Tranquilo, sé que aquí existe"
      const articulos = await this.api!.getArticulos();
      return articulos;
    } catch (error) {
      console.error('❌ Error al obtener artículos', error);
      return [];
    }
  }

  async guardarArticulo(articulo: Articulo): Promise<number> {
    if (!this.api) return -1;

    try {
      return await this.api.saveArticulo(articulo);
    } catch (error) {
      console.error('❌ Error guardando artículo', error);
      return -1;
    }
  }

  // CLIENTES
  async saveCliente(cliente: Cliente): Promise<number> {
    if (!this.api) return -1;

    try {
      return await this.api.saveCliente(cliente);
    } catch (error) {
      console.error('❌ Error guardando cliente', error);
      return -1;
    }
  }

  async getClientes(): Promise<Cliente[]> {
    if (!this.api) return [];

    try {
      const clientes = await this.api.getClientes();
      console.log('📦 Clientes recibidos:', clientes);
      return clientes;
    } catch (error) {
      console.error('❌ Error al obtener clientes', error);
      return [];
    }
  }

  // FACTURACIÓN
  async crearFactura(clienteId: number, items: any[], total: number): Promise<number> {
    if (!this.api) return -1;

    try {
      return await this.api.crearFactura({ clienteId, items, total });
    } catch (error) {
      console.error('❌ Error creando factura', error);
      return -1;
    }
  }

  // PDF
  async generarPDF(): Promise<string> {
    if (!this.api) return '';

    try {
      return await this.api.generatePDF();
    } catch (error) {
      console.error('❌ Error generando PDF', error);
      return '';
    }
  }
}
