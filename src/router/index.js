import Vue from 'vue'
import VueRouter from 'vue-router'
import Panache from '../views/Panache.vue'

// Poke rounting system, in prevision of more views for the future
Vue.use(VueRouter)

  const routes = [
  {
    path: '/panache',
    name: 'Panache',
    component: Panache
  },
  {
    path: '/',
    name: 'Panache',
    component: Panache
  },
  {  //I have no idea what this ones does, I'll have to check
    path: '/local',
    name: 'Panache',
    props: true,

    component: () => import('../views/Panache.vue')
  }
]

const router = new VueRouter({
  mode: "history",
  routes
})

export default router
