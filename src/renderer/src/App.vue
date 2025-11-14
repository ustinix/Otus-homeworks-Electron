<script setup lang="ts">
import { onMounted } from 'vue'
import { useRecipesStore } from '../../stores/recipes'
import AddRecipeForm from './components/AddRecipeForm.vue'
import RecipesList from './components/RecipeList.vue'
import RecipeModal from './components/RecipeModal.vue'
import { storeToRefs } from 'pinia'

const store = useRecipesStore()
const { selectedRecipe, recipesCount, error } = storeToRefs(store)
const { loadRecipes, clearError } = store
onMounted(() => {
  loadRecipes()
})
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>📖 Книга рецептов (всего рецептов {{ recipesCount }})</h1>
      <div v-if="error" class="error-message">
        {{ error }}
        <button class="close-error" @click="clearError">×</button>
      </div>
    </header>

    <main class="main">
      <AddRecipeForm />
      <RecipesList />
    </main>

    <RecipeModal v-if="selectedRecipe" :recipe="selectedRecipe" />
  </div>
</template>

<style scoped>
.app {
  padding: 20px;
  font-family: Arial, sans-serif;
  margin: 0 auto;
  height: 100vh;
  width: 100vw;
  overflow-y: auto;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 20px;
  position: relative;
}

.header h1 {
  margin: 0;
  color: #f8f8f8;
}

.error-message {
  position: absolute;
  top: 0;
  right: 0;
  background: #f8d7da;
  color: #721c24;
  padding: 10px 15px;
  border-radius: 6px;
  border: 1px solid #f5c6cb;
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-error {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #721c24;
}

.main {
  display: grid;
  gap: 40px;
}
</style>
