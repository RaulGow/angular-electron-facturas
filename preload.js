const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {

    /* ==========================================
        PRODUCTOS Y CONFIGURACIÓN
       ========================================== */

    // Categorías
    getCategorias: () => ipcRenderer.invoke('get-categorias'),

    // Unidades de Medida
    getUnidades: () => ipcRenderer.invoke('get-unidades'),

    // Artículos (Productos)
    getArticulos: () => ipcRenderer.invoke('get-articulos'),
    saveArticulo: (articulo) => ipcRenderer.invoke('save-articulo', articulo),

    // Obtener un articulo específico por su ID
    getArticuloById: (id) => ipcRenderer.invoke('get-articulo-by-id', id),

    /* ==========================================
        CLIENTES
       ========================================== */

    // Obtener lista completa de clientes
    getClientes: () => ipcRenderer.invoke('get-clientes'),

    // Obtener un cliente específico por su ID
    getClienteById: (id) => ipcRenderer.invoke('get-cliente-by-id', id),

    // Guardar (Crear) o Actualizar un cliente
    saveCliente: (cliente) => ipcRenderer.invoke('save-cliente', cliente),

    // Eliminar un cliente
    deleteCliente: (id) => ipcRenderer.invoke('delete-cliente', id),

    /* ==========================================
        FACTURACIÓN E HISTORIAL
       ========================================== */

    // Crear una nueva factura con desglose de IVA
    crearFactura: (datos) => ipcRenderer.invoke('crear-factura', datos),

    // Consultar todas las facturas de un cliente específico
    getAllFacturas: () => ipcRenderer.invoke('get-all-facturas'),

    // Obtener el detalle (cabecera + productos) de una factura concreta
    getFacturaDetalle: (id) => ipcRenderer.invoke('get-factura-detalle', id),

    // Poder editar factura
    updateFactura: (datos) => ipcRenderer.invoke('update-factura', datos),

    /* ==========================================
        UTILIDADES
       ========================================== */

    // Función para generar y guardar el PDF de la vista actual
    generatePDF: () => ipcRenderer.invoke('generate-pdf'),
});

console.log('🚀 Preload cargado: Sistema de Facturación y Clientes listo.');