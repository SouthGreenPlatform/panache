import Vue from 'vue'
import VueRouter from 'vue-router'
import Global from '../views/Global.vue'
import PCA from '../views/PCA.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Global',
    component: Global
  },
  {
    path: '/pca',
    name: 'PCA',
    component: PCA
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
