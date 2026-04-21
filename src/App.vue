<template>
  <div>
    <SplashScreen v-if="showSplash" @done="showSplash = false" />
    <RouterView v-else />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import SplashScreen from './components/SplashScreen.vue'

const showSplash = ref(true)
</script>