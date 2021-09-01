<template>
  <!-- The global div has to stay, it will be replaced with TheRouterView within the app -->
  <div>
    <LoadingSpinner class='loading-spinner' :isLoading="displayIsLoading" />
    <!-- div id='PanacheMainView' :style="displayWrapper"-->
    <div id='PanacheMainView' :style="mainViewWrapper">
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
      <AnnotationTrack v-show="isGffUploaded"
        class='annotationTrack'
        :annotToDisplay="filteredGffData"
        :firstNtToDisplay="firstNt"
        :lastNtToDisplay="lastNt"
        :trackWidth="displayWindowWidth"
      />
      <PresencePatternSelector
          v-show="selectedSortMode === 'Local presence/absence pattern'"
          :minValue="0"
          :maxValue="displayWindowWidth"
      />
      <div id='responsivePavDiv' :style="respPavDivWrapper">
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
        <!--PavMatrixAndTracks
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
        /-->
        <PavMatrix
          class='displayMatrix'
          :genomeList="genomeList"
          :filteredData="filteredData"
          :firstNtToDisplay="firstNt"
          :displaySizeOfNt="ntWidthInPx"
          :blocksDimensions="blocksDimensions"
          :colorScaleFunction="colorScaleFunction"
        />
      </div>
      <Tracks
        class='displayTracks'
        :chromList="chromNames"
        :filteredData="filteredData"
        :firstNtToDisplay="firstNt"
        :displaySizeOfNt="ntWidthInPx"
        :displayWidth="displayWindowWidth"
        :gridGapSize="gridGapSize"
        :blocksDimensions="blocksDimensions"
        :coreThreshold="coreThreshold"
        :colorScaleRainbow="colorScaleRainbow"
        :colorScaleSimilarities="colorScaleSimilarities"
      />
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';

import LoadingSpinner from '@/components/LoadingSpinner.vue';
import OverlayedCanvas from '@/components/OverlayedCanvas.vue';
//import PavMatrixAndTracks from '@/components/PavMatrixAndTracks.vue';
import PavMatrix from '@/components/PavMatrix.vue';
import Tracks from '@/components/Tracks.vue';
import HollowAreaTrack from '@/components/HollowAreaTrack.vue';
import AnnotationTrack from '@/components/AnnotationTrack.vue';
import PresencePatternSelector from "@/components/PresencePatternSelector.vue";

import { mapState, mapGetters, mapActions } from 'vuex';

export default {
  name: 'Panache',
  components: {
    PresencePatternSelector,
    LoadingSpinner,
    OverlayedCanvas,
    //PavMatrixAndTracks,
    PavMatrix,
    Tracks,
    HollowAreaTrack,
    AnnotationTrack,
  },
  data() {
    return {

      //Variables specific to PavMatrixAndTracks
      //TODO: Dims should be responsive, depending on the available space!
      displayWindowHeight: 400,
      filteredData: [],

      blocksDimensions: {width: 20, height: 14},
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
    filteredGffData() {
      let firstNtOfDisplay = this.firstNt;
      let lastNtOfDisplay = this.lastNt;

      let filteredArray = this.gffData.filter( function(annotObject) {
        let start = annotObject.geneStart;
        let stop = annotObject.geneStop;
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

    mainTracksTotHeight() {
      return 3 * (this.blocksDimensions.height + 3)
    },

    allPavTotHeight() {
      return this.genomeList.length * this.blocksDimensions.height;
    },

    allChromsTotHeight() {
      return this.chromNames.length * this.blocksDimensions.height
    },

    tracksComponentMinHeight() {
      return this.mainTracksTotHeight + this.gridGapSize + 2 * this.blocksDimensions.height
    },

    tracksComponentMaxHeight() {
      return this.mainTracksTotHeight + this.gridGapSize + this.allChromsTotHeight
    },

    //Style object to apply on css-grid wrapper on all display
    /*
    displayWrapper() {
      return {
        display: 'grid',
        //TODO: find a way to have pavmatrix space == clamp(blockHeight, PavMatrix, 1fr)
        //Now it is just bruteforced...
//        'grid-template-rows': `auto ${this.haTrackHeight}px ${this.gridGapSize}px ${this.autoComputeMatrixHeight}px`,
//        'grid-template-rows': `auto auto ${this.haTrackHeight}px ${this.autoComputeMatrixHeight}px 1fr`,
//         max = size of main tracks + gapS + chromosome * block height
        //'grid-template-rows': `max-content max-content ${this.haTrackHeight}px minmax(${this.blocksDimensions.height}px, min(1fr, ${this.allPavTotHeight}px)) minmax(${this.tracksComponentMinHeight}px, ${this.tracksComponentMaxHeight}px)`,
        //'grid-template-rows': `max-content max-content ${this.haTrackHeight}px clamp(${this.blocksDimensions.height}px, ${this.allPavTotHeight}px, 1fr) minmax(${this.tracksComponentMinHeight}px, ${this.tracksComponentMaxHeight}px)`,
        //pbl related to min() within grid css? cf https://css-tricks.com/intrinsically-responsive-css-grid-with-minmax-and-min/
        //It's the 'fr' or 'auto' that cannot be passed within it... Damned
        //'grid-template-rows': `max-content max-content ${this.haTrackHeight}px ${this.allPavTotHeight}px minmax(${this.tracksComponentMinHeight}px, ${this.tracksComponentMaxHeight}px)`,
        'grid-template-rows': `max-content max-content ${this.haTrackHeight}px minmax(10px, 1fr) max-content`,
        'row-gap': `${this.gridGapSize}px`,
        'padding': '0.6em',
      }
    },
    */
    //Style Object for CSS properties of main view
    mainViewWrapper() {
      return {
        height: '100%',
        width: '100%',
        display: 'flex',
        'flex-direction': 'column',
        gap: `${this.gridGapSize}px`,
        'padding': '0.6em',
      }
    },

    //Style object to apply on css-grid wrapper of pav matrix and HATracks
    respPavDivWrapper() {
      return {
        //height: `${this.allPavTotHeight}px`,
        height: '100%',
        width: `${this.displayWindowWidth}px`,
        'max-height': `${this.haTrackHeight + this.gridGapSize + this.allPavTotHeight}px`,
        'overflow-y': 'hidden',
        display: 'grid',
        'grid-template-rows': `${this.haTrackHeight}px 1fr`,
        'row-gap': `${this.gridGapSize}px`, //TODO?: remove gap and its uses?
      }
    },

    //Computed of multiple objects to watch
    getDisplayBorders() {
      return { first: this.firstNt, last: this.lastNt }
    },

    //Get values out of Vuex store
    ...mapState({
      displayIsLoading: 'displayIsLoading',
      coreValue: 'coreThresholdSlide',
      genomeList: 'genomeListInDisplay',
      chromNames: 'chromNames',
      selectedChrom: 'chromSelected',
      firstNt: 'firstNtToDisplay',
      lastNt: 'lastNtToDisplay',
      ntWidthInPx: 'currentDisplayNtWidthInPx',
      colorScaleSimilarities: 'greenColorScale',
      colorScaleDisp: 'blueColorScale',
      colorScaleCore: 'orangeColorScale',
      coordsOfHollowAreas: 'coordsOfHollowAreas',
      isGffUploaded: 'isGffUploaded',
      selectedSortMode: 'selectedSortMode',
      currentDisplayNtWidthInPx: 'currentDisplayNtWidthInPx',
      colorScaleMaker: 'colorScaleMaker',
    }),
    ...mapGetters({
      chromData: 'chromDataInDisplay',
      gffData: 'gffDataInDisplay',
      colorScaleRainbow: 'positionRainbowColorScale',
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

    //Get Actions from the store
    ...mapActions([
      'updateChromDataInDisplay',
      'updateFirstNtToDisplay',
      'updateLastNtToDisplay'
    ]),

  }
}
</script>

<style scoped>

.canvasMiniature {
  flex: 0 0 auto;
  /*
  grid-column: 1;
  grid-row: 1;
  align-self: start;
  justify-self: center;
  */
}

.AnnotationTrack {
  flex: 0 0 auto;
  /*
  grid-column: 1;
  grid-row: 2;
  align-self: center;
  justify-self: center;
  */
}

.zoneHighlight {
  height: 100%;
  grid-column: 1;
  grid-row: 1 / 3;
  /*
  grid-row: 3 / 5;
  align-self: start;
  justify-self: center;
  */
}

.displayMatrix {
  height: 100%;
  z-index: 2;
  grid-column: 1;
  grid-row: 2;
  /*
  grid-row: 4;
  align-self: start;
  justify-self: center;
  */
}

.displayTracks {
  flex: 0 0 auto;
  /*
  grid-column: 1;
  grid-row: 5;
  align-self: start;
  justify-self: center;
  */
}

/*
#PanacheMainView {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0.6em;
}
*/

.loading-spinner {
  position: absolute;
  z-index: 999;
}

</style>
