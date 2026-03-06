const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const dbPath = path.join(app.getPath('userData'), 'charcuteria.db');

// 🗑️ BORRAR BBDD ANTIGUA PARA APLICAR CAMBIOS DE ESQUEMA
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('🗑️ Base de datos antigua eliminada para actualizar estructura');
}

const Database = require('better-sqlite3');
const db = new Database(dbPath);

// Habilitar claves foráneas
db.pragma('foreign_keys = ON');

/* ==========================================================
    1. CREACIÓN DE TABLAS
   ========================================================== */
db.exec(`
  CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS unidades_medida (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descripcion TEXT NOT NULL,
    abreviatura TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS articulos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    categoria_id INTEGER,
    precio_venta REAL,
    unidad_id INTEGER, -- RELACIÓN CON unidades_medida
    iva INTEGER,
    stock REAL,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (unidad_id) REFERENCES unidades_medida(id)
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
    2. PROCESO DE SEMBRADO (SEEDING)
   ========================================================== */

// --- A. SEMBRAR UNIDADES DE MEDIDA ---
const countUnidades = db.prepare('SELECT COUNT(*) as total FROM unidades_medida').get();
if (countUnidades.total === 0) {
  console.log('🌱 Sembrando unidades de medida...');
  const unidadesDemo = [
    { desc: 'Kilogramos', abr: 'kg' },
    { desc: 'Gramos', abr: 'g' },
    { desc: 'Litros', abr: 'L' },
    { desc: 'Mililitros', abr: 'ml' },
    { desc: 'Unidades', abr: 'ud' }
  ];
  const insertU = db.prepare('INSERT INTO unidades_medida (descripcion, abreviatura) VALUES (?, ?)');
  db.transaction(() => {
    unidadesDemo.forEach(u => insertU.run(u.desc, u.abr));
  })();
}

// --- B. SEMBRAR CATEGORÍAS ---
const countCategorias = db.prepare('SELECT COUNT(*) as total FROM categorias').get();
if (countCategorias.total === 0) {
  console.log('🌱 Sembrando categorías...');
  const categoriasDemo = [
    'Jamones', 'Cocidos', 'Embutidos', 'Precocinados', 'Especias', 
    'Gourmet', 'Quesos', 'Embutidos Frescos', 'Aceites', 'Varios'
  ];
  const insertC = db.prepare('INSERT INTO categorias (nombre) VALUES (?)');
  db.transaction(() => {
    categoriasDemo.forEach(nombre => insertC.run(nombre));
  })();
}

// --- C. SEMBRAR ARTÍCULOS ---
const countArticulos = db.prepare('SELECT COUNT(*) as total FROM articulos').get();
if (countArticulos.total === 0) {
  console.log('🌱 Sembrando todos los artículos...');

  // 1. Mapeamos IDs de categorías y unidades para insertar correctamente
  const catMap = {};
  db.prepare('SELECT id, nombre FROM categorias').all().forEach(c => catMap[c.nombre] = c.id);
  
  const uniMap = {};
  db.prepare('SELECT id, abreviatura FROM unidades_medida').all().forEach(u => uniMap[u.abreviatura] = u.id);

  const articulosDemo = [
    { nombre: 'Jamón Serrano Gran Reserva (+15 meses)', cat: 'Jamones', precio: 18.50, uni: 'kg', iva: 10, stock: 45 },
    { nombre: 'Jamón Serrano Bodega', cat: 'Jamones', precio: 14.20, uni: 'kg', iva: 10, stock: 60 },
    { nombre: 'Jamón Ibérico Cebo (50% Raza Ibérica)', cat: 'Jamones', precio: 42.00, uni: 'kg', iva: 10, stock: 12 },
    { nombre: 'Jamón Ibérico Cebo Campo (75% Raza Ibérica)', cat: 'Jamones', precio: 58.00, uni: 'kg', iva: 10, stock: 8 },
    { nombre: 'Jamón Ibérico Bellota (100% Pata Negra)', cat: 'Jamones', precio: 95.00, uni: 'kg', iva: 10, stock: 5 },
    { nombre: 'Jamón 5J 100% Ibérico Bellota', cat: 'Jamones', precio: 125.00, uni: 'kg', iva: 10, stock: 3 },
    { nombre: 'Paleta Ibérica de Bellota (100% Raza Ibérica)', cat: 'Jamones', precio: 48.00, uni: 'kg', iva: 10, stock: 10 },
    { nombre: 'Jamón York Extra (90% carne)', cat: 'Cocidos', precio: 16.90, uni: 'kg', iva: 10, stock: 25 },
    { nombre: 'Jamón Cocido Calidad Suprema', cat: 'Cocidos', precio: 12.50, uni: 'kg', iva: 10, stock: 30 },
    { nombre: 'Fiambre de Jamón (55% carne)', cat: 'Cocidos', precio: 7.90, uni: 'kg', iva: 10, stock: 50 },
    { nombre: 'Lomo Ibérico de Bellota', cat: 'Embutidos', precio: 44.50, uni: 'kg', iva: 10, stock: 15 },
    { nombre: 'Lomo Ibérico de Cebo', cat: 'Embutidos', precio: 32.00, uni: 'kg', iva: 10, stock: 20 },
    { nombre: 'Lomito Ibérico de Presa', cat: 'Embutidos', precio: 52.00, uni: 'kg', iva: 10, stock: 10 },
    { nombre: 'Chorizo Ibérico de Bellota Vela', cat: 'Embutidos', precio: 19.50, uni: 'kg', iva: 10, stock: 25 },
    { nombre: 'Chorizo de Cantimpalo', cat: 'Embutidos', precio: 13.80, uni: 'kg', iva: 10, stock: 40 },
    { nombre: 'Chorizo Picante de León', cat: 'Embutidos', precio: 14.50, uni: 'kg', iva: 10, stock: 35 },
    { nombre: 'Fuet dOlot Artesano', cat: 'Embutidos', precio: 16.20, uni: 'ud', iva: 10, stock: 100 },
    { nombre: 'Salami Milano', cat: 'Embutidos', precio: 15.40, uni: 'kg', iva: 10, stock: 20 },
    { nombre: 'Salami con Pimienta', cat: 'Embutidos', precio: 16.80, uni: 'kg', iva: 10, stock: 18 },
    { nombre: 'Salchichón de Vic', cat: 'Embutidos', precio: 21.00, uni: 'kg', iva: 10, stock: 15 },
    { nombre: 'Taquitos de Jamón Ibérico (150g)', cat: 'Precocinados', precio: 6.50, uni: 'ud', iva: 10, stock: 80 },
    { nombre: 'Jamón Ibérico Picado', cat: 'Precocinados', precio: 12.90, uni: 'kg', iva: 10, stock: 10 },
    { nombre: 'Hueso de Jamón Ibérico', cat: 'Varios', precio: 1.50, uni: 'ud', iva: 10, stock: 200 },
    { nombre: 'Orégano Seco en Hoja (50g)', cat: 'Especias', precio: 2.20, uni: 'ud', iva: 10, stock: 50 },
    { nombre: 'Pimentón Dulce de la Vera', cat: 'Especias', precio: 3.75, uni: 'ud', iva: 10, stock: 40 },
    { nombre: 'Pimentón Picante de la Vera', cat: 'Especias', precio: 3.75, uni: 'ud', iva: 10, stock: 30 },
    { nombre: 'Pasta de Trufa Negra (Tarro)', cat: 'Gourmet', precio: 12.40, uni: 'ud', iva: 10, stock: 15 },
    { nombre: 'Queso Manchego DOP (12 meses)', cat: 'Quesos', precio: 26.90, uni: 'kg', iva: 10, stock: 12 },
    { nombre: 'Pechuga de Pavo Natural', cat: 'Cocidos', precio: 14.90, uni: 'kg', iva: 10, stock: 22 },
    { nombre: 'Chistorra de Navarra', cat: 'Embutidos Frescos', precio: 9.50, uni: 'kg', iva: 10, stock: 40 },
    { nombre: 'Sobrasada de Mallorca', cat: 'Embutidos', precio: 18.20, uni: 'kg', iva: 10, stock: 15 },
    { nombre: 'Mortadela de Bologna IGP', cat: 'Cocidos', precio: 13.50, uni: 'kg', iva: 10, stock: 20 },
    { nombre: 'Paté de Campaña al Armagnac', cat: 'Gourmet', precio: 19.00, uni: 'kg', iva: 10, stock: 8 },
    { nombre: 'Cabeza de Jabalí', cat: 'Cocidos', precio: 11.40, uni: 'kg', iva: 10, stock: 12 },
    { nombre: 'Aceite de Oliva VE (5L)', cat: 'Aceites', precio: 45.00, uni: 'ud', iva: 10, stock: 100 }
  ];

  const insertArt = db.prepare(`
    INSERT INTO articulos (nombre, categoria_id, precio_venta, unidad_id, iva, stock)
    VALUES (@nombre, @catId, @precio, @uniId, @iva, @stock)
  `);

  db.transaction((articulos) => {
    for (const a of articulos) {
      insertArt.run({
        nombre: a.nombre,
        catId: catMap[a.cat],
        precio: a.precio,
        uniId: uniMap[a.uni],
        iva: a.iva,
        stock: a.stock
      });
    }
  })(articulosDemo);
  console.log('✅ Base de datos poblada con éxito.');
}

// 3. VERIFICAR COLUMNA nombre_fiscal (Migración manual)
const info = db.prepare("PRAGMA table_info(clientes);").all();
if (!info.some(col => col.name === 'nombre_fiscal')) {
  db.prepare("ALTER TABLE clientes ADD COLUMN nombre_fiscal TEXT NOT NULL DEFAULT '';").run();
}

module.exports = db;