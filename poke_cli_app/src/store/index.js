import Vue from 'vue'
import Vuex from 'vuex'
import * as d3 from 'd3'

Vue.use(Vuex)

// The store gives access to some variables through the whole app^
// Values in here are mainly default values, to update depending on user inputs
export default new Vuex.Store({
  state: {
    coreThresholdSlide: 85, // Minimal presence ratio to be part of core, should be turn into a % !
    zoomLevel: {
      current: 0.5, // Updates --> minEfficiency per default, or user input
      minEfficiency: 1, // Updates --> max size under which too many elements are displayed, causing lag
      minGlobal: 0.01, // Updates --> min size to see all nt at once
      max: 2 // Arbitrary value, it would not make much sense to see them bigger right now
    },
    // Coords of the first and last nt to display on the block level vis
    firstNtToDisplay: 0,
    lastNtToDisplay: 1200,
    chromSelected: 0, // Stores the id of the chrom to display at the block level vis
    // It should be a String...

    // Color scales used throughout the app
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
  // functions to call within the app to apply mutations to the store, asynch
  actions: {
    updateFirstNtToDisplay({commit}, ntIndex) {
      commit('SET_NEW_FIRST_NT', ntIndex)
    },
    updateLastNtToDisplay({commit}, ntIndex) {
      commit('SET_NEW_LAST_NT', ntIndex)
    }
  },
})