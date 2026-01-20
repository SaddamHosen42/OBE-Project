import { app, BrowserWindow, ipcMain, dialog, shell, clipboard } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keep a global reference of the window object to prevent garbage collection
let mainWindow = null;

/**
 * Create the main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'OBE Management System',
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: true,
      webSecurity: true
    },
    show: false, // Don't show until ready-to-show
    backgroundColor: '#ffffff',
    autoHideMenuBar: false,
    frame: true,
    titleBarStyle: 'default'
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // In development, load from Vite dev server
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
    
    // Enable live reload in development
    mainWindow.webContents.on('did-fail-load', () => {
      setTimeout(() => {
        mainWindow.loadURL('http://localhost:5173');
      }, 1000);
    });
  } else {
    // In production, load the built index.html
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Handle external links - open in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Window event handlers
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('unresponsive', () => {
    dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title: 'Application Not Responding',
      message: 'The application is not responding. Would you like to wait or close it?',
      buttons: ['Wait', 'Close'],
      defaultId: 0,
      cancelId: 0
    }).then(({ response }) => {
      if (response === 1) {
        mainWindow.destroy();
      }
    });
  });

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-maximized', false);
  });

  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('Render process gone:', details);
    if (details.reason !== 'clean-exit') {
      dialog.showErrorBox(
        'Application Crashed',
        'The application has crashed. It will now restart.'
      );
      app.relaunch();
      app.exit(0);
    }
  });
}

// =============================================================================
// App Lifecycle Events
// =============================================================================

/**
 * App ready event - Initialize the application
 */
app.whenReady().then(() => {
  console.log('App is ready');
  createWindow();

  // macOS specific: Re-create window on dock icon click
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

/**
 * Close all windows event
 */
app.on('window-all-closed', () => {
  // On macOS, applications stay active until explicitly quit
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Before quit event - Cleanup operations
 */
app.on('before-quit', (event) => {
  console.log('App is quitting');
  // Perform cleanup operations here if needed
});

/**
 * Will quit event - Last chance for cleanup
 */
app.on('will-quit', (event) => {
  console.log('App will quit');
  // Final cleanup operations
});

/**
 * Web contents created - Security configuration
 */
app.on('web-contents-created', (event, contents) => {
  // Disable navigation to external URLs
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    const validOrigins = ['http://localhost:5173', 'file://'];
    
    const isValid = validOrigins.some(origin => 
      navigationUrl.startsWith(origin)
    );
    
    if (!isValid) {
      event.preventDefault();
    }
  });

  // Disable opening new windows
  contents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });
});

// =============================================================================
// IPC Handlers
// =============================================================================

/**
 * Window control handlers
 */
ipcMain.handle('window:minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('window:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
      return false;
    } else {
      mainWindow.maximize();
      return true;
    }
  }
  return false;
});

ipcMain.handle('window:close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle('window:isMaximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

/**
 * Dialog handlers
 */
ipcMain.handle('dialog:openFile', async (event, options = {}) => {
  if (!mainWindow) return { canceled: true };
  
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: options.filters || [],
    ...options
  });
  
  return result;
});

ipcMain.handle('dialog:openDirectory', async (event, options = {}) => {
  if (!mainWindow) return { canceled: true };
  
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    ...options
  });
  
  return result;
});

ipcMain.handle('dialog:saveFile', async (event, options = {}) => {
  if (!mainWindow) return { canceled: true };
  
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: options.filters || [],
    ...options
  });
  
  return result;
});

ipcMain.handle('dialog:message', async (event, options = {}) => {
  if (!mainWindow) return;
  
  const result = await dialog.showMessageBox(mainWindow, {
    type: options.type || 'info',
    title: options.title || 'Message',
    message: options.message || '',
    buttons: options.buttons || ['OK'],
    defaultId: options.defaultId || 0,
    cancelId: options.cancelId || 0
  });
  
  return result;
});

/**
 * App info handlers
 */
ipcMain.handle('app:getVersion', () => {
  return app.getVersion();
});

ipcMain.handle('app:getName', () => {
  return app.getName();
});

ipcMain.handle('app:getPath', (event, name) => {
  return app.getPath(name);
});

ipcMain.handle('app:quit', () => {
  app.quit();
});

ipcMain.handle('app:relaunch', () => {
  app.relaunch();
  app.exit(0);
});

/**
 * Shell handlers - Open external resources
 */
ipcMain.handle('shell:openExternal', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('shell:openPath', async (event, path) => {
  try {
    const result = await shell.openPath(path);
    return { success: !result, error: result || null };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * Store/Config handlers (for future use with electron-store)
 */
ipcMain.handle('store:get', (event, key, defaultValue) => {
  // TODO: Implement with electron-store
  return defaultValue;
});

ipcMain.handle('store:set', (event, key, value) => {
  // TODO: Implement with electron-store
  return true;
});

ipcMain.handle('store:delete', (event, key) => {
  // TODO: Implement with electron-store
  return true;
});

/**
 * Clipboard handlers
 */
ipcMain.handle('clipboard:writeText', (event, text) => {
  clipboard.writeText(text);
  return true;
});

ipcMain.handle('clipboard:readText', () => {
  return clipboard.readText();
});

// =============================================================================
// Error Handling
// =============================================================================

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  dialog.showErrorBox('Unexpected Error', error.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});
