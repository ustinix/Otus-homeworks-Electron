<script setup lang="ts">
import FilePanel from './FilePanel.vue'
</script>

<template>
  <div class="file-manager">
    <h1>Файловый менеджер</h1>
    <div class="panels-container">
      <FilePanel panel-id="left" />
      <FilePanel panel-id="right" />
    </div>
  </div>
</template>

<style scoped>
.panels-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}
</style>
