import Vue from 'vue'
import VueRouter from 'vue-router'
//import Global from '../views/Global.vue'
import PCA from '../views/PCA.vue'
import Organism from '../views/Organism.vue'
import Panache from '../views/Panache.vue'
import Circos from '../views/Circos.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/global',
    name: 'Circos',
    component: Circos
  },
  {
    path: '/panache',
    name: 'Panache',
    component: Panache
  },
  {
    path: '/pca',
    name: 'PCA',
    component: PCA
  },
  {
    path: '/',
    name: 'Organism',
    component: Organism
  },
  {
    path: '/circos',
    name: 'Circos',
    component: Circos
  },
  {
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
