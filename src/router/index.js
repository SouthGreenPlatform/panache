import Vue from 'vue'
import VueRouter from 'vue-router'
import Panache from '../views/Panache.vue'

// Poke rounting system, in prevision of more views for the future
Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Panache',
    component: Panache,
  },
  {
    path: '/panache',
    redirect: { name: 'Panache' },
  },
]

const router = new VueRouter({
  mode: "history",
  routes
})

export default router
