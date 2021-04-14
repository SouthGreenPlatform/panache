import Vue from 'vue'
import Vuex from 'vuex'
import * as d3 from 'd3'

Vue.use(Vuex)

// The store gives access to some variables through the whole app^
// Values in here are mainly default values, to update depending on user inputs
export default new Vuex.Store({
  state: {
    coreThresholdSlide: 85, // Minimal presence ratio to be part of core, should be turn into a % !

    optionPanelWidth: 300,

    genomeListInDisplay: [ 'Gen1', 'Gen2', 'Gen3', 'Gen4', 'Gen5', 'Gen6' ], //List of every genome name, same order as within the initial dataset

    fullChromData: [], //Chromosomal dataset
    fullGffData: [], //Gff linked to the displayed pav data
    ntWidthInPxThresholds: new Map(), // map[chromosome] -> {min: i, max: j}

    currentDisplayNtWidthInPx: 0.5, // Updates --> minEfficiency per default, or user input
    minNbOfFeaturesToDisplay: 10,
    maxNbOfFeaturesToDisplay: 200,

    // Coords of the first and last nt to display on the block level vis
    firstNtToDisplay: 0,
    lastNtToDisplay: 1200,
    chromNames: ['0', '1', '2', '3'],
    selectedChrom: '0', // Stores the id of the chrom to display at the block level vis
    coordsOfHollowAreas: new Map(),

    // Color scales used throughout the app
    //TODO : create the color scales right here
    pseudoRainbowColorScale: d3.scaleLinear().range([d3.hcl('yellow'), d3.hcl('yellow')]),
    greenColorScale: d3.scaleLinear().range([d3.hcl('green'), d3.hcl('green')]),
    blueColorScale: d3.scaleLinear().range([d3.hcl('blue'), d3.hcl('blue')]),
    orangeColorScale: d3.scaleLinear().range([d3.hcl('orange'), d3.hcl('orange')]),

    displayShapeSelected: 'square',

    // Values to the sort functionality
    sortChoice: ['None', 'Name (A - Z)', 'Name (Z - A)', 'Phylogenetic tree', 'Test4'],
    selectedSortMode: 'None',
    newicktTreeData: [],

    // Function to create color scales TODO : check other components to remove it from there
    colorScaleMaker: function(domain, range, scaleLinear = true) {
      if (scaleLinear) {
        return d3.scaleLinear()
            .domain(domain)
            .interpolate(d3.interpolateHcl)
            .range(range);
      } else {
          return d3.scaleOrdinal()
              .domain(domain)
              .range(range);
      }
    },
    //Function to create pivots for domains of color scales TODO : check other components to remove it from there
    domainPivotsMaker: function(breakpointsNb, maxValue) {
      let breakpoints = [];
      for (var i = 0; i < breakpointsNb; ++i) {
          breakpoints.push(Math.round( (i / (breakpointsNb - 1) ) * maxValue));
      }
      return(breakpoints);
    },

  },
  getters: {
    nbOfGenomesInDisplay: state => {
      return state.genomeListInDisplay.length
    },
    chromDataInDisplay: state => {
      //console.log('Within chromDataInDisplay', {chromNames: state.chromNames, fullSet: state.fullChromData, selectedChrom:state.selectedChrom, firstChrom:state.fullChromData[state.selectedChrom]})
      if (state.fullChromData[state.selectedChrom] === undefined || state.fullChromData[state.selectedChrom][0] === undefined) {
        return [] //default value
      }

      let chromData = state.fullChromData[state.selectedChrom];

      //console.log({chromData});
      return chromData;
    },
    gffDataInDisplay: state => {
      if (state.fullGffData[state.selectedChrom] === undefined || state.fullGffData[state.selectedChrom][0] === undefined) {
        return [] //default value
      }
      return state.fullGffData[state.selectedChrom];
    },
    lastNtOfChrom: (state, getters) => {
      //console.log('Within lastNtOfChrom', {chromInDisplay: getters.chromDataInDisplay});
      if (getters.chromDataInDisplay === undefined || getters.chromDataInDisplay[0] === undefined) {
        return 10000 //default value
      }
      return Math.max(...getters.chromDataInDisplay.map(d => Number(d.FeatureStop)));
    },
    ntWidthThresholdsCouple: (state, getters) => {
      let ntCouple = {};

      //If values are already stored, get them...
      if (state.ntWidthInPxThresholds.has(state.selectedChrom)) {
        ntCouple = state.ntWidthInPxThresholds.get(state.selectedChrom);
      //...else compute them and store them into the map
      } else {
        //Default values when no dataset is loaded
        let minNtWidth = 0.5;
        let maxNtWidth = 2;

        //ntWidthInPx = (displayWidthInPx x totNumberOfFeatures) / (nbOfFeaturesToDisplay x LastNt)
        if (getters.chromDataInDisplay !== undefined && getters.chromDataInDisplay[0] !== undefined) {
          //CAUTION: Seing fewer features means that they should appear bigger, hence linked to maxNtWidth
          //Same applies to minNtWidth and max nb of features.
          minNtWidth = (getters.displayWindowWidth * getters.chromDataInDisplay.length) / ( state.maxNbOfFeaturesToDisplay * getters.lastNtOfChrom);
          maxNtWidth = (getters.displayWindowWidth * getters.chromDataInDisplay.length) / ( state.minNbOfFeaturesToDisplay * getters.lastNtOfChrom);

          //Store value in map for future calls
          state.ntWidthInPxThresholds.set(state.selectedChrom, ntCouple);
        }

        ntCouple['min'] = minNtWidth;
        ntCouple['max'] = maxNtWidth;

      }
      return ntCouple;
    },
    minNtWidthForNavigabilityInMainDisplay: (state, getters) => {
      return getters.ntWidthThresholdsCouple['min'];
    },
    maxNtWidthInMainDisplay: (state, getters) => {
      return getters.ntWidthThresholdsCouple['max'];
    },
    functionDiversity: (state, getters) => {
      return [...new Set(getters.chromDataInDisplay.map( d => d['Function']))]
    },
    functionColorScale: (state, getters) => {
      if (getters.functionDiversity !== undefined) {

        let nbOfFunctions = getters.functionDiversity.length;
        //For now Functions are supposed to be int, we construct a dedicated domain
        let arrayOfInt = state.domainPivotsMaker(nbOfFunctions, nbOfFunctions);
        //+1 so that there is no full circle in the rainbow
        let arrayOfColors = arrayOfInt.map(intNum => d3.interpolateRainbow(intNum / (nbOfFunctions + 1)));

        return state.colorScaleMaker(getters.functionDiversity, arrayOfColors, false);
      }

      return d3.scaleLinear().range([d3.hcl('purple'), d3.hcl('purple')]);
    },
    //Rainbow of color in case function diversity is 1
    correspondancePosColor: (state, getters) => {
      let colorMap = new Map();
      getters.chromDataInDisplay.forEach( function(d, i) {
        colorMap.set(d['FeatureStart'], d3.interpolateRainbow( (i%14) /14))
      });

      return colorMap;
    },
    //Function that automatically detects which color to return for a given data block
    colorForFunctionElement: (state, getters) => {
      let functionToReturn;

      if (getters.functionDiversity.length >= 2) {
        functionToReturn = function(dataObject) {
          return getters.functionColorScale(dataObject['Function'])
        }
      } else {
        functionToReturn = function(dataObject) {
          return getters.correspondancePosColor.get(dataObject['FeatureStart'])
        }
      }

      return functionToReturn;
    },
    //Based on size of display
    displayWindowWidth: state => {

      //TODO: Have an adaptative -80 for the borders, not a hardcoded value?
      return window.innerWidth - state.optionPanelWidth - 80
    },
  },
  mutations: {
    SET_CHROM_NAMES(state, payload) {
      state.chromNames = payload
      console.log(state.chromNames)
    },
    SET_GENOMES_IN_DISPLAY(state, payload) {
      state.genomeListInDisplay = payload
      console.log(state.genomeListInDisplay)
    },
    SET_FULL_CHROM_DATA(state, payload) {
      state.fullChromData = payload
      console.log(state.fullChromData)
    },
    SET_FULL_GFF_DATA(state, payload) {
      state.fullGffData = payload
    },
    //ADD_NT_THRESHOLDS_TO_MAP(state, payload) {
    //  let ntWidthCouple = {'min': payload['minNtWidth'], 'max': payload['maxNtWidth']};
    //  state.ntWidthInPxThresholds.set(payload['chromosome'], ntWidthCouple);
    //},
    SET_SELECTED_CHROM(state, payload) {
      state.selectedChrom = payload
    },
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
    },
    SET_NEW_COORDS_OF_HOLLOW_AREAS(state, payload) {
      state.coordsOfHollowAreas = payload
    },
    SET_DISPLAY_SHAPE_SELECTED(state, payload) {
      state.displayShapeSelected = payload;
    },
    SET_SELECTED_SORT_MODE(state, payload) {
      state.selectedSortMode = payload
      console.log(state.selectedSortMode);
    }
  },
  // Functions to call within the app to apply mutations to the store, asynch
  actions: {
    updateChromNames({commit}, chromList) {
      commit('SET_CHROM_NAMES', chromList)
    },
    updateGenomesInDisplay({commit}, genoList) {
      commit('SET_GENOMES_IN_DISPLAY', genoList)
    },
    updateFullChromData({commit}, pavData) {
      commit('SET_FULL_CHROM_DATA', pavData)
    },
    updateFullGffData({commit}, gffData) {
      commit('SET_FULL_GFF_DATA', gffData)
    },
    //ntWidthThresholds shaped as {'chromosome': 'chr1', 'minNtWidth': 0.5, 'maxNtWidth': 2}
    //addNtThresholdsToMap({commit}, ntWidthThresholds) {
    //  commit('ADD_NT_THRESHOLDS_TO_MAP', ntWidthThresholds)
    //},
    updateSelectedChrom({commit}, selectedChrom) {
      commit('SET_SELECTED_CHROM', selectedChrom)
    },
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
    },
    updateCoordsOfHollowAreas({commit}, mapOfCoords) {
      commit('SET_NEW_COORDS_OF_HOLLOW_AREAS', mapOfCoords)
    },
    updateDisplayShapeSelected({commit}, shape) {
      commit('SET_DISPLAY_SHAPE_SELECTED', shape);
    },
    updateSelectedSortMode({commit}, selectedSortMode) {
      commit('SET_SELECTED_SORT_MODE', selectedSortMode)
    },
  },
})
