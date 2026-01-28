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
    categoria TEXT,
    precio_venta REAL,
    unidadMedida TEXT,
    iva INTEGER,
    stock REAL
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

/* ==========================================================
    PROCESO DE SEMBRADO (SEEDING)
    Inserta los artículos automáticamente si la tabla está vacía
   ========================================================== */

const countArticulos = db.prepare('SELECT COUNT(*) as total FROM articulos').get();

if (countArticulos.total === 0) {
  console.log('🌱 Sembrando artículos iniciales en la base de datos...');

  const articulosDemo = [
    { nombre: 'Jamón Serrano Gran Reserva (+15 meses)', categoria: 'Jamones', precio_venta: 18.50, unidadMedida: 'kg', iva: 10, stock: 45 },
    { nombre: 'Jamón Serrano Bodega', categoria: 'Jamones', precio_venta: 14.20, unidadMedida: 'kg', iva: 10, stock: 60 },
    { nombre: 'Jamón Ibérico Cebo (50% Raza Ibérica)', categoria: 'Jamones', precio_venta: 42.00, unidadMedida: 'kg', iva: 10, stock: 12 },
    { nombre: 'Jamón Ibérico Cebo Campo (75% Raza Ibérica)', categoria: 'Jamones', precio_venta: 58.00, unidadMedida: 'kg', iva: 10, stock: 8 },
    { nombre: 'Jamón Ibérico Bellota (100% Pata Negra)', categoria: 'Jamones', precio_venta: 95.00, unidadMedida: 'kg', iva: 10, stock: 5 },
    { nombre: 'Jamón 5J 100% Ibérico Bellota', categoria: 'Jamones', precio_venta: 125.00, unidadMedida: 'kg', iva: 10, stock: 3 },
    { nombre: 'Paleta Ibérica de Bellota (100% Raza Ibérica)', categoria: 'Jamones', precio_venta: 48.00, unidadMedida: 'kg', iva: 10, stock: 10 },
    { nombre: 'Jamón York Extra (90% carne)', categoria: 'Cocidos', precio_venta: 16.90, unidadMedida: 'kg', iva: 10, stock: 25 },
    { nombre: 'Jamón Cocido Calidad Suprema', categoria: 'Cocidos', precio_venta: 12.50, unidadMedida: 'kg', iva: 10, stock: 30 },
    { nombre: 'Fiambre de Jamón (55% carne)', categoria: 'Cocidos', precio_venta: 7.90, unidadMedida: 'kg', iva: 10, stock: 50 },
    { nombre: 'Lomo Ibérico de Bellota', categoria: 'Embutidos', precio_venta: 44.50, unidadMedida: 'kg', iva: 10, stock: 15 },
    { nombre: 'Lomo Ibérico de Cebo', categoria: 'Embutidos', precio_venta: 32.00, unidadMedida: 'kg', iva: 10, stock: 20 },
    { nombre: 'Lomito Ibérico de Presa', categoria: 'Embutidos', precio_venta: 52.00, unidadMedida: 'kg', iva: 10, stock: 10 },
    { nombre: 'Chorizo Ibérico de Bellota Vela', categoria: 'Embutidos', precio_venta: 19.50, unidadMedida: 'kg', iva: 10, stock: 25 },
    { nombre: 'Chorizo de Cantimpalo', categoria: 'Embutidos', precio_venta: 13.80, unidadMedida: 'kg', iva: 10, stock: 40 },
    { nombre: 'Chorizo Picante de León', categoria: 'Embutidos', precio_venta: 14.50, unidadMedida: 'kg', iva: 10, stock: 35 },
    { nombre: 'Fuet dOlot Artesano', categoria: 'Embutidos', precio_venta: 16.20, unidadMedida: 'ud', iva: 10, stock: 100 },
    { nombre: 'Salami Milano', categoria: 'Embutidos', precio_venta: 15.40, unidadMedida: 'kg', iva: 10, stock: 20 },
    { nombre: 'Salami con Pimienta', categoria: 'Embutidos', precio_venta: 16.80, unidadMedida: 'kg', iva: 10, stock: 18 },
    { nombre: 'Salchichón de Vic', categoria: 'Embutidos', precio_venta: 21.00, unidadMedida: 'kg', iva: 10, stock: 15 },
    { nombre: 'Taquitos de Jamón Ibérico (150g)', categoria: 'Precocinados', precio_venta: 6.50, unidadMedida: 'ud', iva: 10, stock: 80 },
    { nombre: 'Jamón Ibérico Picado', categoria: 'Precocinados', precio_venta: 12.90, unidadMedida: 'kg', iva: 10, stock: 10 },
    { nombre: 'Hueso de Jamón Ibérico', categoria: 'Varios', precio_venta: 1.50, unidadMedida: 'ud', iva: 10, stock: 200 },
    { nombre: 'Orégano Seco en Hoja (50g)', categoria: 'Especias', precio_venta: 2.20, unidadMedida: 'ud', iva: 10, stock: 50 },
    { nombre: 'Pimentón Dulce de la Vera', categoria: 'Especias', precio_venta: 3.75, unidadMedida: 'ud', iva: 10, stock: 40 },
    { nombre: 'Pimentón Picante de la Vera', categoria: 'Especias', precio_venta: 3.75, unidadMedida: 'ud', iva: 10, stock: 30 },
    { nombre: 'Pasta de Trufa Negra (Tarro)', categoria: 'Gourmet', precio_venta: 12.40, unidadMedida: 'ud', iva: 10, stock: 15 },
    { nombre: 'Queso Manchego DOP (12 meses)', categoria: 'Quesos', precio_venta: 26.90, unidadMedida: 'kg', iva: 10, stock: 12 },
    { nombre: 'Pechuga de Pavo Natural', categoria: 'Cocidos', precio_venta: 14.90, unidadMedida: 'kg', iva: 10, stock: 22 },
    { nombre: 'Chistorra de Navarra', categoria: 'Embutidos Frescos', precio_venta: 9.50, unidadMedida: 'kg', iva: 10, stock: 40 },
    { nombre: 'Sobrasada de Mallorca', categoria: 'Embutidos', precio_venta: 18.20, unidadMedida: 'kg', iva: 10, stock: 15 },
    { nombre: 'Mortadela de Bologna IGP', categoria: 'Cocidos', precio_venta: 13.50, unidadMedida: 'kg', iva: 10, stock: 20 },
    { nombre: 'Paté de Campaña al Armagnac', categoria: 'Gourmet', precio_venta: 19.00, unidadMedida: 'kg', iva: 10, stock: 8 },
    { nombre: 'Cabeza de Jabalí', categoria: 'Cocidos', precio_venta: 11.40, unidadMedida: 'kg', iva: 10, stock: 12 },
    { nombre: 'Aceite de Oliva VE (5L)', categoria: 'Aceites', precio_venta: 45.00, unidadMedida: 'ud', iva: 10, stock: 100 }
  ];

  // Usamos db.transaction para una inserción masiva eficiente
  const insert = db.prepare(`
    INSERT INTO articulos (nombre, categoria, precio_venta, unidadMedida, iva, stock)
    VALUES (@nombre, @categoria, @precio_venta, @unidadMedida, @iva, @stock)
  `);

  const insertMany = db.transaction((articulos) => {
    for (const art of articulos) insert.run(art);
  });

  insertMany(articulosDemo);
  console.log('✅ Base de datos poblada con éxito.');
}

// ======= COMPROBAR SI HACE FALTA nombre_fiscal =======
// Comprobación de integridad de columnas (Migración manual rápida)
const info = db.prepare("PRAGMA table_info(clientes);").all();
const tieneNombreFiscal = info.some(col => col.name === 'nombre_fiscal');

if (!tieneNombreFiscal) {
  console.log('🛠 Añadiendo columna nombre_fiscal a la tabla clientes...');
  db.prepare("ALTER TABLE clientes ADD COLUMN nombre_fiscal TEXT NOT NULL DEFAULT '';").run();
}

// Exportar DB
module.exports = db;
