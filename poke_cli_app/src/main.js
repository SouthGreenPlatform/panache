import '@babel/polyfill'
import 'mutationobserver-shim'

import Vue from 'vue'
import Vuex from 'vuex'
import './plugins/bootstrap-vue'
import App from './App.vue'
import router from './router'

Vue.use(Vuex)
Vue.config.productionTip = false

// Au dessus on import vuex et on défini ici les variables globales qui seront accessible sur tout les components
const store = new Vuex.Store({
  state: {
    coreThresholdSlide: 85, // Valeur du filtre local -> Minimal presence ratio to be part of core
    zoomLevel: "",  // Valeur du filtre local -> Zoom level

    //définition des couleurs en varaibles globale, car elles sont utilisées dans divers components
    pseudoRainbowColorScale: "",
    greenColorScale: "",
    blueColorScale: "",
    orangeColorScale: "",
    functionColorScale: "",
  }
})

new Vue({
  router,
  store: store,
  render: h => h(App)
}).$mount('#app')
