import Vue from 'vue'
import VueRouter from 'vue-router'
import PCA from '../views/PCA.vue'
import Organism from '../views/Organism.vue'
import Panache from '../views/Panache.vue'
import Circos from '../views/Circos.vue'

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
  routes
})

export default router
