import Vue from 'vue'
import Vuex from 'vuex'
import * as d3 from 'd3'

Vue.use(Vuex)

// The store gives access to some variables through the whole app^
// Values in here are mainly default values, to update depending on user inputs
export default new Vuex.Store({
  state: {
    coreThresholdSlide: 85, // Minimal presence ratio to be part of core, should be turn into a % !

    displayWindowWidth: 1200, //Should be responsively set

    currentDisplayNtWidthInPx: 0.5, // Updates --> minEfficiency per default, or user input
    // Coords of the first and last nt to display on the block level vis
    firstNtToDisplay: 0,
    lastNtToDisplay: 1200,
    lastNtOfChrom: 1200, //'Rightmost' nt of the dataset
    chromNames: ['0', '1', '2', '3'],
    chromSelected: '0', // Stores the id of the chrom to display at the block level vis

    // Color scales used throughout the app
    pseudoRainbowColorScale: d3.scaleLinear().range([d3.hcl('yellow'), d3.hcl('yellow')]),
    greenColorScale: d3.scaleLinear().range([d3.hcl('green'), d3.hcl('green')]),
    blueColorScale: d3.scaleLinear().range([d3.hcl('blue'), d3.hcl('blue')]),
    orangeColorScale: d3.scaleLinear().range([d3.hcl('orange'), d3.hcl('orange')]),
    functionColorScale: d3.scaleLinear().range([d3.hcl('purple'), d3.hcl('purple')]),

  },
  mutations: {
    SET_NEW_FIRST_NT_OF_DISPLAY(state, payload) {
      state.firstNtToDisplay = payload
    },
    SET_NEW_LAST_NT_OF_DISPLAY(state, payload) {
      state.lastNtToDisplay = payload
    },
    SET_GLOBAL_LAST_NT(state, payload) {
      state.lastNtOfChrom = payload
    },
    SET_NEW_CURRENT_ZOOM(state, payload) {
      state.currentDisplayNtWidthInPx = payload
    }
  },
  // Functions to call within the app to apply mutations to the store, asynch
  actions: {
    updateFirstNtToDisplay({commit}, ntIndex) {
      commit('SET_NEW_FIRST_NT_OF_DISPLAY', ntIndex)
    },
    updateLastNtToDisplay({commit}, ntIndex) {
      commit('SET_NEW_LAST_NT_OF_DISPLAY', ntIndex)
    },
    updateLastNtOfChrom({commit}, ntIndex) {
      commit('SET_GLOBAL_LAST_NT', ntIndex)
    },
    updateCurrentZoomLvl({commit}, ntWidthInPx) {
      commit('SET_NEW_CURRENT_ZOOM', ntWidthInPx)
    }
  },
})