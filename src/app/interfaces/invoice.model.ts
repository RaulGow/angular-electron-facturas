export interface InvoiceLine {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  customer: {
    nombre: string;
    cif: string;
    direccion: string;
    poblacion: string;
    telefono?: string;
    email?: string;
  };
  date: Date;
  items: InvoiceLine[];
  totalAmount: number;
}
