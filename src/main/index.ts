import * as fs from 'fs'
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import * as diskInfo from 'node-disk-info'

let mainWindow: BrowserWindow | null = null

const panelStates = {
  left: { currentPath: 'computer' },
  right: { currentPath: 'computer' }
}

function getDrives(): string[] {
  try {
    const disks = diskInfo.getDiskInfoSync()
    return disks.map((disk) => disk.mounted)
  } catch (error) {
    console.error('Ошибка получения дисков через node-disk-info:', error)
    return []
  }
}

function getFiles(path: string): string[] {
  if (path === 'computer') {
    return getDrives()
  }

  try {
    return fs.readdirSync(path)
  } catch (error) {
    console.error('Error reading directory:', error)
    return []
  }
}

function sendFilesToPanel(panelId: string): void {
  if (!mainWindow) return
  const path = panelStates[panelId].currentPath
  const files = getFiles(path)

  mainWindow.webContents.send('files-updated', {
    panelId: panelId,
    files: files,
    currentPath: path
  })
}

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) return
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  //ipcMain.on('ping', () => console.log('pong'))
  ipcMain.on('request-files', (event, panelId: string) => {
    sendFilesToPanel(panelId)
  })

  ipcMain.handle('change-directory', (event, panelId: string, newPath: string) => {
    panelStates[panelId].currentPath = newPath
    sendFilesToPanel(panelId)
    return true
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
