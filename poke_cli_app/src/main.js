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
    zoomLevel: {
      current: 1,
      minEfficiency: 1,
      minGlobal: 0.01,
      max: 2
    },  // Valeur du filtre local -> Zoom level
    localHandle: "",
    firstNtDisplay: 0, // enregistre le premier nt à afficher

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
