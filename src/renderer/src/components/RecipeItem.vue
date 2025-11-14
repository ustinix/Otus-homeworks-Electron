<script setup lang="ts">
import { useRecipesStore } from '../../../stores/recipes'
import type { Recipe } from '../../../types/recipe'

interface Props {
  recipe: Recipe
}

const props = defineProps<Props>()

const { viewRecipe, deleteRecipe } = useRecipesStore()

const handleView = (): void => {
  viewRecipe(props.recipe.name)
}

const handleDelete = async (): Promise<void> => {
  if (confirm(`Удалить рецепт "${props.recipe.name}"?`)) {
    await deleteRecipe(props.recipe.name)
  }
}
</script>

<template>
  <div class="recipe-item">
    <div class="recipe-info">
      <span class="recipe-category">{{ recipe.category }}</span>
      <h3 class="recipe-name">{{ recipe.name }}</h3>
    </div>
    <div class="recipe-actions">
      <button class="btn btn-secondary" @click="handleView">Просмотреть</button>
      <button class="btn btn-danger" @click="handleDelete">Удалить</button>
    </div>
  </div>
</template>

<style scoped>
.recipe-item {
  padding: 20px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  transition: all 0.2s;
}

.recipe-item:hover {
  border-color: #007acc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.recipe-name {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 500;
}

.recipe-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}
</style>
