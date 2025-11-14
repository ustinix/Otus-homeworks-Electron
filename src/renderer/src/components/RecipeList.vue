<script setup lang="ts">
import { useRecipesStore } from '../../../stores/recipes'
import { storeToRefs } from 'pinia'
import { Recipe } from 'src/types/recipe'
import { ref, computed } from 'vue'

const store = useRecipesStore()
const { recipes, loading } = storeToRefs(store)

const searchQuery = ref('')
const selectedCategory = ref('')
const sortField = ref<'name' | 'category'>('name')
const sortDirection = ref<'asc' | 'desc'>('asc')

const categories = computed(() => {
  const uniqueCategories = [...new Set(recipes.value.map((recipe) => recipe.category))]
  return uniqueCategories.sort()
})

const filteredRecipes = computed(() => {
  let filtered = recipes.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((recipe) => recipe.name.toLowerCase().includes(query))
  }

  if (selectedCategory.value) {
    filtered = filtered.filter((recipe) => recipe.category === selectedCategory.value)
  }

  filtered = [...filtered].sort((a, b) => {
    const getSortValue = (recipe: Recipe, field: 'name' | 'category'): string => {
      const value = recipe[field]
      return value ? value.toLowerCase() : ''
    }

    const aValue = getSortValue(a, sortField.value)
    const bValue = getSortValue(b, sortField.value)

    if (sortDirection.value === 'asc') {
      return aValue.localeCompare(bValue)
    } else {
      return bValue.localeCompare(aValue)
    }
  })

  return filtered
})

const toggleSort = (field: 'name' | 'category'): void => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const clearFilters = (): void => {
  searchQuery.value = ''
  selectedCategory.value = ''
  sortField.value = 'name'
  sortDirection.value = 'asc'
}

const downloadRecipe = (recipe: Recipe): void => {
  try {
    const recipeText = formatRecipeAsText(recipe)

    const blob = new Blob([recipeText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `${recipe.name.replace(/[^a-zа-яё0-9]/gi, '_')}.txt`
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log(`Рецепт "${recipe.name}" успешно скачан`)
  } catch (error) {
    console.error('Ошибка при скачивании рецепта:', error)
    alert('Произошла ошибка при скачивании рецепта')
  }
}

const formatRecipeAsText = (recipe: Recipe): string => {
  let text = `${recipe.name}\n`
  text += `Категория: ${recipe.category}\n`
  text += `Описание: ${recipe.content}\n`
  return text
}
</script>

<template>
  <section class="recipes-list">
    <div class="list-header">
      <h2>Мои рецепты ({{ filteredRecipes.length }})</h2>
      <div class="filters-panel">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск по названию..."
            class="search-input"
          />
        </div>

        <div class="filter-group">
          <select v-model="selectedCategory" class="filter-select">
            <option value="">Все категории</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>

        <button @click="clearFilters" class="btn btn-outline">Сбросить</button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      Загрузка...
    </div>

    <div v-else-if="recipes.length === 0" class="empty">Пока нет сохраненных рецептов</div>

    <div v-else-if="filteredRecipes.length === 0" class="empty">Рецепты не найдены</div>

    <div v-else class="table-container">
      <table class="recipes-table">
        <thead>
          <tr>
            <th
              :class="{ sortable: true, sorted: sortField === 'name' }"
              @click="toggleSort('name')"
            >
              Название рецепта
              <span class="sort-indicator">
                {{ sortField === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
              </span>
            </th>
            <th
              :class="{ sortable: true, sorted: sortField === 'category' }"
              @click="toggleSort('category')"
            >
              Категория
              <span class="sort-indicator">
                {{ sortField === 'category' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
              </span>
            </th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="recipe in filteredRecipes" :key="recipe.name" class="recipe-row">
            <td class="recipe-name">
              <strong>{{ recipe.name }}</strong>
            </td>
            <td class="recipe-category">
              <span class="category-badge">{{ recipe.category }}</span>
            </td>
            <td class="recipe-actions">
              <button class="btn btn-sm btn-outline" @click="store.viewRecipe(recipe.name)">
                Просмотреть
              </button>
              <button
                class="btn btn-sm btn-success"
                title="Скачать рецепт в TXT"
                @click="downloadRecipe(recipe)"
              >
                Скачать
              </button>
              <button class="btn btn-sm btn-danger" @click="store.deleteRecipe(recipe.name)">
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.recipes-list {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.list-header h2 {
  margin: 0;
  color: #495057;
}

.filters-panel {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  min-width: 200px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  background: #f8f9fa;
}

.btn-outline {
  border-color: #6c757d;
  color: #6c757d;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.btn-danger:hover {
  background: #c82333;
}

.table-container {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.recipes-table {
  width: 100%;
  border-collapse: collapse;
}

.recipes-table th {
  background: #f8f9fa;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
  cursor: pointer;
  user-select: none;
}

.recipes-table th.sortable:hover {
  background: #e9ecef;
}

.recipes-table th.sorted {
  background: #007acc;
  color: white;
}

.sort-indicator {
  margin-left: 5px;
  font-weight: bold;
}

.recipes-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #dee2e6;
}

.recipe-row:hover {
  background: #f8f9fa;
}

.recipe-name {
  color: black;
  font-weight: 500;
}

.category-badge {
  background: #007acc;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.recipe-actions {
  display: flex;
  gap: 8px;
}

.loading,
.empty {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-size: 16px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e9ecef;
  border-top: 2px solid #007acc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .list-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-panel {
    justify-content: space-between;
  }

  .search-input {
    min-width: 150px;
  }

  .recipe-actions {
    flex-direction: column;
  }
}
</style>
