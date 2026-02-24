export interface Categoria {
  id: number;
  nombre: string;
}
export interface Articulo {
  id: number;
  nombre: string;
  categoria_id: number;
  precio_venta: number;
  unidadMedida: string;
  iva: number;
  stock: number;
}

export interface Cliente {
  id?: number;
  nombre: string;
  nombre_fiscal: string;
  cif: string;
  telefono?: string;
  calle?: string;
  codigo_postal?: string;
  poblacion?: string;
}

export interface DetalleFactura {
  id?: number;
  articulo_id: number;
  cantidad: number;
  precio: number;
  subtotal: number;
}
