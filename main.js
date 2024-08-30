import { app, BrowserWindow, globalShortcut } from 'electron'
import path from 'path'
import url from 'url'

// Resolve __dirname for ES modules
const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

let win

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Ensure this path is correct
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
    },
  })

  win.loadFile(path.join(__dirname, 'src', 'index.html'))

  // Register the global shortcut for Ctrl+Shift+/
  globalShortcut.register('Ctrl+R', () => {
    if (win) {
      win.webContents.send('replay-shortcut')
    }
  })

  // Register the global shortcut for Ctrl+Shift+/
  globalShortcut.register('Ctrl+P', () => {
    if (win) {
      win.webContents.send('play-pause-shortcut')
    }
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
