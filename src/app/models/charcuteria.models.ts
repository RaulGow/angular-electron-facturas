export interface Categoria {
  id: number;
  nombre: string;
}
export interface Articulo {
  id: number;
  nombre: string;
  categoria_id: number;
  precio_venta: number;
  unidad_medida: string;
  iva: number;
  stock: number;
}

export interface Cliente {
  id?: number;
  nombre_comercial: string;
  nombre_fiscal: string;
  cif: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  codigo_postal?: string;
  poblacion?: string;
  provincia?: string;
  notas?: string;
}

export interface DetalleFactura {
  id?: number;
  articulo_id: number;
  cantidad: number;
  precio: number;
  subtotal: number;
}
