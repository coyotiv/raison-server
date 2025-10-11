<template>
  <v-card max-width="420" width="100%">
    <v-card-title class="text-h6 text-center">Login</v-card-title>
    <v-card-text>
      <v-text-field v-model="email" label="Email" type="email" />
      <v-text-field v-model="password" label="Password" type="password" />
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn :loading="loading" @click="doLogin" color="primary">Login</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const email = ref('')
const password = ref('')
const loading = ref(false)
const router = useRouter()
const auth = useAuthStore()

async function doLogin() {
  loading.value = true
  const res = await auth.login({ email: email.value, password: password.value })
  loading.value = false
  if (res.ok) router.push('/')
}
</script>
