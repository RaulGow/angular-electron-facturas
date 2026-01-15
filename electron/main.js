const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  const isDev = !app.isPackaged;

  let indexPath;

  if (isDev) {
    // DESARROLLO → Angular dev server
    mainWindow.loadURL('http://localhost:4200');
  } else {
    // PRODUCCIÓN
    // Usa __dirname para referenciar la ubicación del script actual
    // indexPath = path.join(__dirname, '../dist/angular-electron-facturas/browser/index.html');
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
