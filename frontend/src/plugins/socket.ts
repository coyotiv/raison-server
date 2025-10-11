import type { App } from 'vue'
import type { Pinia } from 'pinia'
import { getSocket } from '@/lib/socket'
import { useAgentsStore } from '@/stores/agents'

let installed = false

export default {
  install(app: App) {
    if (installed) return
    installed = true

    const socket = getSocket()
    const pinia = app.config.globalProperties.$pinia as Pinia | undefined
    if (!pinia) {
      throw new Error('Pinia instance not found on Vue app. Ensure createPinia() is installed before socket plugin.')
    }

    const agentsStore = useAgentsStore(pinia)

    agentsStore.initializeSocketListeners(socket)

    socket.on('connect', () => {
      // eslint-disable-next-line no-console
      console.log('[socket.io] Connected', socket.id)
    })

    socket.on('connect_error', (error: unknown) => {
      // eslint-disable-next-line no-console
      if (error instanceof Error) {
        console.error('[socket.io] Connection error', error.message)
      } else {
        console.error('[socket.io] Connection error', error)
      }
      agentsStore.error = 'Realtime connection failed'
    })

    socket.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.warn('[socket.io] Disconnected', socket.id)
    })

    app.config.globalProperties.$socket = socket
  },
}
