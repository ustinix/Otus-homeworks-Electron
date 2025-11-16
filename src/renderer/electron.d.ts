import type { Recipe } from '../../src/types/recipe'

interface ElectronAPI {
  saveRecipe: (data: {
    category: string
    name: string
    content: string
    image?: string
    imageName?: string
  }) => Promise<{ success: boolean; error?: string }>
  getRecipes: () => Promise<Recipe[]>
  getRecipeContent: (recipeName: string) => Promise<{
    success: boolean
    content?: string
    category?: string
    image?: string
    imageName?: string
    error?: string
  }>
  deleteRecipe: (recipeName: string) => Promise<{ success: boolean; error?: string }>
}

declare global {
  interface Window {
    recipes: ElectronAPI
  }
}

export {}
