const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const db = require('./db-manager'); // Importamos el gestor que creamos antes

let mainWindow;
let clientes = [];   // tabla de clientes
let articulos = [];  // tabla de artículos

const preloadPath = path.join(__dirname, 'preload.js');
console.log('🧭 preloadPath:', preloadPath);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false // Por seguridad, mantenemos false
    }
  });
  mainWindow.webContents.openDevTools()

  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:4200');
  } else {
    const indexPath = path.join(__dirname, '..', 'dist', 'angular-electron-facturas', 'browser', 'index.html');
    if (!fs.existsSync(indexPath)) {
      console.error('❌ index.html NO encontrado en:', indexPath);
      return;
    }
    mainWindow.loadURL(`file://${indexPath}`);
  }

  mainWindow.setMenu(null);
}

/* ==============================
    DATABASE LOGIC
================================ */

// Artículos: Obtener todos
ipcMain.handle('get-articulos', () => {
  console.log('💾 get-articulos llamado, articulos:', articulos);
  return db.prepare('SELECT * FROM articulos ORDER BY nombre ASC').all();
});

// Artículos: Guardar o actualizar
ipcMain.handle('save-articulo', async (event, art) => {
  if (art.id) {
    db.prepare(`
    UPDATE articulos
    SET nombre = ?, precio_kilo = ?, stock = ?
    WHERE id = ?
  `).run(art.nombre, art.precio_kilo, art.stock, art.id);
    return art.id;
  }
  const stmt = db.prepare('INSERT INTO articulos (nombre, precio_kilo, stock) VALUES (?, ?, ?)');
  const result = stmt.run(art.nombre, art.precio_kilo, art.stock);
  articulos.push(articulo);
  console.log('💾 Artículo guardado:', articulo);
  return result.lastInsertRowid;
});

//*****************************************************
//****************** Guardar cliente ******************/
ipcMain.handle('save-cliente', (_event, cliente) => {
  if (!cliente?.nombre || !cliente?.nombre_fiscal || !cliente?.cif) {
    throw new Error('Datos de cliente incompletos');
  }
  const stmt = db.prepare(`
    INSERT INTO clientes (
      nombre,
      nombre_fiscal,
      cif,
      telefono,
      calle,
      codigo_postal,
      poblacion
    )
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
  clientes.push(cliente);
  console.log('💾 Cliente guardado:', cliente);

  return result.lastInsertRowid;
});

//******************************************************
//****************** Obtener clientes ******************/
ipcMain.handle('get-clientes', async  () => {
  const stmt = db.prepare('SELECT * FROM clientes ORDER BY id DESC');
  console.log('💾 get-clientes llamado, clientes:', clientes);
  return stmt.all();
});

// Facturación: Crear factura y sus detalles (Transacción)
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
================================ */
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
================================ */
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
