<template>
  <div>
    <div :style="displayWrapper">
      <OverlayedCanvas
        class='canvasMiniature'
        :chromosomeData="chromData"
        :nbOfGenomes="nbOfGenomes"
        :coreThreshold="coreThreshold"
        :rightmostNt="globalLastNt"
        :miniatureWidth="displayWindowWidth"
        :mainWindowWidth="displayWindowWidth"
        :firstNtToDisplay="firstNt"
        :updateFirstNt="function(payload) { updateFirstNtToDisplay(payload) }"
        :updateLastNt="function(payload) { updateLastNtToDisplay(payload) }"
        :ntWidthInPxInDisplayWindow="ntWidthInPx"
        :colorScaleFunction="colorScaleFunction"
        :colorScaleCore="colorScaleCore"
        :colorScaleDisp="colorScaleDisp"
        :colorScaleRainbow="colorScaleRainbow"
        :colorScaleSimilarities="colorScaleSimilarities"
      />
      <AnnotationTrack
        class='annotationTrack'
        :annotToDisplay="gffData"
        :firstNtToDisplay="firstNt"
        :lastNtToDisplay="lastNt"
        :trackWidth="displayWindowWidth"
      />
      <HollowAreaTrack
        class='zoneHighlight'
        :coordsStartStop="filteredHollowAreas"
        :firstNtToDisplay="firstNt"
        :displaySizeOfNt="ntWidthInPx"
        :svgWidth="displayWindowWidth"
        :trackHeight="haTrackHeight"
        :gapHeight="gridGapSize"
        :overlapingHeight="autoComputeMatrixHeight"
        />
      <PavMatrixAndTracks
        class='displayMatrix'
        :filteredData="filteredData"
        :genomeList="genomeList"
        :chromList="chromNames"
        :coreThreshold="coreThreshold"
        :blocksDimensions="blocksDimensions"
        :displaySizeOfNt="ntWidthInPx"
        :displayHeight="displayWindowHeight"
        :displayWidth="displayWindowWidth"
        :pavMatrixHeight="autoComputeMatrixHeight"
        :firstNtToDisplay="firstNt"
        :colorScaleFunction="colorScaleFunction"
        :colorScaleRainbow="colorScaleRainbow"
        :colorScaleSimilarities="colorScaleSimilarities"
      />
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';

import OverlayedCanvas from '@/components/OverlayedCanvas.vue';
import PavMatrixAndTracks from '@/components/PavMatrixAndTracks.vue';
import HollowAreaTrack from '@/components/HollowAreaTrack.vue';
import AnnotationTrack from '@/components/AnnotationTrack.vue';

import { mapState, mapGetters, mapActions } from 'vuex';

export default {
  name: 'Panache',
  components: {
    OverlayedCanvas,
    PavMatrixAndTracks,
    HollowAreaTrack,
    AnnotationTrack,
  },
  data() {
    return {

      //Used to define the rainbow color Scale
      pseudoRainbowList: [d3.rgb(0, 90, 200), d3.rgb(0, 200, 250),
        d3.rgb(120, 50, 40), d3.rgb(190, 140, 60), d3.rgb(240, 240, 50),
        d3.rgb(160, 250,130)],

      //Variables specific to PavMatrixAndTracks
      //Dims should be responsive, depending on the available space!
      displayWindowHeight: 175,
      filteredData: [],

      blocksDimensions: {width:20, height:14},
      haTrackHeight: 14,
      gridGapSize: 2,
    }
  },
  computed: {
    // I SHOULD MANAGE DEFAULT VALUES HERE TOO
    lastBlockStart() {
      return Math.max(...this.chromData.map(d => Number(d.FeatureStart)))
    },
    currentWidestFeatureLength() {
      let arrayOfLength = this.chromData.map( d => Number(d.FeatureStop) - Number(d.FeatureStart) );
      return Math.max(...arrayOfLength);
    },
    coreThreshold() {
      return this.coreValue /100 * this.nbOfGenomes //Should not be data dependant...
    },
    pivotsForRainbow() {
      return this.domainPivotsMaker(this.pseudoRainbowList.length, this.lastBlockStart);
    },
    highestRepNumber() {
      return Math.max(...this.chromData.map(d => d.SimilarBlocks.split(";").length))
    },

    //Hollow areas data
    allColoredHollowAreas() {
      let coloredArray = [];
      let rainbowScale = d3.interpolateRainbow;
      let n = 0;

      this.coordsOfHollowAreas.forEach(function(value, key) {
        let color = rainbowScale( (n % 4) / 4);
        let coordTriple = [key, value, color];

        coloredArray.push(coordTriple);
        n += 1;
      })

      //console.log({coloredArray});
      return coloredArray;
    },
    filteredHollowAreas() {
      let firstNtOfDisplay = this.firstNt;
      let lastNtOfDisplay = this.lastNt;

      let filteredArray = this.allColoredHollowAreas.filter( function(triple) {
        let start = triple[0];
        let stop = triple[1];
        let isInDisplayWindow;

        if (lastNtOfDisplay < start || stop < firstNtOfDisplay) {
          isInDisplayWindow = false
        } else {
          isInDisplayWindow = true
        }

        return isInDisplayWindow;
      });

      //console.log({filteredArray});
      return filteredArray;
    },

    //Set pavMatrixHeight for further use for the displayWrapper
    autoComputeMatrixHeight() {
      let thirdOfTotalHeight = Math.floor(this.displayWindowHeight/3);
      let heightOfTotBlocks = this.nbOfGenomes * this.blocksDimensions.height;
      let heightOfMatrix = Math.min(thirdOfTotalHeight, heightOfTotBlocks);

      return heightOfMatrix;
    },

    //Style object to apply on css-grid wrapper
    displayWrapper() {
      return {
        display: 'grid',
//        'grid-template-rows': `auto ${this.haTrackHeight}px ${this.gridGapSize}px ${this.autoComputeMatrixHeight}px`,
        'grid-template-rows': `auto auto ${this.haTrackHeight}px ${this.autoComputeMatrixHeight}px 1fr`,
        'row-gap': `${this.gridGapSize}px`,
        'padding': '0.6em',
      }
    },

    //Computed of multiple objects to watch
    getDisplayBorders() {
      return { first: this.firstNt, last: this.lastNt }
    },

    //Get values out of Vuex store
    ...mapState({
      coreValue: 'coreThresholdSlide',
      genomeList: 'genomeListInDisplay',
      chromNames: 'chromNames',
      selectedChrom: 'chromSelected',
      firstNt: 'firstNtToDisplay',
      lastNt: 'lastNtToDisplay',
      ntWidthInPx: 'currentDisplayNtWidthInPx',
      colorScaleRainbow: 'pseudoRainbowColorScale',
      colorScaleSimilarities: 'greenColorScale',
      colorScaleDisp: 'blueColorScale',
      colorScaleCore: 'orangeColorScale',
      coordsOfHollowAreas: 'coordsOfHollowAreas',
    }),
    ...mapGetters({
      chromData: 'chromDataInDisplay',
      gffData: 'gffDataInDisplay',
      colorScaleFunction: 'colorForFunctionElement',
      displayWindowWidth: 'displayWindowWidth',
      nbOfGenomes: 'nbOfGenomesInDisplay',
      globalLastNt: 'lastNtOfChrom',
    })
  },

  beforeMount() {
  },

  watch: {

    //Data that will change the Color Scales
    pivotsForRainbow: function() {
      this.$store.state.pseudoRainbowColorScale = this.colorScaleMaker(this.pivotsForRainbow, this.pseudoRainbowList);
    },
    highestRepNumber: function() {
      this.$store.state.greenColorScale = this.colorScaleMaker([1, this.highestRepNumber], [d3.hcl(120, 2, 97), d3.hcl(125, 85, 54)]);
    },
    nbOfGenomes: {
      handler: function() { //not supposed to change with the data, unless some genomes are hidden
        this.$store.state.blueColorScale = this.colorScaleMaker([0, this.nbOfGenomes],[d3.hcl(246, 0, 95), d3.hcl(246, 65, 70)]);
        this.$store.state.orangeColorScale = this.colorScaleMaker([0, this.nbOfGenomes],[d3.hcl(60, 0, 95), d3.hcl(60, 65, 70)]);
      },
      immediate: true
    },

    //Update stored chromosome data when changes apply
    tempChromData: function() {
      this.updateChromDataInDisplay(this.tempChromData)
    },

    //Update data in Display whenever the chromosome data change
    chromData: function() {
      this.filterData();
    },

    //Everytime a border changes, filterData is updated
    getDisplayBorders: function() {
      this.filterData();
    },

  },

  methods: {

    filterData() {
      if (this.chromData[0] != undefined) {
        //Looking for data that are before the first nt to show but might be
        //wide enough to appear, and therefore should be included
        let underThresholdArray = this.chromData.filter(
          d => ( d.index <= this.firstNt ) && ( d.index >= this.firstNt - this.currentWidestFeatureLength )
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
          this.filteredData = [this.chromData[0]]
        }

        //Getting all elements with indices within the desired range
        let elementsWithIndexesWithinWindow = this.chromData.filter(
          d => ( Number(d.index) >= this.firstNt ) && ( Number(d.index) <= this.lastNt )
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

    //Get Actions from the store
    ...mapActions([
      'updateChromDataInDisplay',
      'updateFirstNtToDisplay',
      'updateLastNtToDisplay'
    ]),

  }
}
</script>

<!--Here again are too many hardcoded values!!!/-->
<style scoped>

.canvasMiniature {
  grid-column: 1;
  grid-row: 1;
  align-self: start;
  justify-self: center;
}

.AnnotationTrack {
  grid-column: 1;
  grid-row: 2;
  align-self: center;
  justify-self: center;
}
.zoneHighlight {
  grid-column: 1;
  grid-row: 3 / 5;
  align-self: start;
  justify-self: center;
}
.displayMatrix {
  grid-column: 1;
  grid-row: 4 / 6;
  align-self: start;
  justify-self: center;
  z-index: 2;
}

</style>
