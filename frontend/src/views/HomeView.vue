<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { computed, onMounted } from 'vue'
import { useAgentsStore } from '@/stores/agents'

const agentsStore = useAgentsStore()

onMounted(() => {
  if (!agentsStore.agents.length && !agentsStore.loading) {
    agentsStore.fetchAgents()
  }
})

const agents = computed(() => agentsStore.agents)
</script>

<template>
  <DefaultLayout>
    <template #appbar-actions>
      <v-btn variant="text" to="/login">Login</v-btn>
    </template>

    <div class="d-flex align-center justify-space-between mb-4">
      <h1 class="text-h4">Agents</h1>
      <div class="text-caption">
        <span v-if="agentsStore.loading">Loading…</span>
        <span v-else-if="agentsStore.error" class="text-error">{{ agentsStore.error }}</span>
        <span v-else>Realtime updates enabled</span>
      </div>
    </div>

    <v-card>
      <v-card-text>
        <v-list lines="two" density="comfortable">
          <v-list-item v-for="agent in agents" :key="agent._id">
            <v-list-item-title class="text-subtitle-1 font-weight-medium">
              {{ agent.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ agent.prompts?.length || 0 }} prompts
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="!agents.length && !agentsStore.loading">
            <v-list-item-title>No agents found.</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </DefaultLayout>
</template>
