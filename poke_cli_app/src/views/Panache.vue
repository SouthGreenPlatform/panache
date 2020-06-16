<template>
  <div class="whiteBlockCanvas shadow-lg pt-4 mt-2">
    <Canvas
      :chromosomeData="chromosomeData"
      :nbOfGenomes="nbOfGenomes"
      :coreThreshold="coreThreshold"
      :rightmostNt="maxPositionInNucleotide"
      :canvasWidth="canvasWidth"
      :mainWindowWidth="displayWindowWidth"
      :firstNtToDisplay="getFirstNtToDisplay"
      :updateFirstNt="function(payload) {$store.dispatch('updateFirstNtToDisplay', payload)}"
      :updateLastNt="function(payload) {$store.dispatch('updateLastNtToDisplay', payload)}"
      :ntWidthInPxInDisplayWindow="$store.state.currentDisplayNtWidthInPx"
      :colorScaleFunction="$store.state.functionColorScale"
      :colorScaleCore="$store.state.orangeColorScale"
      :colorScaleDisp="$store.state.blueColorScale"
      :colorScaleRainbow="$store.state.pseudoRainbowColorScale"
      :colorScaleSimilarities="$store.state.greenColorScale"
      />
    <PavMatrixAndTracks
      :filteredData="filteredData"
      :genomeList="genomeList"
      :chromList="$store.state.chromNames"
      :coreThreshold="coreThreshold"
      :displaySizeOfNt="$store.state.currentDisplayNtWidthInPx"
      :displayHeight="displayWindowHeight"
      :displayWidth="displayWindowWidth"
      :firstNtToDisplay="$store.state.firstNtToDisplay"
      :colorScaleFunction="$store.state.functionColorScale"
      :colorScaleRainbow="$store.state.pseudoRainbowColorScale"
      :colorScaleSimilarities="$store.state.greenColorScale"
    />
  </div>
</template>

<script>
import * as d3 from 'd3';

import Canvas from '@/components/Canvas.vue';
import PavMatrixAndTracks from '@/components/PavMatrixAndTracks.vue';

export default {
  name: 'Panache',
  components: {
    Canvas,
    PavMatrixAndTracks
  },
  data() {
    return {
      //Values based on full dataset
      fullData: [],
      genomeList: [ 'Gen1', 'Gen2', 'Gen3', 'Gen4', 'Gen5', 'Gen6' ],

      //Used to define the rainbow color Scale
      pseudoRainbowList: [d3.rgb(0, 90, 200), d3.rgb(0, 200, 250),
        d3.rgb(120, 50, 40), d3.rgb(190, 140, 60), d3.rgb(240, 240, 50),
        d3.rgb(160, 250,130)],

      //Variables specific to PavMatrixAndTracks
      canvasWidth: 600,

      //Variables specific to PavMatrixAndTracks
      //Dims should be responsive, depending on the available space!
      displayWindowWidth: 600,
      displayWindowHeight: 175,
      filteredData: []
    }
  },
  computed: {
    //data based computeds
    nbOfGenomes() {
      return this.genomeList.length
    },

    //chromosomeData and associated properties
    chromosomeData() {
      //in case full data is not loaded yet...
      if (this.fullData[0] === undefined || this.fullData[0][this.getSelectedChrom] === undefined) {
        return []
      }

      // else return the correct dataset
      let selectedSubData = this.fullData[0][this.getSelectedChrom];
      return selectedSubData;
    },
    // I SHOULD MANAGE DEFAULT VALUES HERE TOO
    lastBlockStart() {
      return Math.max(...this.chromosomeData.map(d => Number(d.FeatureStart)))
    },
    maxPositionInNucleotide() {
      if (this.chromosomeData[0] === undefined) {
        return 10000 //default value
      }
      return Math.max(...this.chromosomeData.map(d => Number(d.FeatureStop)));
    },
    currentWidestFeatureLength() {
      let arrayOfLength = this.chromosomeData.map( d => Number(d.FeatureStop) - Number(d.FeatureStart) );
      return Math.max(...arrayOfLength);
    },
    coreThreshold() {
      return this.coreValue /100 * this.nbOfGenomes //Should not be data dependant...
    },
    functionDiversity() {
      return [...new Set(this.chromosomeData.map( d => d.Function))];
    },
    colorsForFunctions() {
      let arrayOfInt = this.domainPivotsMaker(this.functionDiversity.length, this.functionDiversity.length);
      //+1 so that there is no full circle in the rainbow
      return arrayOfInt.map(intNum => d3.interpolateRainbow(intNum / (this.functionDiversity.length + 1)));
    },
    pivotsForRainbow() {
      return this.domainPivotsMaker(this.pseudoRainbowList.length, this.lastBlockStart);
    },
    highestRepNumber() {
      return Math.max(...this.chromosomeData.map(d => d.SimilarBlocks.split(";").length))
    },

    //Get values out of Vuex store
    coreValue() {
      return this.$store.state.coreThresholdSlide //Name should be changed, again
    },
    displaySizeOfNt() {
      return this.$store.state.currentDisplayNtWidthInPx
    },
    getFirstNtToDisplay() {
      return this.$store.state.firstNtToDisplay
    },
    getLastNtToDisplay() {
      return this.$store.state.lastNtToDisplay
    },
    getSelectedChrom() {
      return this.$store.state.chromSelected
    },

    //Computed of multiple objects to watch
    getDisplayBorders() {
      return { first: this.getFirstNtToDisplay, last: this.getLastNtToDisplay }
    },


  },

  beforeMount() {
    this.fetchFullData();
  },

  watch: {
    //update global value of the last position of the current chrom
    maxPositionInNucleotide: function() {
      this.$store.dispatch('updateLastNtOfChrom', this.maxPositionInNucleotide);
    },

    //Data that will change the Color Scales
    pivotsForRainbow: function() {
      this.$store.state.pseudoRainbowColorScale = this.colorScaleMaker(this.pivotsForRainbow, this.pseudoRainbowList);
    },
    highestRepNumber: function() {
      this.$store.state.greenColorScale = this.colorScaleMaker([1, this.highestRepNumber], [d3.hcl(120, 2, 97), d3.hcl(125, 85, 54)]);
    },
    nbOfGenomes: function() { //not supposed to change with the data, unless some genomes are hidden
      this.$store.state.blueColorScale = this.colorScaleMaker([0, this.nbOfGenomes],[d3.hcl(246, 0, 95), d3.hcl(246, 65, 70)]);
      this.$store.state.orangeColorScale = this.colorScaleMaker([0, this.nbOfGenomes],[d3.hcl(60, 0, 95), d3.hcl(60, 65, 70)]);
    },
    colorsForFunctions: function() {
      this.$store.state.functionColorScale = this.colorScaleMaker(this.functionDiversity, this.colorsForFunctions, false);
    },

    chromosomeData: function() {
      this.filterData();
    },

    //Everytime a border changes, filterData is updated
    getDisplayBorders: function() {
      this.filterData();
    },
  },

  methods: {

    //Fetches the full dataset, from which chromosomal data can be used
    async fetchFullData() {
      console.log('Fetching full dataset');

      let dataPromise = d3.json("./mediumFakeDataWithAllBlocks.json");
      let data = await dataPromise;

      console.log('Full data fetched');
      this.fullData = data;
    },

    filterData() {
      if (this.chromosomeData != undefined) {
        //Looking for data that are before the first nt to show but might be
        //wide enough to appear, and therefore should be included
        let underThresholdArray = this.chromosomeData.filter(
          d => ( d.index <= this.getFirstNtToDisplay ) && ( d.index >= this.getFirstNtToDisplay - this.currentWidestFeatureLength )
        );

        //Setting and filling the filteredData array with at least one element
        if (underThresholdArray.length != 0) {

          //If there is at least one data with index < firstNtToDisplay <= index+width
          //then the rightmost one is added to filteredData
          let maxSubIndex = Math.max(...underThresholdArray.map( d => d.index ));
          let arrayOfNearestUnselectedData = underThresholdArray.filter(
            d => (Number(d.index) === maxSubIndex) //Number() is important here!
          );

          this.filteredData = arrayOfNearestUnselectedData;

        } else {
          //Else filteredData have at least the first data, so that it is never empty
          this.filteredData = [this.chromosomeData[0]]
        }

        //Getting all elements with indices within the desired range
        let elementsWithIndexesWithinWindow = this.chromosomeData.filter(
          d => ( Number(d.index) >= this.getFirstNtToDisplay ) && ( Number(d.index) <= this.getLastNtToDisplay )
        );

        //Adding selected elements to the filteredData array
        elementsWithIndexesWithinWindow.forEach( d => this.filteredData.push(d) );
      }
    },

    //This should be a stored function instead, or from a module at least
    colorScaleMaker(domain, range, scaleLinear = true) {
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

    //Again this could be from a module instead
    domainPivotsMaker(breakpointsNb, maxValue) {
      let breakpoints = [];

      for (var i = 0; i < breakpointsNb; ++i) {
          breakpoints.push(Math.round( (i / (breakpointsNb - 1) ) * maxValue));
      }
      return(breakpoints);
    },

  }
}
</script>

<style>

.whiteBlockCanvas {
  background-color: white;
  width: 77%;
  height: 25rem;
  border-radius: 50px;
  margin-left: 22%;
}

</style>