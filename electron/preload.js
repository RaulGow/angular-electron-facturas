const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Función para generar PDFs
  generatePDF: () => ipcRenderer.invoke('generate-pdf'),

  // categorias
  getCategorias: () => ipcRenderer.invoke('get-categorias'),

  // Artículos
  getArticulos: () => ipcRenderer.invoke('get-articulos'),
  saveArticulo: (articulo) => ipcRenderer.invoke('save-articulo', articulo),

  // Clientes
  saveCliente: (cliente) => ipcRenderer.invoke('save-cliente', cliente),
  getClientes: () => ipcRenderer.invoke('get-clientes'),

  // Facturas
  crearFactura: (datos) => ipcRenderer.invoke('crear-factura', datos),
});
console.log('🔥 PRELOAD CARGADO');
