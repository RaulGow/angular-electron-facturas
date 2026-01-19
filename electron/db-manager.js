const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

const dbPath = path.join(app.getPath('userData'), 'charcuteria.db');
const db = new Database(dbPath);

// Habilitar claves foráneas para integridad de datos
db.pragma('foreign_keys = ON');

// Crear tablas iniciales
db.exec(`
  CREATE TABLE IF NOT EXISTS articulos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    precio_kilo REAL NOT NULL,
    stock REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    dni_cif TEXT,
    telefono TEXT
  );

  CREATE TABLE IF NOT EXISTS facturas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    total REAL DEFAULT 0,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
  );

  CREATE TABLE IF NOT EXISTS factura_detalles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    factura_id INTEGER,
    articulo_id INTEGER,
    cantidad REAL, -- Kilos o unidades
    precio_unidad REAL,
    subtotal REAL,
    FOREIGN KEY (factura_id) REFERENCES facturas(id),
    FOREIGN KEY (articulo_id) REFERENCES articulos(id)
  );
`);

module.exports = db;
