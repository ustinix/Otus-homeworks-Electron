import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { ipcRenderer } from 'electron/renderer'

const api = {
  requestFiles: (panelId: string) => {
    ipcRenderer.send('request-files', panelId)
  },
  onFilesUpdated: (
    callback: (data: { panelId: string; files: string[]; currentPath: string }) => void
  ) => {
    ipcRenderer.on('files-updated', (_event, data) => callback(data))
  },
  changeDirectory: (panelId: string, path: string) => {
    return ipcRenderer.invoke('change-directory', panelId, path)
  },

  createFolder: (panelId: string, name: string) => {
    return ipcRenderer.invoke('create-folder', panelId, name)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
