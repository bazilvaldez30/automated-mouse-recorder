const { contextBridge } = require('electron')
const axios = require('axios')
const { ipcRenderer } = require('electron')

// Expose API to the renderer process

contextBridge.exposeInMainWorld('electron', {
  connectionCheck: () => console.log('Checking-the-connection!'),
  /* robot: {
    moveMouse: (x, y) => robot.moveMouse(x, y),
    mouseClick: () => robot.mouseClick(),
  }, */
})

contextBridge.exposeInMainWorld('ipcRenderer', {
  on: (channel, listener) => {
    const validChannels = [
      'replay-shortcut',
      'start-recording-shortcut',
      'stop-recording-shortcut',
      'pause-resume-replay',
    ]
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => listener(...args))
    }
  },
  send: (channel, data) => {
    const validChannels = [
      'replay-shortcut',
      'start-recording-shortcut',
      'stop-recording-shortcut',
      'pause-resume-replay',
    ]
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
})

// ================== Expose the helpers object to the renderer process ==================
contextBridge.exposeInMainWorld('helpers', {
  moveMouse: async (x, y) => {
    try {
      const response = await axios.get(`http://localhost:3000/move-mouse`, {
        params: { x, y },
      })
      console.log('Mouse moved to:', x, y)
    } catch (error) {
      console.error('Error:', error)
    }
  },

  clickMouse: async (x, y) => {
    try {
      const response = await axios.get(`http://localhost:3000/click-mouse`, {
        params: { x, y },
      })
      console.log('Success:', 'Mouse clicked at', x, y)
    } catch (error) {
      console.error('Error:', error)
    }
  },
})
