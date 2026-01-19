export interface Articulo {
  id?: number;
  nombre: string;
  precio_kilo: number;
  stock: number;
}

export interface Cliente {
  id?: number;
  nombre: string;
  dni_cif?: string;
  telefono?: string;
}

export interface DetalleFactura {
  id?: number;
  articulo_id: number;
  cantidad: number;
  precio: number;
  subtotal: number;
}
