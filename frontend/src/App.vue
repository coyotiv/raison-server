<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

const route = useRoute()
const layouts = { default: DefaultLayout, auth: AuthLayout }
const layout = computed(() => layouts[(route.meta.layout as 'auth' | 'default') || 'default'])
</script>

<template>
  <component :is="layout">
    <RouterView />
  </component>
</template>
