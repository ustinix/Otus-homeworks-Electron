import * as fs from 'fs'
import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

let mainWindow: BrowserWindow | null = null

const recipesDir = join(app.getPath('userData'), 'recipes')

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) return
    mainWindow.show()
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

ipcMain.handle('save-recipe', async (_, { category, name, content, image, imageName }) => {
  try {
    await fs.promises.mkdir(recipesDir, { recursive: true })
    const fileName = name.replace(/[^a-z0-9а-яё]/gi, '_').toLowerCase() + '.json'
    const filePath = join(recipesDir, fileName)

    const recipeData = {
      category,
      name,
      content,
      image,
      imageName,
      createdAt: new Date().toISOString()
    }

    await fs.promises.writeFile(filePath, JSON.stringify(recipeData, null, 2), 'utf8')
    return { success: true }
  } catch (error) {
    console.error('Ошибка сохранения:', error)
    return { success: false, error: error }
  }
})
ipcMain.handle('get-recipes', async () => {
  try {
    await fs.promises.mkdir(recipesDir, { recursive: true })
    const files = await fs.promises.readdir(recipesDir)

    const recipes: Array<{
      name: string
      category: string
      content: string
      image?: string
      imageName?: string
    }> = []

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filePath = join(recipesDir, file)
          const content = await fs.promises.readFile(filePath, 'utf8')
          const recipeData = JSON.parse(content)

          recipes.push({
            name: recipeData.name,
            category: recipeData.category,
            content: recipeData.content,
            image: recipeData.image,
            imageName: recipeData.imageName
          })
        } catch (err) {
          console.error(`❌ main: error reading file ${file}:`, err)
        }
      }
    }
    return recipes
  } catch (error) {
    console.error('❌ main: get-recipes error:', error)
    return []
  }
})

ipcMain.handle('get-recipe-content', async (_, recipeName) => {
  try {
    const fileName = recipeName.replace(/[^a-z0-9а-яё]/gi, '_').toLowerCase() + '.json'
    const filePath = join(recipesDir, fileName)
    const content = await fs.promises.readFile(filePath, 'utf8')
    const recipe = JSON.parse(content)
    return {
      success: true,
      content: recipe.content,
      category: recipe.category,
      image: recipe.image,
      imageName: recipe.imageName
    }
  } catch (error) {
    console.error('Ошибка чтения рецепта:', error)
    return { success: false, error: error }
  }
})

ipcMain.handle('delete-recipe', async (_, recipeName) => {
  try {
    const fileName = recipeName.replace(/[^a-z0-9а-яё]/gi, '_').toLowerCase() + '.json'
    const filePath = join(recipesDir, fileName)
    await fs.promises.rm(filePath, { force: true })
    return { success: true }
  } catch (error) {
    console.error('Ошибка удаления рецепта:', error)
    return { success: false, error: (error as Error).message }
  }
})

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron.recipe-app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
