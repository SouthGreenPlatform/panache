<template>
  <div class="whiteBlockCanvas shadow-lg pt-4 mt-2">
    <!-- Props envoyés à Canvas.vue -->
    <Canvas 
      :chromosomeData="chromosomeData"  
      :nbOfGenomes="nbOfGenomes" 
      :coreThreshold="coreThreshold" 
      :maxPositionInNucleotide="maxPositionInNucleotide" 
      :sliderWidth="sliderWidth" 
      :width="width" 
      />
    <PavMatrixAndTracks
      :filteredData="filteredData"
      :genomeList="genomeList"
      :chromList="chromList"
      :coreThreshold="coreThreshold"
      :displaySizeOfNt="1"
      :displayHeight="175"
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
      sliderWidth: 55,
      width: 1100,

      pseudoRainbowList: [d3.rgb(0, 90, 200), d3.rgb(0, 200, 250),
        d3.rgb(120, 50, 40), d3.rgb(190, 140, 60), d3.rgb(240, 240, 50),
        d3.rgb(160, 250,130)],

      lastBlockStart: Function,
      pivotsForRainbow: Function,
      highestRepNumber: Function,
      colorsForFunctions: Function,
      functionDiversity: Function,
      maxPositionInNucleotide: Number,

      // datas for PavMatrixAndTracks component
      filteredData: [],
      genomeList: [ 'Gen1', 'Gen2', 'Gen3', 'Gen4', 'Gen5', 'Gen6'],
      chromList: ['0', '1', '2', '3',],
      displayWindowWidth: 600,
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

    //Va s'executer chaque fois que la variable global zoomLevel, qu'on récupère du filtre, est mise à jour
    zoomUpdate() {
      return this.$store.state.zoomLevel.current;
    }
  },
  watch: {
    // on s'assures de créer les diverses variables à envoyer en props a Canvas.vue après avoir bien charger le jeu de donnée chromosomeData
    chromosomeData: function() {

      this.functionDiversity = [...new Set(this.chromosomeData.map( d => d.Function))];
      this.coreThreshold = this.coreValue /100 * this.nbOfGenomes;

      this.lastBlockStart = Math.max(...this.chromosomeData.map(d => Number(d.FeatureStart)));
      this.pivotsForRainbow = this.domainPivotsMaker(this.pseudoRainbowList.length, this.lastBlockStart);
      this.highestRepNumber = Math.max(...this.chromosomeData.map(d => d.SimilarBlocks.split(";").length));
      this.colorsForFunctions = this.domainPivotsMaker(this.functionDiversity.length, this.functionDiversity.length)
                                .map(intNum => d3.interpolateRainbow(intNum / (this.functionDiversity.length + 1)));

      // définition des couleurs          
      this.$store.state.pseudoRainbowColorScale = this.colorScaleMaker(this.pivotsForRainbow, this.pseudoRainbowList);                
      this.$store.state.greenColorScale = this.colorScaleMaker([1, this.highestRepNumber], [d3.hcl(120, 2, 97), d3.hcl(125, 85, 54)]);
      this.$store.state.blueColorScale = this.colorScaleMaker([0, this.nbOfGenomes],[d3.hcl(246, 0, 95), d3.hcl(246, 65, 70)]);
      this.$store.state.orangeColorScale = this.colorScaleMaker([0, this.nbOfGenomes],[d3.hcl(60, 0, 95), d3.hcl(60, 65, 70)]);
      this.$store.state.functionColorScale = this.colorScaleMaker(this.functionDiversity, this.colorsForFunctions, false);

      this.maxPositionInNucleotide = Math.max(...this.chromosomeData.map(d => Number(d.FeatureStop)));
    },

    filteredData: function(){
      this.$store.state.pseudoRainbowColorScale = this.colorScaleMaker(this.pivotsForRainbow, this.pseudoRainbowList); 
    },

    // va s'éxecuter après avoir intercepté l'update dans le computed plus haut
    coreValue: function() {
      this.coreThreshold = this.coreValue /100 * this.nbOfGenomes;
    },

    zoomUpdate: function() {
      let ntNumber = this.width / this.$store.state.zoomLevel.current;

      let rightmostNt = Number(this.chromosomeData[this.chromosomeData.length-1].index);
      this.sliderWidth = this.width * (ntNumber / rightmostNt);
    }
  },
  mounted() {
  },
  methods: {

    // on récupère le jeu de donnée utilisé pour notre poke
    async fetchData(){
      this.chromosomeData = await d3.json("./mediumFakeDataWithAllBlocks_chrom0.json");
      this.filteredData = await d3.json("./mediumFakeDataWithAllBlocks_chrom0_smallPart.json");

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
    }
  }
}
</script>

<style>

.whiteBlockCanvas {
  background-color: white;
  width: 73rem;
  height: 40rem;
  border-radius: 50px;
  margin-left: 21rem;
}

</style>