import { contextBridge, ipcRenderer } from 'electron';

/**
 * Preload script for Electron
 * Exposes safe IPC methods to the renderer process
 * Maintains security by using contextBridge and not exposing Node.js or Electron modules directly
 */

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // =============================================================================
  // Window Controls
  // =============================================================================
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
    onMaximize: (callback) => {
      ipcRenderer.on('window-maximized', (_event, isMaximized) => callback(isMaximized));
    }
  },

  // =============================================================================
  // Dialog Operations
  // =============================================================================
  dialog: {
    openFile: (options) => ipcRenderer.invoke('dialog:openFile', options),
    openDirectory: (options) => ipcRenderer.invoke('dialog:openDirectory', options),
    saveFile: (options) => ipcRenderer.invoke('dialog:saveFile', options),
    showMessage: (options) => ipcRenderer.invoke('dialog:message', options)
  },

  // =============================================================================
  // App Information
  // =============================================================================
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getName: () => ipcRenderer.invoke('app:getName'),
    getPath: (name) => ipcRenderer.invoke('app:getPath', name),
    quit: () => ipcRenderer.invoke('app:quit'),
    relaunch: () => ipcRenderer.invoke('app:relaunch')
  },

  // =============================================================================
  // Shell Operations
  // =============================================================================
  shell: {
    openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
    openPath: (path) => ipcRenderer.invoke('shell:openPath', path)
  },

  // =============================================================================
  // Store/Config Operations
  // =============================================================================
  store: {
    get: (key, defaultValue) => ipcRenderer.invoke('store:get', key, defaultValue),
    set: (key, value) => ipcRenderer.invoke('store:set', key, value),
    delete: (key) => ipcRenderer.invoke('store:delete', key)
  },

  // =============================================================================
  // Clipboard Operations
  // =============================================================================
  clipboard: {
    writeText: (text) => ipcRenderer.invoke('clipboard:writeText', text),
    readText: () => ipcRenderer.invoke('clipboard:readText')
  },

  // =============================================================================
  // General IPC Communication
  // =============================================================================
  ipc: {
    send: (channel, data) => {
      // Whitelist of allowed channels
      const validChannels = [
        'toMain',
        'auth:login',
        'auth:logout',
        'data:sync',
        'notification:show'
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    on: (channel, callback) => {
      const validChannels = [
        'fromMain',
        'auth:status',
        'data:updated',
        'notification:received'
      ];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        const subscription = (_event, ...args) => callback(...args);
        ipcRenderer.on(channel, subscription);
        
        // Return unsubscribe function
        return () => {
          ipcRenderer.removeListener(channel, subscription);
        };
      }
    },
    once: (channel, callback) => {
      const validChannels = ['fromMain', 'auth:status', 'data:updated'];
      if (validChannels.includes(channel)) {
        ipcRenderer.once(channel, (_event, ...args) => callback(...args));
      }
    },
    invoke: (channel, ...args) => {
      const validChannels = [
        'custom:operation',
        'database:query',
        'file:read',
        'file:write'
      ];
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
      return Promise.reject(new Error(`Invalid channel: ${channel}`));
    }
  }
});

// Platform information
contextBridge.exposeInMainWorld('platform', {
  isWindows: process.platform === 'win32',
  isMac: process.platform === 'darwin',
  isLinux: process.platform === 'linux',
  platform: process.platform,
  arch: process.arch,
  nodeVersion: process.versions.node,
  chromeVersion: process.versions.chrome,
  electronVersion: process.versions.electron
});
