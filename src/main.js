import '@babel/polyfill'
import 'mutationobserver-shim'

import Vue from 'vue'
import './plugins/bootstrap-vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

// Au dessus on import vuex et on défini ici les variables globales qui seront accessible sur tout les components

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
