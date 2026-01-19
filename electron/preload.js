const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Función para generar PDFs
  generatePDF: () => ipcRenderer.invoke('generate-pdf'),

  // Artículos
  getArticulos: () => ipcRenderer.invoke('get-articulos'),
  saveArticulo: (articulo) => ipcRenderer.invoke('save-articulo', articulo),

  // Clientes
  getClientes: () => ipcRenderer.invoke('get-clientes'),

  // Facturas
  crearFactura: (datos) => ipcRenderer.invoke('crear-factura', datos),
});
