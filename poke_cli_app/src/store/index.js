import Vue from 'vue'
import Vuex from 'vuex'
import * as d3 from 'd3'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    coreThresholdSlide: 85, // Valeur du filtre local -> Minimal presence ratio to be part of core
    zoomLevel: {
      current: 0.5,
      minEfficiency: 1,
      minGlobal: 0.01,
      max: 2
    },  // Valeur du filtre local -> Zoom level
    firstNtToDisplay: 0, // enregistre le premier nt à afficher
    lastNtToDisplay: 1200,
    chromSelected: 0, // enregistre le chromosome selectionné à afficher pour la vue Local diversity

    //définition des couleurs en varaibles globale, car elles sont utilisées dans divers components
    pseudoRainbowColorScale: d3.scaleLinear().range([d3.hcl('yellow'), d3.hcl('yellow')]),
    greenColorScale: d3.scaleLinear().range([d3.hcl('green'), d3.hcl('green')]),
    blueColorScale: d3.scaleLinear().range([d3.hcl('blue'), d3.hcl('blue')]),
    orangeColorScale: d3.scaleLinear().range([d3.hcl('orange'), d3.hcl('orange')]),
    functionColorScale: d3.scaleLinear().range([d3.hcl('purple'), d3.hcl('purple')]),

  },
  mutations: {
    SET_NEW_FIRST_NT(state, payload) {
      state.firstNtToDisplay = payload
    },
    SET_NEW_LAST_NT(state, payload) {
      state.lastNtToDisplay = payload
    }
  },
  actions: {
    updateFirstNtToDisplay({commit}, ntIndex) {
      commit('SET_NEW_FIRST_NT', ntIndex)
    },
    updateLastNtToDisplay({commit}, ntIndex) {
      commit('SET_NEW_LAST_NT', ntIndex)
    }
  },
})