import { contextBridge, ipcRenderer } from 'electron'

const recipes = {
  saveRecipe: (data: { category: string; name: string; content: string }) =>
    ipcRenderer.invoke('save-recipe', data),
  getRecipes: () => ipcRenderer.invoke('get-recipes'),
  getRecipeContent: (recipeName: string) => ipcRenderer.invoke('get-recipe-content', recipeName),
  deleteRecipe: (recipeName: string) => ipcRenderer.invoke('delete-recipe', recipeName)
}

contextBridge.exposeInMainWorld('recipes', recipes)
