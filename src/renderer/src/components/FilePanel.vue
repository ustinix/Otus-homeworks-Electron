<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface Props {
  panelId: 'left' | 'right'
}

const props = defineProps<Props>()

interface ElectronAPI {
  requestFiles: (panelId: string) => void
  onFilesUpdated: (
    callback: (data: { panelId: string; files: string[]; currentPath: string }) => void
  ) => void
  changeDirectory: (panelId: string, path: string) => Promise<void>
  createFolder: (panelId: string, name: string) => Promise<void>
}

declare const window: Window & { api: ElectronAPI }

const files = ref<string[]>([])
const currentPath = ref<string>('computer')

function handleFilesUpdated(data: { panelId: string; files: string[]; currentPath: string }): void {
  if (data.panelId === props.panelId) {
    files.value = data.files
    currentPath.value = data.currentPath
  }
}

function isComputerRoot(): boolean {
  return currentPath.value === 'computer'
}

function handleItemClick(item: string): void {
  if (isComputerRoot()) {
    window.api.changeDirectory(props.panelId, item)
  } else {
    const newPath = currentPath.value.endsWith('\\')
      ? currentPath.value + item
      : currentPath.value + '\\' + item
    window.api.changeDirectory(props.panelId, newPath)
  }
}

function goBack(): void {
  if (isComputerRoot()) return

  if (currentPath.value.includes('\\')) {
    const parts = currentPath.value.split('\\').filter((part) => part.length > 0)

    if (parts.length === 1) {
      window.api.changeDirectory(props.panelId, 'computer')
    } else {
      const newPath = parts.slice(0, -1).join('\\')
      window.api.changeDirectory(props.panelId, newPath)
    }
  }
}

function formatPath(path: string): string {
  if (path === 'computer') return 'Этот компьютер'
  return path
}

onMounted(() => {
  window.api.onFilesUpdated(handleFilesUpdated)
  window.api.requestFiles(props.panelId)
})
</script>

<template>
  <div class="file-panel">
    <div class="panel-header">
      <h3>Панель {{ panelId === 'left' ? 'Левая' : 'Правая' }}</h3>
    </div>

    <div class="path-bar">
      <button :disabled="isComputerRoot()" class="back-button" @click="goBack">← Назад</button>
      <span class="current-path">{{ formatPath(currentPath) }}</span>
    </div>

    <div class="file-list-container">
      <ul v-if="files.length > 0" class="file-list">
        <li
          v-for="file in files"
          :key="file"
          :class="{
            'drive-item': isComputerRoot(),
            'folder-item': !isComputerRoot(),
            'file-item': !isComputerRoot() && file.includes('.')
          }"
          @click="handleItemClick(file)"
          @dblclick="handleItemClick(file)"
        >
          <span class="icon">
            {{ isComputerRoot() ? '💾' : file.includes('.') ? '📄' : '📁' }}
          </span>
          <span class="name">{{ file }}</span>
          <span v-if="isComputerRoot()" class="type">[Диск]</span>
          <span v-else class="type">{{ file.includes('.') ? '[Файл]' : '[Папка]' }}</span>
        </li>
      </ul>

      <div v-else class="empty-state">
        <p>Нет файлов для отображения</p>
      </div>
    </div>

    <div class="panel-footer">
      <button
        :disabled="isComputerRoot()"
        class="create-folder-btn"
        @click="window.api.createFolder(panelId, 'Новая папка')"
      >
        📁 Создать папку
      </button>
    </div>
  </div>
</template>

<style scoped>
.file-panel {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  height: 500px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  margin-bottom: 12px;
}

.path-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.back-button {
  padding: 4px 8px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
}

.back-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.current-path {
  font-weight: bold;
}

.file-list-container {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 4px;
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.file-list li {
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-list li:hover {
  background-color: #f0f8ff;
}

.drive-item {
  font-weight: bold;
  color: #0066cc;
}

.folder-item {
  color: #008000;
}

.file-item {
  color: #666;
}

.icon {
  font-size: 16px;
}

.name {
  flex: 1;
}

.type {
  font-size: 12px;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.panel-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.create-folder-btn {
  padding: 8px 16px;
  background: #007acc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.create-folder-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
