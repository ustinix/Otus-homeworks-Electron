import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Recipe } from '../types/recipe'

export const useRecipesStore = defineStore('recipes', () => {
  const recipes = ref<Recipe[]>([])
  const loading = ref(false)
  const selectedRecipe = ref<Recipe | null>(null)
  const error = ref<string | null>(null)

  const recipesCount = computed(() => recipes.value.length)

  const loadRecipes = async (): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const loadedRecipes = await window.recipes.getRecipes()
      recipes.value = loadedRecipes
    } catch (err) {
      error.value = 'Ошибка загрузки рецептов'
      console.error('❌ Ошибка загрузки рецептов:', err)
    } finally {
      loading.value = false
    }
  }

  const saveRecipe = async (category: string, name: string, content: string): Promise<boolean> => {
    loading.value = true
    try {
      const result = await window.recipes.saveRecipe({ category, name, content })
      if (result.success) {
        await loadRecipes()
        return true
      } else {
        error.value = result.error || 'Ошибка сохранения'
        return false
      }
    } catch (err) {
      error.value = 'Ошибка при сохранении рецепта'
      console.error('Ошибка:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const deleteRecipe = async (recipeName: string): Promise<void> => {
    loading.value = true
    try {
      const result = await window.recipes.deleteRecipe(recipeName)
      if (result.success) {
        await loadRecipes() // ← теперь это работает!
      } else {
        error.value = result.error || 'Ошибка удаления'
      }
    } catch (err) {
      error.value = 'Ошибка при удалении рецепта'
      console.error('Ошибка удаления:', err)
    } finally {
      loading.value = false
    }
  }

  const viewRecipe = async (recipeName: string): Promise<void> => {
    loading.value = true
    try {
      const recipe = recipes.value.find((r) => r.name === recipeName)
      if (recipe) {
        selectedRecipe.value = recipe
      } else {
        const result = await window.recipes.getRecipeContent(recipeName)
        if (result.success && result.content) {
          selectedRecipe.value = {
            name: recipeName,
            content: result.content,
            category: result.category || ''
          }
        } else {
          error.value = result.error || 'Не удалось загрузить рецепт'
        }
      }
    } catch (err) {
      error.value = 'Ошибка при загрузке рецепта'
      console.error('Ошибка загрузки рецепта:', err)
    } finally {
      loading.value = false
    }
  }

  const clearError = (): void => {
    error.value = null
  }

  const clearSelectedRecipe = (): void => {
    selectedRecipe.value = null
  }

  return {
    recipes,
    loading,
    selectedRecipe,
    error,
    recipesCount,
    loadRecipes,
    saveRecipe,
    deleteRecipe,
    viewRecipe,
    clearError,
    clearSelectedRecipe
  }
})
