<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useAgentsStore, type AgentDocument, type AgentPrompt } from '@/stores/agents'

const agentsStore = useAgentsStore()

const agents = computed(() => agentsStore.agents)

const newAgentName = ref('')
const newAgentPrompts = ref<Array<{ systemPrompt: string; version: string }>>([
  { systemPrompt: '', version: '' },
])
const newAgentError = ref('')
const isCreatingAgent = ref(false)
const isCreateAgentDisabled = computed(() => {
  const hasName = newAgentName.value.trim().length > 0
  const hasPromptWithContent = newAgentPrompts.value.some((prompt) => prompt.systemPrompt.trim().length > 0)
  return isCreatingAgent.value || !hasName || !hasPromptWithContent
})

const editingAgentId = ref<string | null>(null)
const editingAgentName = ref('')
const savingAgentId = ref<string | null>(null)
const deletingAgentId = ref<string | null>(null)

const isPromptDialogOpen = ref(false)
const promptForm = reactive<{
  agentId: string
  promptId: string | null
  systemPrompt: string
  version: string
}>(
  {
    agentId: '',
    promptId: null,
    systemPrompt: '',
    version: '',
  }
)
const isSavingPrompt = ref(false)
const deletingPromptId = ref<string | null>(null)

function resetPromptForm() {
  promptForm.agentId = ''
  promptForm.promptId = null
  promptForm.systemPrompt = ''
  promptForm.version = ''
}

function closePromptDialog() {
  isPromptDialogOpen.value = false
  resetPromptForm()
}

onMounted(async () => {
  if (!agentsStore.agents.length && !agentsStore.loading) {
    await agentsStore.fetchAgents()
  }
})

async function handleCreateAgent() {
  const trimmedName = newAgentName.value.trim()
  newAgentError.value = ''

  if (!trimmedName) {
    newAgentError.value = 'Agent name is required'
    return
  }

  const preparedPrompts = newAgentPrompts.value
    .map((prompt) => ({
      systemPrompt: prompt.systemPrompt.trim(),
      version: prompt.version.trim(),
    }))
    .filter((prompt) => prompt.systemPrompt.length > 0)
    .map((prompt) => ({
      systemPrompt: prompt.systemPrompt,
      ...(prompt.version.length ? { version: prompt.version } : {}),
    }))

  if (!preparedPrompts.length) {
    newAgentError.value = 'Please provide at least one prompt'
    return
  }

  isCreatingAgent.value = true
  try {
    await agentsStore.createAgent({ name: trimmedName, prompts: preparedPrompts })
    newAgentName.value = ''
    newAgentPrompts.value = [{ systemPrompt: '', version: '' }]
  } finally {
    isCreatingAgent.value = false
  }
}

function addNewAgentPromptField() {
  newAgentPrompts.value.push({ systemPrompt: '', version: '' })
}

function removeNewAgentPromptField(index: number) {
  if (newAgentPrompts.value.length === 1) {
    newAgentPrompts.value.splice(0, 1, { systemPrompt: '', version: '' })
    return
  }

  newAgentPrompts.value.splice(index, 1)
}

function startEditAgent(agent: AgentDocument) {
  editingAgentId.value = agent._id
  editingAgentName.value = agent.name
}

function cancelEditAgent() {
  editingAgentId.value = null
  editingAgentName.value = ''
}

async function submitEditAgent() {
  if (!editingAgentId.value) return
  if (!editingAgentName.value.trim()) return
  savingAgentId.value = editingAgentId.value
  try {
    await agentsStore.updateAgent(editingAgentId.value, { name: editingAgentName.value.trim() })
    cancelEditAgent()
  } finally {
    savingAgentId.value = null
  }
}

async function handleDeleteAgent(agent: AgentDocument) {
  if (!confirm(`Delete agent "${agent.name}" and all prompts?`)) return
  deletingAgentId.value = agent._id
  try {
    await agentsStore.deleteAgent(agent._id)
  } finally {
    deletingAgentId.value = null
  }
}

function openPromptDialog(agent: AgentDocument, prompt?: AgentPrompt) {
  promptForm.agentId = agent._id
  if (prompt) {
    promptForm.promptId = prompt._id
    promptForm.systemPrompt = prompt.systemPrompt
    promptForm.version = prompt.version ?? ''
  } else {
    promptForm.promptId = null
    promptForm.systemPrompt = ''
    promptForm.version = ''
  }
  isPromptDialogOpen.value = true
}

async function submitPromptForm() {
  if (!promptForm.agentId || !promptForm.systemPrompt.trim()) {
    return
  }
  isSavingPrompt.value = true
  try {
    const payload: { systemPrompt: string; version?: string } = {
      systemPrompt: promptForm.systemPrompt.trim(),
    }
    if (promptForm.version && promptForm.version.trim()) {
      payload.version = promptForm.version.trim()
    }

    if (promptForm.promptId) {
      await agentsStore.updatePrompt(promptForm.promptId, payload)
    } else {
      await agentsStore.createPrompt(promptForm.agentId, payload)
    }
    closePromptDialog()
  } finally {
    isSavingPrompt.value = false
  }
}

async function handleDeletePrompt(prompt: AgentPrompt) {
  if (!confirm('Delete this prompt?')) return
  deletingPromptId.value = prompt._id
  try {
    await agentsStore.deletePrompt(prompt._id)
  } finally {
    deletingPromptId.value = null
  }
}
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

    <v-card class="mb-4">
      <v-card-text>
        <v-form @submit.prevent="handleCreateAgent" class="d-flex flex-column ga-4">
          <v-text-field
            v-model="newAgentName"
            label="Agent name"
            variant="outlined"
            :disabled="isCreatingAgent"
            :error="Boolean(newAgentError && !newAgentPrompts.length)"
          />

          <div class="d-flex align-center justify-space-between">
            <div class="text-subtitle-2">Prompts</div>
            <v-btn size="small" variant="text" @click.prevent="addNewAgentPromptField">Add another prompt</v-btn>
          </div>

          <div class="d-flex flex-column ga-4">
            <v-card
              v-for="(prompt, index) in newAgentPrompts"
              :key="`new-agent-prompt-${index}`"
              variant="outlined"
            >
              <v-card-text class="d-flex flex-column ga-3">
                <v-textarea
                  v-model="prompt.systemPrompt"
                  label="System prompt"
                  variant="outlined"
                  auto-grow
                  :disabled="isCreatingAgent"
                />
                <div class="d-flex flex-wrap align-center ga-3">
                  <v-text-field
                    v-model="prompt.version"
                    label="Version (optional)"
                    variant="outlined"
                    :disabled="isCreatingAgent"
                    class="flex-grow-1"
                  />
                  <v-btn
                    size="small"
                    variant="text"
                    color="error"
                    :disabled="isCreatingAgent"
                    @click.prevent="removeNewAgentPromptField(index)"
                  >
                    Remove
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </div>

          <v-alert v-if="newAgentError" type="error" variant="tonal">{{ newAgentError }}</v-alert>

          <div class="d-flex justify-end">
            <v-btn color="primary" type="submit" :loading="isCreatingAgent" :disabled="isCreateAgentDisabled">
              Add Agent
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-text>
        <v-list lines="two" density="comfortable">
          <v-list-item v-for="agent in agents" :key="agent._id" class="flex-column align-start">
            <div class="w-100 d-flex align-center justify-space-between">
              <div class="d-flex align-center ga-3">
                <template v-if="editingAgentId === agent._id">
                  <v-text-field
                    v-model="editingAgentName"
                    label="Agent name"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="ma-0"
                  />
                  <v-btn
                    color="primary"
                    size="small"
                    :loading="savingAgentId === agent._id"
                    @click="submitEditAgent"
                  >
                    Save
                  </v-btn>
                  <v-btn size="small" variant="text" @click="cancelEditAgent">Cancel</v-btn>
                </template>
                <template v-else>
                  <v-list-item-title class="text-subtitle-1 font-weight-medium">
                    {{ agent.name }}
                  </v-list-item-title>
                  <v-btn size="small" variant="text" @click="startEditAgent(agent)">Edit</v-btn>
                </template>
              </div>
              <div class="d-flex align-center ga-2">
                <v-btn
                  color="error"
                  size="small"
                  variant="text"
                  :loading="deletingAgentId === agent._id"
                  @click="handleDeleteAgent(agent)"
                >
                  Delete agent
                </v-btn>
                <v-chip size="small" variant="tonal">
                  {{ agent.prompts?.length || 0 }} prompts
                </v-chip>
              </div>
            </div>

            <v-list-item-subtitle class="w-100 mt-3">
              <div class="text-body-2 font-weight-medium mb-1">Latest system prompt</div>
              <div>
                <template v-if="agent.systemPrompt">
                  {{ agent.systemPrompt }}
                </template>
                <template v-else>
                  <span class="text-medium-emphasis">No system prompt available</span>
                </template>
              </div>
              <div class="mt-3">
                <v-btn color="primary" size="small" @click="openPromptDialog(agent)">Add prompt</v-btn>
              </div>
              <div v-if="agent.prompts?.length" class="mt-4 w-100">
                <v-divider class="mb-3" />
                <div class="text-caption text-medium-emphasis mb-2">Prompt history</div>
                <v-list class="bg-transparent pa-0" density="compact">
                  <v-list-item v-for="prompt in agent.prompts" :key="prompt._id" class="px-0 py-2 prompt-item">
                    <div class="w-100">
                      <div class="d-flex align-start justify-space-between">
                        <div class="mr-4">
                          <v-list-item-title class="text-body-2">
                            {{ prompt.systemPrompt }}
                          </v-list-item-title>
                          <v-list-item-subtitle class="text-caption text-medium-emphasis">
                            Version: {{ prompt.version }} · Updated {{ new Date(prompt.updatedAt).toLocaleString() }}
                          </v-list-item-subtitle>
                        </div>
                        <div class="d-flex align-center ga-1">
                          <v-tooltip text="Edit prompt" location="bottom">
                            <template #activator="{ props }">
                              <v-btn
                                v-bind="props"
                                size="small"
                                variant="text"
                                density="comfortable"
                                class="ma-0"
                                @click.stop="openPromptDialog(agent, prompt)"
                              >
                                Edit
                              </v-btn>
                            </template>
                          </v-tooltip>
                          <v-tooltip text="Delete prompt" location="bottom">
                            <template #activator="{ props }">
                              <v-btn
                                v-bind="props"
                                size="small"
                                color="error"
                                variant="text"
                                density="comfortable"
                                class="ma-0"
                                :loading="deletingPromptId === prompt._id"
                                @click.stop="handleDeletePrompt(prompt)"
                              >
                                Delete
                              </v-btn>
                            </template>
                          </v-tooltip>
                        </div>
                      </div>
                    </div>
                  </v-list-item>
                </v-list>
              </div>
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="!agents.length && !agentsStore.loading">
            <v-list-item-title>No agents found.</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <v-dialog v-model="isPromptDialogOpen" max-width="600">
      <v-card>
        <v-card-title>{{ promptForm.promptId ? 'Edit prompt' : 'New prompt' }}</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="submitPromptForm">
            <v-textarea
              v-model="promptForm.systemPrompt"
              label="System prompt"
              rows="4"
              auto-grow
              variant="outlined"
              class="mb-4"
              :disabled="isSavingPrompt"
            />
            <v-text-field
              v-model="promptForm.version"
              label="Version (optional)"
              variant="outlined"
              :disabled="isSavingPrompt"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="closePromptDialog" :disabled="isSavingPrompt">Cancel</v-btn>
          <v-btn color="primary" :loading="isSavingPrompt" @click="submitPromptForm">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </DefaultLayout>
</template>
