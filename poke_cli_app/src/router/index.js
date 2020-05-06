import Vue from 'vue'
import VueRouter from 'vue-router'
import Global from '../views/Global.vue'
import PCA from '../views/PCA.vue'
import Organism from '../views/Organism.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/global',
    name: 'Global',
    component: Global
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
    path: '/local',
    name: 'Local',
    props: true,

    component: () => import('../views/Local.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
