import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView, meta: { layout: 'default' } },
    { path: '/login', component: LoginView, meta: { layout: 'auth' } },
  ],
})
