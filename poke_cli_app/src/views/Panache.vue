<template>
  <div class="panache">
    <Canvas :chromosomeData="chromosomeData" :colorScaleRainbow="pseudoRainbowColorScale" :colorScaleSimilarities="greenColorScale" 
    :nbOfGenomes="nbOfGenomes" :colorScaleDisp="blueColorScale" :colorScaleCore="orangeColorScale" :coreThreshold="coreThreshold" 
    :colorScaleFunction="functionColorScale" />
  </div>
</template>

<script>
import * as d3 from 'd3';

import Canvas from '@/components/Canvas.vue';

export default {
  name: 'Panache',
  components: {
    Canvas
  },
  data: function() {
    return {
      chromosomeData: [],
      nbOfGenomes: 6,
      coreThreshold: Number,

      pseudoRainbowList: [d3.rgb(0, 90, 200), d3.rgb(0, 200, 250),
        d3.rgb(120, 50, 40), d3.rgb(190, 140, 60), d3.rgb(240, 240, 50),
        d3.rgb(160, 250,130)],

      lastBlockStart: Function,
      pivotsForRainbow: Function,
      pseudoRainbowColorScale: Function,
      highestRepNumber: Function,
      greenColorScale: Function,
      blueColorScale: Function,
      orangeColorScale: Function,
      colorsForFunctions: Function,
      functionColorScale: Function,
      functionDiversity: Function

    }
  },
  beforeMount() {
    this.fetchData();
  },
  watch: {
    chromosomeData: function() {

      this.functionDiversity = [...new Set(this.chromosomeData.map( d => d.Function))];
      this.coreThreshold = 85/100 * this.nbOfGenomes,

      this.lastBlockStart = Math.max(...this.chromosomeData.map(d => Number(d.FeatureStart)));
      this.pivotsForRainbow = this.domainPivotsMaker(this.pseudoRainbowList.length, this.lastBlockStart);
      this.pseudoRainbowColorScale = this.colorScaleMaker(this.pivotsForRainbow, this.pseudoRainbowList);
      this.highestRepNumber = Math.max(...this.chromosomeData.map(d => d.SimilarBlocks.split(";").length));
      this.greenColorScale = this.colorScaleMaker([1, this.highestRepNumber], [d3.hcl(120, 2, 97), d3.hcl(125, 85, 54)]);
      this.blueColorScale = this.colorScaleMaker([0, this.nbOfGenomes],[d3.hcl(246, 0, 95), d3.hcl(246, 65, 70)]);
      this.orangeColorScale = this.colorScaleMaker([0, this.nbOfGenomes],[d3.hcl(60, 0, 95), d3.hcl(60, 65, 70)]);

      this.colorsForFunctions = this.domainPivotsMaker(this.functionDiversity.length, this.functionDiversity.length)
                                .map(intNum => d3.interpolateRainbow(intNum / (this.functionDiversity.length + 1)));
      this.functionColorScale = this.colorScaleMaker(this.functionDiversity, this.colorsForFunctions, false);

    }
  },
  mounted() {
  },
  methods: {

    async fetchData(){
      this.chromosomeData = await d3.json("./mediumFakeDataWithAllBlocks_chrom0.json");
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

.panache {
  background-color: #F8F8FF;
}

</style>