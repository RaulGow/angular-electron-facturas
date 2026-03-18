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

// Obtener historial de facturas de un cliente específico
ipcMain.handle('get-facturas-cliente', async (event, clienteId) => {
  return db.prepare(`
    SELECT * FROM facturas 
    WHERE cliente_id = ? 
    ORDER BY fecha DESC
  `).all(clienteId);
});

// Obtener una factura detallada (para ver sus productos)
ipcMain.handle('get-factura-detalle', async (event, facturaId) => {
  const cabecera = db.prepare(`
    SELECT f.*, c.nombre, c.cif, c.poblacion 
    FROM facturas f 
    JOIN clientes c ON f.cliente_id = c.id 
    WHERE f.id = ?
  `).get(facturaId);

  const lineas = db.prepare(`
    SELECT fd.*, a.nombre as articulo_nombre 
    FROM factura_detalles fd
    JOIN articulos a ON fd.articulo_id = a.id
    WHERE fd.factura_id = ?
  `).all(facturaId);

  return { cabecera, lineas };
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
    CLIENTES
   ============================== */

// Obtener todos los clientes
ipcMain.handle('get-clientes', async () => {
  return db.prepare('SELECT * FROM clientes ORDER BY nombre_comercial ASC').all();
});

// Obtener un solo cliente por ID (útil para editar)
ipcMain.handle('get-cliente-by-id', async (event, id) => {
  return db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
});

// Guardar o Actualizar cliente
ipcMain.handle('save-cliente', async (_event, cliente) => {
  if (!cliente?.nombre_comercial || !cliente?.nombre_fiscal || !cliente?.cif) {
    throw new Error('Nombre, Nombre Fiscal y CIF son obligatorios');
  }

  if (cliente.id) {
    // MODODO EDICIÓN
    const stmt = db.prepare(`
      UPDATE clientes 
      SET nombre_comercial = ?, nombre_fiscal = ?, cif = ?, telefono = ?, 
          email = ?, direccion = ?, codigo_postal = ?, poblacion = ?, 
          provincia = ?, notas = ?
      WHERE id = ?
    `);

    stmt.run(
      cliente.nombre_comercial,
      cliente.nombre_fiscal,
      cliente.cif,
      cliente.telefono,
      cliente.email,
      cliente.direccion,
      cliente.codigo_postal,
      cliente.poblacion,
      cliente.provincia,
      cliente.notas,
      cliente.id
    );
    return cliente.id;
  } else {
    // MODO CREACIÓN
    const stmt = db.prepare(`
      INSERT INTO clientes (
        nombre_comercial, nombre_fiscal, cif, telefono, 
        email, direccion, codigo_postal, poblacion, provincia, notas
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      cliente.nombre_comercial,
      cliente.nombre_fiscal,
      cliente.cif,
      cliente.telefono,
      cliente.email,
      cliente.direccion,
      cliente.codigo_postal,
      cliente.poblacion,
      cliente.provincia,
      cliente.notas
    );
    return result.lastInsertRowid;
  }
});

// Eliminar cliente (Opcional, ten cuidado si tiene facturas)
ipcMain.handle('delete-cliente', async (event, id) => {
  // Nota: SQLite impedirá esto si hay facturas asociadas por la Foreign Key
  return db.prepare('DELETE FROM clientes WHERE id = ?').run(id);
});

/* ==============================
    FACTURAS
   ============================== */

ipcMain.handle('crear-factura', async (event, { clienteId, items, totales }) => {
  // 1. Preparamos los inserts con los nuevos campos de IVA y numero_factura
  const insertFactura = db.prepare(`
    INSERT INTO facturas (
      numero_factura, cliente_id, 
      base_4, cuota_4, 
      base_10, cuota_10, 
      total
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertDetalle = db.prepare(`
    INSERT INTO factura_detalles (
      factura_id, articulo_id, cantidad, precio_unidad, iva_aplicado, subtotal
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction((cId, t) => {
    // Generar un número de factura básico (Ej: FAC-2024-ID)
    // Nota: Para algo más pro, podrías consultar el último ID antes de insertar
    const fecha = new Date();
    const prefijo = `FAC-${fecha.getFullYear()}-`;

    // Insertamos la cabecera
    const res = insertFactura.run(
      null, // Temporalmente null para luego actualizar con el ID real si quieres
      cId,
      t.base_4 || 0,
      t.cuota_4 || 0,
      t.base_10 || 0,
      t.cuota_10 || 0,
      t.total
    );

    const facturaId = res.lastInsertRowid;

    // Actualizamos el número de factura con el ID real para que sea único
    db.prepare("UPDATE facturas SET numero_factura = ? WHERE id = ?")
      .run(`${prefijo}${facturaId.toString().padStart(4, '0')}`, facturaId);

    // Insertamos los detalles guardando el IVA de cada artículo
    for (const item of items) {
      insertDetalle.run(
        facturaId,
        item.id,
        item.cantidad,
        item.precio_venta,
        item.iva, // Guardamos el % de IVA que tenía el artículo al venderse
        item.subtotal
      );

      // EXTRA: Actualizar stock automáticamente
      db.prepare('UPDATE articulos SET stock = stock - ? WHERE id = ?')
        .run(item.cantidad, item.id);
    }

    return facturaId;
  });

  try {
    return transaction(clienteId, totales);
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