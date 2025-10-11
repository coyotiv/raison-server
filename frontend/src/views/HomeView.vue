<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue'
</script>

<template>
  <DefaultLayout>
    <template #appbar-actions>
      <v-btn variant="text" to="/login">Login</v-btn>
    </template>

    <div class="d-flex align-center justify-space-between">
      <h1 class="text-h4 mb-4">Dashboard</h1>
    </div>

    <v-card>
      <v-card-text>Hallo Vuetify 🎉</v-card-text>
    </v-card>
  </DefaultLayout>
</template>
