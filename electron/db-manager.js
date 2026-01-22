const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const dbPath = path.join(app.getPath('userData'), 'charcuteria.db');

// BORRAR BBDD ANTIGUA
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('🗑 Base de datos antigua eliminada');
}

const Database = require('better-sqlite3');
const db = new Database(dbPath);

// Habilitar claves foráneas
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
    nombre_fiscal TEXT NOT NULL,
    cif TEXT NOT NULL,
    telefono TEXT,
    calle TEXT,
    codigo_postal TEXT,
    poblacion TEXT
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
    cantidad REAL,
    precio_unidad REAL,
    subtotal REAL,
    FOREIGN KEY (factura_id) REFERENCES facturas(id),
    FOREIGN KEY (articulo_id) REFERENCES articulos(id)
  );
`);

// ======= COMPROBAR SI HACE FALTA nombre_fiscal =======
const info = db.prepare("PRAGMA table_info(clientes);").all();
const tieneNombreFiscal = info.some(col => col.name === 'nombre_fiscal');

if (!tieneNombreFiscal) {
  console.log('🛠 Añadiendo columna nombre_fiscal a la tabla clientes...');
  db.prepare("ALTER TABLE clientes ADD COLUMN nombre_fiscal TEXT NOT NULL DEFAULT '';").run();
}

// Exportar DB
module.exports = db;
