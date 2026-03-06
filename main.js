const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const db = require('./db-manager'); // Importamos el gestor que configuramos antes

let mainWindow;

const preloadPath = path.join(__dirname, 'preload.js');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false 
    }
  });
  
  mainWindow.webContents.openDevTools();

  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:4200');
  } else {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    if (!fs.existsSync(indexPath)) {
      console.error('❌ index.html NO encontrado en:', indexPath);
      return;
    }
    mainWindow.loadURL(`file://${indexPath}`);
  }

  mainWindow.setMenu(null);
}

/* ==========================================================
    DATABASE LOGIC (IPC Handlers) - ACTUALIZADO
   ========================================================== */

// Obtener todas las categorías
ipcMain.handle('get-categorias', async () => {
  return db.prepare('SELECT * FROM categorias ORDER BY nombre ASC').all();
});

// NUEVO: Obtener todas las unidades de medida (Para tus selects en Angular)
ipcMain.handle('get-unidades', async () => {
  return db.prepare('SELECT * FROM unidades_medida ORDER BY descripcion ASC').all();
});

// Obtener artículos con JOIN (Para ver 'kg' en lugar de un ID en la tabla)
ipcMain.handle('get-articulos', async () => {
  return db.prepare(`
    SELECT 
      a.*, 
      c.nombre AS categoria_nombre, 
      u.abreviatura AS unidad_abreviatura 
    FROM articulos a
    LEFT JOIN categorias c ON a.categoria_id = c.id
    LEFT JOIN unidades_medida u ON a.unidad_id = u.id
    ORDER BY a.nombre COLLATE NOCASE ASC
  `).all();
});

// Guardar o actualizar artículos (Actualizado a unidad_id)
ipcMain.handle('save-articulo', async (event, art) => {
  if (art.id) {
    db.prepare(`
      UPDATE articulos
      SET nombre = ?, categoria_id = ?, precio_venta = ?, unidad_id = ?, iva = ?, stock = ?
      WHERE id = ?
    `).run(art.nombre, art.categoria_id, art.precio_venta, art.unidad_id, art.iva, art.stock, art.id);
    return art.id;
  }

  const stmt = db.prepare(`
    INSERT INTO articulos (nombre, categoria_id, precio_venta, unidad_id, iva, stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(art.nombre, art.categoria_id, art.precio_venta, art.unidad_id, art.iva, art.stock);
  return result.lastInsertRowid;
});

/* ==============================
    CLIENTES Y FACTURACIÓN
   ============================== */

ipcMain.handle('save-cliente', (_event, cliente) => {
  if (!cliente?.nombre || !cliente?.nombre_fiscal || !cliente?.cif) {
    throw new Error('Datos de cliente incompletos');
  }
  const stmt = db.prepare(`
    INSERT INTO clientes (nombre, nombre_fiscal, cif, telefono, calle, codigo_postal, poblacion)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    cliente.nombre,
    cliente.nombre_fiscal,
    cliente.cif,
    cliente.telefono,
    cliente.calle,
    cliente.codigo_postal,
    cliente.poblacion
  );

  return result.lastInsertRowid;
});

ipcMain.handle('get-clientes', async () => {
  return db.prepare('SELECT * FROM clientes ORDER BY id DESC').all();
});

ipcMain.handle('crear-factura', async (event, { clienteId, items, total }) => {
  const insertFactura = db.prepare('INSERT INTO facturas (cliente_id, total) VALUES (?, ?)');
  const insertDetalle = db.prepare('INSERT INTO factura_detalles (factura_id, articulo_id, cantidad, precio_unidad, subtotal) VALUES (?, ?, ?, ?, ?)');

  const transaction = db.transaction((cId, totalVenta, lista) => {
    const res = insertFactura.run(cId, totalVenta);
    const facturaId = res.lastInsertRowid;

    for (const item of lista) {
      insertDetalle.run(facturaId, item.id, item.cantidad, item.precio, item.subtotal);
    }
    return facturaId;
  });

  try {
    return transaction(clienteId, total, items);
  } catch (error) {
    console.error("Error en la transacción:", error);
    throw error;
  }
});

/* ==============================
    PDF GENERATION
   ============================== */
ipcMain.handle('generate-pdf', async () => {
  const { filePath } = await dialog.showSaveDialog({
    title: 'Guardar factura',
    defaultPath: 'factura.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  });

  if (!filePath) return;

  const pdf = await mainWindow.webContents.printToPDF({
    pageSize: 'A4',
    printBackground: true
  });

  fs.writeFileSync(filePath, pdf);
  return filePath;
});

/* ==============================
    APP LIFECYCLE
   ============================== */
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});