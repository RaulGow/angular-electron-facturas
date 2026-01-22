export {};

declare global {
  interface Window {
    electronAPI?: {
      getClientes: () => Promise<any[]>;
      saveCliente: (cliente: any) => Promise<number>;
      getArticulos: () => Promise<any[]>;
      saveArticulo: (articulo: any) => Promise<number>;
      crearFactura: (data: any) => Promise<number>;
      generatePDF: () => Promise<string>;
    };
  }
}
