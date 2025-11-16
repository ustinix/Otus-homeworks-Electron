<script setup lang="ts">
import { useRecipesStore } from '../../../stores/recipes'
import type { Recipe } from '../../../types/recipe'

interface Props {
  recipe: Recipe
}

defineProps<Props>()

const store = useRecipesStore()

const handleClose = (): void => {
  store.clearSelectedRecipe()
}
</script>

<template>
  <div class="modal" @click="handleClose">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <div class="recipe-header">
          <div class="recipe-meta">
            <span class="recipe-category">{{ recipe.category }}</span>
          </div>
          <div v-if="recipe.image" class="recipe-image">
            <img :src="recipe.image" :alt="recipe.name" class="image" />
          </div>
          <h2 class="recipe-title">{{ recipe.name }}</h2>
        </div>
        <button class="close-btn" @click="handleClose">&times;</button>
      </div>
      <div class="modal-body">
        <div class="recipe-content">
          <pre>{{ recipe.content }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 0;
  border-radius: 12px;
  max-width: 700px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 25px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.recipe-header {
  flex: 1;
  margin-right: 15px;
}
.recipe-image {
  flex-shrink: 0;
}

.image {
  width: 250px;
  height: auto;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e9ecef;
}
.image-name {
  margin: 5px 0 0 0;
  font-size: 12px;
  color: #6c757d;
}
.recipe-meta {
  margin-bottom: 8px;
}

.recipe-category {
  display: inline-block;
  background: #007acc;
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.recipe-title {
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
  line-height: 1.2;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.close-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.modal-body {
  padding: 25px;
  max-height: 60vh;
  overflow-y: auto;
}

.recipe-content {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.recipe-content pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  line-height: 1.6;
  color: #495057;
  font-size: 14px;
}
</style>
