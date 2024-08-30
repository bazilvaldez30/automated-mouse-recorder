import { contextBridge } from 'electron'
import robot from 'robotjs'

// Expose API to the renderer process
contextBridge.exposeInMainWorld('electron', {
  robot: {
    moveMouse: (x, y) => robot.moveMouse(x, y),
    mouseClick: () => robot.mouseClick(),
  },
})

contextBridge.exposeInMainWorld('electron', {
  connectionCheck: () => console.log('Checking-the-connection!'),
})
