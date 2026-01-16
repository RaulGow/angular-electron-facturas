export interface InvoiceLine {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  customer: string;
  date: Date;
  items: InvoiceLine[];
  totalAmount: number;
}
