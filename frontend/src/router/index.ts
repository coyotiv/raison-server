import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/auth' // or whatever store you have

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView, meta: { layout: 'default', requiresAuth: true } },
    // { path: '/login', component: LoginView, meta: { layout: 'auth' } },
  ],
})

// router.beforeEach((to) => {
//   const auth = useAuthStore()
//   if (to.meta.requiresAuth && !auth.isLoggedIn) {
//     return { path: '/login', query: { redirect: to.fullPath } }
//   }
//   if (to.path === '/login' && auth.isLoggedIn) {
//     return { path: (to.query.redirect as string) || '/' }
//   }
// })

export default router
