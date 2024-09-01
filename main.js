const { app, BrowserWindow, globalShortcut } = require('electron')
const path = require('path')
const url = require('url')

let win

function createWindow() {
  win = new BrowserWindow({
    width: 950,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
    },
  })

  win.webContents.openDevTools()

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'))

  /*  ================== Register the global shortcut ==================  */

  // Register global shortcuts
  const shortcuts = [
    { key: 'Ctrl+R', action: 'replay-shortcut' },
    { key: 'Ctrl+S', action: 'stop-recording-shortcut' },
    { key: 'Ctrl+P', action: 'start-recording-shortcut' },
    { key: 'Ctrl+Q', action: 'pause-resume-replay' },
  ]

  shortcuts.forEach(({ key, action }) => {
    globalShortcut.register(key, () => {
      console.log(`${key} shortcut triggered`)

      if (win) {
        win.webContents.send(action)
      }
    })
  })
}

app.whenReady().then(() => {
  createWindow()

  win.on('closed', () => (win = null))

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
