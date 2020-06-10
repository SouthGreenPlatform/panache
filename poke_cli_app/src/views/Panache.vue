<template>
  <div class="whiteBlockCanvas shadow-lg pt-4 mt-2">
    <Canvas
      :chromosomeData="chromosomeData"
      :nbOfGenomes="nbOfGenomes"
      :coreThreshold="coreThreshold"
      :rightmostNt="maxPositionInNucleotide"
      :width="canvasWidth"
      :mainWindowWidth="displayWindowWidth"
      :firstNtToDisplay="getFirstNtToDisplay"
      :updateFirstNt="function(payload) {$store.dispatch('updateFirstNtToDisplay', payload)}"
      :updateLastNt="function(payload) {$store.dispatch('updateLastNtToDisplay', payload)}"
      :ntWidthInPxInDisplayWindow="$store.state.ntWidthInPx.current"
      :colorScaleFunction="$store.state.functionColorScale"
      :colorScaleCore="$store.state.orangeColorScale"
      :colorScaleDisp="$store.state.blueColorScale"
      :colorScaleRainbow="$store.state.pseudoRainbowColorScale"
      :colorScaleSimilarities="$store.state.greenColorScale"
      />
    <PavMatrixAndTracks
      :filteredData="filteredData"
      :genomeList="genomeList"
      :chromList="chromList"
      :coreThreshold="coreThreshold"
      :displaySizeOfNt="$store.state.ntWidthInPx.current"
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
      genomeList: [ 'Gen1', 'Gen2', 'Gen3', 'Gen4', 'Gen5', 'Gen6' ],
      chromList: ['0', '1', '2', '3' ],

      //Variables directly linked to chromosomal data - changed on (re-)load
      chromosomeData: [],
      lastBlockStart: Number,
      highestRepNumber: Number,
      functionDiversity: Array,
      currentWidestFeatureLength: Number,
      maxPositionInNucleotide: 10000,

      //Used to define the rainbow color Scale
      pseudoRainbowList: [d3.rgb(0, 90, 200), d3.rgb(0, 200, 250),
        d3.rgb(120, 50, 40), d3.rgb(190, 140, 60), d3.rgb(240, 240, 50),
        d3.rgb(160, 250,130)],

      //Data to change into computed
      coreThreshold: Number,
      pivotsForRainbow: Array,
      colorsForFunctions: Array,

      //Variables specific to PavMatrixAndTracks
      canvasWidth: 600,


      //Variables specific to PavMatrixAndTracks
      //Dims should be responsive, depending on the available space!
      filteredData: [],
      displayWindowWidth: 600,
      displayWindowHeight: 175,
    }
  },
  computed: {
    //data based computeds
    nbOfGenomes() {
      return this.genomeList.length
    },

    //Get values out of Vuex store
    coreValue() {
      return this.$store.state.coreThresholdSlide; //Name should be changed, again
    },
    displaySizeOfNt() {
      return this.$store.state.ntWidthInPx.current;
    },
    getFirstNtToDisplay() {
      return this.$store.state.firstNtToDisplay;
    },
    getLastNtToDisplay() {
      return this.$store.state.lastNtToDisplay;
    },
    getSelectedChrom() {
      return this.$store.state.chromSelected;
    }

    //Computed of multiple objects to watch
    getDisplayBorders() {
      return { first:this.getFirstNtToDisplay, last:this.getLastNtToDisplay }
    },
  },

  beforeMount() {
    this.fetchData();
  },
    mounted() {
  },
  watch: {
    //Whenever the chosen chromosome changes, this.data should be updated
    chromosomeData() {

      this.functionDiversity = [...new Set(this.chromosomeData.map( d => d.Function))];
      this.coreThreshold = this.coreValue /100 * this.nbOfGenomes; //Should not be data dependant...

      //Update of the chrom-specific data
      this.currentWidestFeatureLength = Math.max(...this.chromosomeData.map( d => Number(d.FeatureStop) - Number(d.FeatureStart) ));

      this.lastBlockStart = Math.max(...this.chromosomeData.map(d => Number(d.FeatureStart)));
      this.pivotsForRainbow = this.domainPivotsMaker(this.pseudoRainbowList.length, this.lastBlockStart);
      this.highestRepNumber = Math.max(...this.chromosomeData.map(d => d.SimilarBlocks.split(";").length));
      this.colorsForFunctions = this.domainPivotsMaker(this.functionDiversity.length, this.functionDiversity.length)
                                .map(intNum => d3.interpolateRainbow(intNum / (this.functionDiversity.length + 1)));

      this.maxPositionInNucleotide = Math.max(...this.chromosomeData.map(d => Number(d.FeatureStop)));

      //Re-creation of the colorScales
      this.updateDataDependantColorScales();

      //Updating the zoom values
      this.$store.state.ntWidthInPx.minGlobal = this.displayWindowWidth / this.maxPositionInNucleotide;
      this.$store.state.ntWidthInPx.minEfficiency = this.width / (0.05 * this.maxPositionInNucleotide);
      this.$store.state.ntWidthInPx.current = this.$store.state.ntWidthInPx.minEfficiency;

      this.filterDataForDisplay();
    },

    //... wtf with coreValue & coreThreshold?
    coreValue() {
      this.coreThreshold = this.coreValue /100 * this.nbOfGenomes;
    },

    //Whenever firstNt or lastNt changes, do...
    getDisplayBorders() {
      this.filterDataForDisplay();
    },

    getSelectedChrom() {
      this.fetchData();
    },
  },
  methods: {

    //WTF, why is this.chromosomeData given a value twice?
    //Ok so the full dataset is fetched whenever he wants to change only a single Chrom?
    //This makes no sense
    //There should be:
    //A the full data set, stored somewhere
    //B chromosomeData, corresponding only to the selected part
    async fetchData(){
      this.chromosomeData = await d3.json("./mediumFakeDataWithAllBlocks.json");
      console.log(this.chromosomeData);
      this.chromosomeData = this.chromosomeData[0][this.$store.state.chromSelected];
      console.log(this.chromosomeData);
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

    updateDataDependantColorScales() {

      this.$store.state.pseudoRainbowColorScale = this.colorScaleMaker(this.pivotsForRainbow, this.pseudoRainbowList);
      this.$store.state.greenColorScale = this.colorScaleMaker([1, this.highestRepNumber], [d3.hcl(120, 2, 97), d3.hcl(125, 85, 54)]);
      this.$store.state.blueColorScale = this.colorScaleMaker([0, this.nbOfGenomes],[d3.hcl(246, 0, 95), d3.hcl(246, 65, 70)]);
      this.$store.state.orangeColorScale = this.colorScaleMaker([0, this.nbOfGenomes],[d3.hcl(60, 0, 95), d3.hcl(60, 65, 70)]);
      this.$store.state.functionColorScale = this.colorScaleMaker(this.functionDiversity, this.colorsForFunctions, false);

    },

    filterDataForDisplay() {

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