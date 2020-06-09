<template>
  <div class="whiteBlockCanvas shadow-lg pt-4 mt-2">
    <!-- Props envoyés à Canvas.vue -->
    <Canvas
      :chromosomeData="chromosomeData"
      :nbOfGenomes="nbOfGenomes"
      :coreThreshold="coreThreshold"
      :rightmostNt="maxPositionInNucleotide"
      :width="width"
      :mainWindowWidth="displayWindowWidth"
      :firstNtToDisplay="getFirstNtToDisplay"
      :ntWidthInPxInDisplayWindow="$store.state.ntWidthInPx.current"
      :colorScaleFunction="$store.state.functionColorScale"
      :colorScaleCore="$store.state.orangeColorScale"
      :colorScaleDisp="$store.state.blueColorScale"
      :colorScaleRainbow="$store.state.pseudoRainbowColorScale"
      :colorScaleSimilarities="$store.state.greenColorScale"
      />
    <!-- displayHeight should not be hardcoded, not there/-->
    <PavMatrixAndTracks
      :filteredData="filteredData"
      :genomeList="genomeList"
      :chromList="chromList"
      :coreThreshold="coreThreshold"
      :displaySizeOfNt="$store.state.ntWidthInPx.current"
      :displayHeight="175"
      :displayWidth="displayWindowWidth"
      :firstNtToDisplay="$store.state.firstNtToDisplay"
      :updateFirstNt="function(payload) {$store.dispatch('updateFirstNtToDisplay', payload)}"
      :updateLastNt="function(payload) {$store.dispatch('updateLastNtToDisplay', payload)}"
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
  data: function() {
    return {
      // datas for Canvas component
      chromosomeData: [],
      nbOfGenomes: 6,
      coreThreshold: Number,
      width: 1100,
      displaySizeOfNt: 1,

      pseudoRainbowList: [d3.rgb(0, 90, 200), d3.rgb(0, 200, 250),
        d3.rgb(120, 50, 40), d3.rgb(190, 140, 60), d3.rgb(240, 240, 50),
        d3.rgb(160, 250,130)],

      lastBlockStart: Number,
      pivotsForRainbow: Array,
      highestRepNumber: Number,
      colorsForFunctions: Array,
      functionDiversity: Array,
      maxPositionInNucleotide: 41332,
      currentWidestFeatureLength: Number,

      // datas for PavMatrixAndTracks component
      filteredData: [],
      genomeList: [ 'Gen1', 'Gen2', 'Gen3', 'Gen4', 'Gen5', 'Gen6'],
      chromList: ['0', '1', '2', '3',],
      displayWindowWidth: 1100,
    }
  },
  beforeMount() {
    this.fetchData();
  },
  computed: {
    // Va s'executer chaque fois que la variable global coreThresholdSlide, qu'on récupère du filtre, est mise à jour
    coreValue() {
      return this.$store.state.coreThresholdSlide;
    },

    //Va s'executer chaque fois que la variable global ntWidthInPx, qu'on récupère du filtre, est mise à jour
    zoomUpdate() {
      return this.$store.state.ntWidthInPx.current;
    },

    getFirstNtToDisplay() {
      return this.$store.state.firstNtToDisplay;
    },

    getLastNtToDisplay() {
      return this.$store.state.lastNtToDisplay;
    },

    getDisplayBorders() {
      return { first:this.getFirstNtToDisplay, last:this.getLastNtToDisplay }
    },

    getChromSelected() {
      return this.$store.state.chromSelected;
    }

  },
  watch: {
    // on s'assures de créer les diverses variables à envoyer en props a Canvas.vue après avoir bien charger le jeu de donnée chromosomeData
    chromosomeData: function() {

      this.functionDiversity = [...new Set(this.chromosomeData.map( d => d.Function))];
      this.coreThreshold = this.coreValue /100 * this.nbOfGenomes;

      //Calcul de la nt la plus large du jeu de donnée
      this.currentWidestFeatureLength = Math.max(...this.chromosomeData.map( d => Number(d.FeatureStop) - Number(d.FeatureStart) ));

      this.lastBlockStart = Math.max(...this.chromosomeData.map(d => Number(d.FeatureStart)));
      this.pivotsForRainbow = this.domainPivotsMaker(this.pseudoRainbowList.length, this.lastBlockStart);
      this.highestRepNumber = Math.max(...this.chromosomeData.map(d => d.SimilarBlocks.split(";").length));
      this.colorsForFunctions = this.domainPivotsMaker(this.functionDiversity.length, this.functionDiversity.length)
                                .map(intNum => d3.interpolateRainbow(intNum / (this.functionDiversity.length + 1)));

      this.maxPositionInNucleotide = Math.max(...this.chromosomeData.map(d => Number(d.FeatureStop)));

      // définition des couleurs
      this.updateDataDependantColorScales();

      // updating the zoom borders
      this.$store.state.ntWidthInPx.minGlobal = this.displayWindowWidth / this.maxPositionInNucleotide;
      this.$store.state.ntWidthInPx.minEfficiency = this.width / (0.05 * this.maxPositionInNucleotide);
      this.$store.state.ntWidthInPx.current = this.$store.state.ntWidthInPx.minEfficiency;

      this.handler();
    },

    // va s'éxecuter après avoir intercepté l'update dans le computed plus haut
    coreValue: function() {
      this.coreThreshold = this.coreValue /100 * this.nbOfGenomes;
    },

    zoomUpdate: function() {
      let ntNumber = this.width / this.$store.state.ntWidthInPx.current;

      let rightmostNt = Number(this.chromosomeData[this.chromosomeData.length-1].index);
      this.sliderWidth = this.width * (ntNumber / rightmostNt);
    },

    getDisplayBorders: function(){
      this.handler();
    },

    getChromSelected: function() {
      this.fetchData();
    },
  },
  mounted() {
  },
  methods: {

    // on récupère le jeu de donnée utilisé pour notre poke
    async fetchData(){
      this.chromosomeData = await d3.json("./mediumFakeDataWithAllBlocks.json");
      console.log(this.chromosomeData);
      this.chromosomeData = this.chromosomeData[0][this.$store.state.chromSelected];
      console.log(this.chromosomeData);
    },

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

    handler() {
        //console.log('Panache detected a change of nt to display');

        //looking for data that are before the first nt to show but might have to be displayed (if FeatureStop is in the window)
        let underThresholdArray = this.chromosomeData.filter(
          d => ( d.index <= this.getFirstNtToDisplay ) && ( d.index >= this.getFirstNtToDisplay - this.currentWidestFeatureLength )
        );

        //getting all elements with indices within the desired range
        //console.log('Panache identifies the elements within the window of interest');
        //console.log(`Panache thinks that first nt to display is ${this.getFirstNtToDisplay} and that last nt to display is ${this.getLastNtToDisplay}`);

        let elementsWithIndexesWithinWindow = this.chromosomeData.filter(
          d => ( Number(d.index) >= this.getFirstNtToDisplay ) && ( Number(d.index) <= this.getLastNtToDisplay )
        );
        console.log(elementsWithIndexesWithinWindow);

        //Setting and filling the filteredData array with at least one element
        if (underThresholdArray.length != 0) {
          //If there is at least one data with index < firstNtToDisplay <= index+width
          //then the rightmostone is added to the filtered data


          //Uncomment to make the selection of only one element of underThresholdArray
          
          let maxSubIndex = Math.max(...underThresholdArray.map( d => d.index ));
          // console.log(`maxSubIndex is ${maxSubIndex}`);
          // console.log(`underThresholdArray is ...`);
          // console.log(underThresholdArray);
          // console.log(underThresholdArray[underThresholdArray.length-1]);
          let arrayOfNearestUnselectedData = underThresholdArray.filter(
            d => (Number(d.index) === maxSubIndex)
          );
          // console.log(`arrayOfNearestUnselectedData is ...`);
          // console.log(arrayOfNearestUnselectedData);
          this.filteredData = arrayOfNearestUnselectedData;
          
          //this.filteredData = underThresholdArray;
        } else {
          //Else filteredData have at least the first data, so that it is never empty
          this.filteredData = [this.chromosomeData[0]]
        }
        console.log('filteredData is...');
        console.log(this.filteredData);

        //Adding selected elements to the filteredData array
        elementsWithIndexesWithinWindow.forEach( d => this.filteredData.push(d) );
        //console.log('filteredData is');
        //console.log(this.filteredData);
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