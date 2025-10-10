<script setup lang="ts">
import { onMounted } from 'vue'
import axios from 'axios'

onMounted(async () => {
  try {
    const res = await axios.get('/api/users')
    console.log(res.data)
  } catch (err) {
    console.error('Failed to fetch /users:', err)
  }
})
</script>

<template>
  <h1>You did it!</h1>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
</template>

<style scoped></style>
