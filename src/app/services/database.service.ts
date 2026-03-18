import { Injectable } from '@angular/core';
import { Categoria, Articulo, Cliente } from '../models/charcuteria.models';

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

  // ==========================================
  // CATEGORÍAS
  // ==========================================
  async getCategorias(): Promise<Categoria[]> {
    if (!this.api) {
      return [
        { id: 1, nombre: 'Jamones'}, { id: 2, nombre: 'Cocidos'},
        { id: 3, nombre: 'Embutidos' }, { id: 4, nombre: 'Precocinados'},
        { id: 5, nombre: 'Especias'}, { id: 6, nombre: 'Gourmet'},
        { id: 7, nombre: 'Quesos'}, { id: 8, nombre: 'Embutidos Frescos'},
        { id: 9, nombre: 'Aceites'}, { id: 10, nombre: 'Varios'}
      ];
    }
    try {
      return await this.api.getCategorias();
    } catch (error) {
      console.error('❌ Error al obtener categorias', error);
      return [];
    }
  }

  // ==========================================
  // UNIDADES DE MEDIDA (NUEVO)
  // ==========================================
  async getUnidades(): Promise<any[]> {
    if (!this.api) {
      return [
        { id: 1, descripcion: 'Kilogramos', abreviatura: 'kg' },
        { id: 2, descripcion: 'Gramos', abreviatura: 'g' },
        { id: 3, descripcion: 'Litros', abreviatura: 'L' },
        { id: 4, descripcion: 'Mililitros', abreviatura: 'ml' },
        { id: 5, descripcion: 'Unidades', abreviatura: 'ud' }
      ];
    }
    try {
      return await this.api.getUnidades();
    } catch (error) {
      console.error('❌ Error al obtener unidades', error);
      return [];
    }
  }

  // ==========================================
  // ARTÍCULOS (CON DATOS COMPLETOS)
  // ==========================================
  async getArticulos(): Promise<any[]> {
    if (!this.api) {
      console.warn('🌐 Navegador: Cargando datos de prueba completos');
      return [
        { id: 1, nombre: 'Jamón Serrano Gran Reserva (+15 meses)', categoria_id: 1, precio_venta: 18.50, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 45 },
        { id: 2, nombre: 'Jamón Serrano Bodega', categoria_id: 1, precio_venta: 14.20, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 60 },
        { id: 3, nombre: 'Jamón Ibérico Cebo (50% Raza Ibérica)', categoria_id: 1, precio_venta: 42.00, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 12 },
        { id: 4, nombre: 'Jamón Ibérico Cebo Campo (75% Raza Ibérica)', categoria_id: 1, precio_venta: 58.00, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 8 },
        { id: 5, nombre: 'Jamón Ibérico Bellota (100% Pata Negra)', categoria_id: 1, precio_venta: 95.00, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 5 },
        { id: 6, nombre: 'Jamón 5J 100% Ibérico Bellota', categoria_id: 1, precio_venta: 125.00, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 3 },
        { id: 7, nombre: 'Paleta Ibérica de Bellota (100% Raza Ibérica)', categoria_id: 1, precio_venta: 48.00, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 10 },
        { id: 8, nombre: 'Jamón York Extra (90% carne)', categoria_id: 2, precio_venta: 16.90, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 25 },
        { id: 9, nombre: 'Jamón Cocido Calidad Suprema', categoria_id: 2, precio_venta: 12.50, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 30 },
        { id: 10, nombre: 'Fiambre de Jamón (55% carne)', categoria_id: 2, precio_venta: 7.90, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 50 },
        { id: 11, nombre: 'Lomo Ibérico de Bellota', categoria_id: 3, precio_venta: 44.50, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 15 },
        { id: 12, nombre: 'Lomo Ibérico de Cebo', categoria_id: 3, precio_venta: 32.00, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 20 },
        { id: 13, nombre: 'Lomito Ibérico de Presa', categoria_id: 3, precio_venta: 52.00, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 10 },
        { id: 14, nombre: 'Chorizo Ibérico de Bellota Vela', categoria_id: 3, precio_venta: 19.50, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 25 },
        { id: 15, nombre: 'Chorizo de Cantimpalo', categoria_id: 3, precio_venta: 13.80, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 40 },
        { id: 16, nombre: 'Chorizo Picante de León', categoria_id: 3, precio_venta: 14.50, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 35 },
        { id: 17, nombre: 'Fuet dOlot Artesano', categoria_id: 3, precio_venta: 16.20, unidad_id: 5, unidad_abreviatura: 'ud', iva: 10, stock: 100 },
        { id: 18, nombre: 'Salami Milano', categoria_id: 3, precio_venta: 15.40, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 20 },
        { id: 19, nombre: 'Salami con Pimienta', categoria_id: 3, precio_venta: 16.80, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 18 },
        { id: 20, nombre: 'Salchichón de Vic', categoria_id: 3, precio_venta: 21.00, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 15 },
        { id: 21, nombre: 'Taquitos de Jamón Ibérico (150g)', categoria_id: 4, precio_venta: 6.50, unidad_id: 5, unidad_abreviatura: 'ud', iva: 10, stock: 80 },
        { id: 22, nombre: 'Jamón Ibérico Picado', categoria_id: 4, precio_venta: 12.90, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 10 },
        { id: 23, nombre: 'Hueso de Jamón Ibérico', categoria_id: 10, precio_venta: 1.50, unidad_id: 5, unidad_abreviatura: 'ud', iva: 10, stock: 200 },
        { id: 24, nombre: 'Orégano Seco en Hoja (50g)', categoria_id: 5, precio_venta: 2.20, unidad_id: 5, unidad_abreviatura: 'ud', iva: 10, stock: 50 },
        { id: 25, nombre: 'Pimentón Dulce de la Vera', categoria_id: 5, precio_venta: 3.75, unidad_id: 5, unidad_abreviatura: 'ud', iva: 10, stock: 40 },
        { id: 26, nombre: 'Pimentón Picante de la Vera', categoria_id: 5, precio_venta: 3.75, unidad_id: 5, unidad_abreviatura: 'ud', iva: 10, stock: 30 },
        { id: 27, nombre: 'Pasta de Trufa Negra (Tarro)', categoria_id: 6, precio_venta: 12.40, unidad_id: 5, unidad_abreviatura: 'ud', iva: 10, stock: 15 },
        { id: 28, nombre: 'Queso Manchego DOP (12 meses)', categoria_id: 7, precio_venta: 26.90, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 12 },
        { id: 29, nombre: 'Pechuga de Pavo Natural', categoria_id: 2, precio_venta: 14.90, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 22 },
        { id: 30, nombre: 'Chistorra de Navarra', categoria_id: 8, precio_venta: 9.50, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 40 },
        { id: 31, nombre: 'Sobrasada de Mallorca', categoria_id: 3, precio_venta: 18.20, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 15 },
        { id: 32, nombre: 'Mortadela de Bologna IGP', categoria_id: 2, precio_venta: 13.50, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 20 },
        { id: 33, nombre: 'Paté de Campaña al Armagnac', categoria_id: 6, precio_venta: 19.00, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 8 },
        { id: 34, nombre: 'Cabeza de Jabalí', categoria_id: 2, precio_venta: 11.40, unidad_id: 1, unidad_abreviatura: 'kg', iva: 10, stock: 12 },
        { id: 35, nombre: 'Aceite de Oliva VE (5L)', categoria_id: 9, precio_venta: 45.00, unidad_id: 5, unidad_abreviatura: 'ud', iva: 10, stock: 100 }
      ];
    }
    try {
      return await this.api.getArticulos();
    } catch (error) {
      console.error('❌ Error al obtener artículos', error);
      return [];
    }
  }

  async saveArticulo(articulo: any): Promise<number> {
    if (!this.api) return -1;
    try {
      return await this.api.saveArticulo(articulo);
    } catch (error) {
      console.error('❌ Error guardando artículo', error);
      return -1;
    }
  }

  // ==========================================
  // CLIENTES
  // ==========================================
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
      return await this.api.getClientes();
    } catch (error) {
      console.error('❌ Error al obtener clientes', error);
      return [];
    }
  }

  async deleteCliente(id: number): Promise<boolean> {
    if (!this.api) return false;
    try {
      return await this.api.deleteCliente(id);
    } catch (error) {
      console.error('❌ Error eliminando cliente', error);
      return false;
    }
  }

  // ==========================================
  // FACTURACIÓN
  // ==========================================
  async crearFactura(clienteId: number, items: any[], total: number): Promise<number> {
    if (!this.api) return -1;
    try {
      return await this.api.crearFactura({ clienteId, items, total });
    } catch (error) {
      console.error('❌ Error creando factura', error);
      return -1;
    }
  }

  // ==========================================
  // PDF
  // ==========================================
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