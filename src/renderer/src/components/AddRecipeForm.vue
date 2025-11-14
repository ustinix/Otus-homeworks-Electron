<script setup lang="ts">
import { useRecipesStore } from '../../../stores/recipes'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

const store = useRecipesStore()
const { loading } = storeToRefs(store)
const { saveRecipe } = store

const categories = [
  'завтраки',
  'первые блюда',
  'вторые блюда',
  'закуски',
  'салаты',
  'напитки',
  'десерты',
  'соусы'
]

const category = ref('')
const name = ref('')
const content = ref('')

const isFormValid = computed(() => {
  return (
    name.value.trim().length > 0 && content.value.trim().length > 0 && category.value.length > 0
  )
})

const handleSave = (): void => {
  if (isFormValid.value) {
    saveRecipe(category.value, name.value.trim(), content.value.trim())
    clearForm()
  }
}

const clearForm = (): void => {
  name.value = ''
  content.value = ''
  category.value = ''
}
</script>

<template>
  <section class="add-recipe">
    <h2>Добавить новый рецепт</h2>
    <div class="input-group">
      <label class="label" for="category-select">Выберите категорию:</label>
      <select v-model="category" name="category" id="category-select" :disabled="loading">
        <option value="">-- Выберите категорию --</option>
        <option v-for="categoryItem in categories" :key="categoryItem" :value="categoryItem">
          {{ categoryItem }}
        </option>
      </select>
      <input
        v-model="name"
        type="text"
        placeholder="Название рецепта"
        class="input"
        :disabled="loading"
      />
      <textarea
        v-model="content"
        placeholder="Описание рецепта или ингредиенты..."
        class="textarea"
        rows="5"
        :disabled="loading"
      ></textarea>
      <div class="form-actions">
        <button :disabled="!isFormValid || loading" class="btn btn-primary" @click="handleSave">
          <span v-if="loading">Сохранение...</span>
          <span v-else>Сохранить рецепт</span>
        </button>
        <button class="btn btn-secondary" @click="clearForm" :disabled="loading">Очистить</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.add-recipe {
  width: 70vw;
  min-width: 300px;
  max-width: 500px;
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.add-recipe h2 {
  margin-top: 0;
  color: #495057;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 10px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 500px;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.input,
.textarea {
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  font-family: inherit;
}

.input:focus,
.textarea:focus {
  outline: none;
  border-color: #007acc;
}

.textarea {
  resize: vertical;
  min-height: 120px;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  font-family: inherit;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-primary {
  background: #007acc;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #005a9e;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
}

.label {
  color: #495057;
}
</style>
