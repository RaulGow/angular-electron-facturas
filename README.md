# 📄 Angular Electron Facturas

Aplicación de escritorio profesional para la gestión de facturación, construida con **Angular 21** y **Electron**.

---

## 🚀 Inicio Rápido

### Requisitos previos
Para asegurar la compatibilidad con **Angular 21** y **Electron 39**, tu entorno debe cumplir con:

* **Node.js**: Se requiere la versión **v20.19.0**, **v22.12.0** o superior (recomendada v22+).
* **npm**: Se requiere la versión **v11.6.2** o superior (como se especifica en el `packageManager`).
* **Sistema Operativo**: 
    * **Windows**: 10 o superior (para soporte de Electron 39).
    * **Linux**: Distribuciones modernas con soporte para `AppImage`.
    * **macOS**: Catalina o superior.

### ⚙️ Instalación
```bash
# Clonar el repositorio
git clone <url-del-repositorio>

# Entrar en la carpeta
cd angular-electron-facturas

# Instalar dependencias
npm install
```
> **Nota**: Se recomienda usar `npm clean-install` (o `npm ci`) para asegurar que se instalen las versiones exactas del `package-lock.json`.

### 💻 Desarrollo
El proyecto utiliza concurrently para ejecutar el servidor de desarrollo de Angular y la ventana de Electron de forma simultánea.

## Ejecutar en modo Escritorio (Recomendado)
Este comando compila la aplicación, levanta el servidor en el puerto 4200 y lanza la ventana de Electron automáticamente:
```bash
npm run electron:start
```
## Ejecutar solo en Navegador
Si deseas trabajar únicamente en la interfaz web sin acceso a las APIs de Electron:
```bash
npm start
```
Luego navega a http://localhost:4200/.

### 🏗️ Construcción y Empaquetado
Para generar los instaladores finales, el proyecto utiliza electron-builder.

## Generar Instalador de Producción
Este script realiza un build de Angular con la base de rutas relativa (./) y genera los archivos ejecutables en la carpeta /release.
```bash
npm run electron:build
```
### Configuración de salida según el Sistema Operativo:

* **Windows**: Genera un instalador NSIS (`.exe`).
* **Mac**: Genera un archivo DMG.
* **Linux**: Genera un paquete AppImage.

---

## 🛠️ Scripts del Proyecto

| Comando | Acción |
| :--- | :--- |
| `npm run electron:start` | Lanza el entorno de desarrollo completo (Angular + Electron). |
| `npm run electron:build` | Compila y empaqueta la aplicación para distribución. |
| `npm run build` | Genera los archivos de producción de Angular en `/dist`. |
| `npm test` | Ejecuta las pruebas unitarias con **Vitest**. |
| `npm run watch` | Compila Angular en modo "watch" para detectar cambios. |

---

## 📁 Estructura Principal

* **`src/`**: Aplicación frontend en Angular (Dashboard, Facturas, Lógica UI).
* **`electron/main.js`**: Proceso principal de Electron (gestión de ventanas).
* **`public/`**: Almacén de activos (iconos, imágenes y recursos estáticos).
* **`release/`**: Carpeta donde se guardan los instaladores finales tras el build.

---

## 💅 Calidad de Código

El proyecto utiliza **Prettier** para mantener un formato consistente.

* **Single Quote**: `true`
* **Print Width**: `100`
* **HTML Parser**: Especializado para Angular.

---

**Desarrollado por [Raúl Martínez](https://github.com/tu-usuario)**
