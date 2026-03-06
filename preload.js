const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Función para generar PDFs
  generatePDF: () => ipcRenderer.invoke('generate-pdf'),

  // Categorías
  getCategorias: () => ipcRenderer.invoke('get-categorias'),

  // Unidades de Medida (NUEVO)
  // Úsala en Angular para llenar el select del formulario de productos
  getUnidades: () => ipcRenderer.invoke('get-unidades'),

  // Artículos
  getArticulos: () => ipcRenderer.invoke('get-articulos'),
  saveArticulo: (articulo) => ipcRenderer.invoke('save-articulo', articulo),

  // Clientes
  saveCliente: (cliente) => ipcRenderer.invoke('save-cliente', cliente),
  getClientes: () => ipcRenderer.invoke('get-clientes'),

  // Facturas
  crearFactura: (datos) => ipcRenderer.invoke('crear-factura', datos),
});

console.log('🔥 PRELOAD CARGADO CON SOPORTE PARA UNIDADES');