<template>
  <div class="app">
    <Header />
    <router-view></router-view>
  </div>
</template>

<script setup>
import Header from './components/common/Header.vue'
</script>

<style>
.app {
  min-height: 100vh;
  background-color: #f5f7fa;
}
</style>
