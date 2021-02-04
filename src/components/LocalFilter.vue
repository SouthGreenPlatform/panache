<template>
  <div>
    <div class="row border-bottom bg-light" style="position: relative">
      <b-icon icon="filter" scale="1.5" class="filters-icon"></b-icon>
      <h5 class="mt-2 text-center w-100">
        Filters
      </h5>
    </div>

    <div class="row">
      <div class="col-12">
        <h6 class="mt-3">Files</h6>
      </div>
      <div class="col-12 mb-1">
        <!-- I should check if the output is what I truly expect from those two components vs what the store needs-->
        <!-- updateFunctionDiversity is not used yet?-->
        <PavFileParser
            :updateChromNames="function(listOfChrom) { updateChromNames(listOfChrom) }"
            :updateDefaultChrom="function(chrom) { updateSelectedChrom(chrom) }"
            :updateGenoNames="function(listOfGenomes) { updateGenomesInDisplay(listOfGenomes) }"
            :updateFunctionsDiversity="function() { return }"
            :updatePavData="function(pavData) { updateFullChromData(pavData) }"
        />
      </div>
      <div class="col-12">
        <GffFileParser
            :chromList="chromNames"
            :updateAnnotationData="function(gffData) { updateFullGffData(gffData) }"
        />
      </div>
    </div>

    <DropDownChoice
        msg='Chromosome on display'
        :choices="chromNames"
        :updateCurrentChrom="function(chrom) { updateSelectedChrom(chrom) }"
        idBonus='Chrom'
    />

    <div class="row">
      <div class="col-12">
        <h6 class="mt-3">Display parameters</h6>
      </div>
    </div>

    <CoreThreshold/>

    <MatrixOptimizedZoom
        class='zoomSlider'
        :smallestNtWidthInPx="minNtWidthInPx"
        :largestNtWidthInPx="maxNtWidthInPx"
        :updateGlobalZoom="function(ntWidthInPx) { updateCurrentZoomLvl(ntWidthInPx) }"
    />

    <!--MatrixPavZoom
        class='zoomSlider'
        :lastNt="globalLastNt"
        :displayWindowWidth="displayWindowWidth"
        :updateGlobalZoom="function(ntWidthInPx) { updateCurrentZoomLvl(ntWidthInPx) }"
    /-->

    <div class="row">
      <div class="col-12">
        <h6 class="mt-3">Hollow area finder</h6>
      </div>
    </div>

    <HollowAreaFinder
        :arrayOfPanFeatures="currentChromData"
        :lastNt="globalLastNt"
        :genoNames="genoNames"
        :nbOfGenomes="nbOfGenomes"
        :currentFirstNt="firstNt"
        :displayWindowWidth="displayWindowWidth"
        :ntWidthInPixel="ntWidthInPx"
        :updateGlobalFirstNt="function(payload) { updateFirstNtToDisplay(payload) }"
        :updateGlobalCoordOfHollowAreas="function(payload) { updateCoordsOfHollowAreas(payload) }"
    />

    <div class="row">
      <div class="col-12">
        <h6 class="mt-3">Legend</h6>
      </div>
    </div>

    <PavMatrixLegend
        class="pavLegend"
    />
  </div>
</template>

<script>

import PavFileParser from '@/components/PavFileParser.vue';
import GffFileParser from '@/components/GffFileParser.vue';
import CoreThreshold from '@/components/CoreThreshold.vue';
import DropDownChoice from '@/components/DropDownChoice.vue';
import PavMatrixLegend from '@/components/PavMatrixLegend.vue';
import MatrixOptimizedZoom from '@/components/MatrixPavZoom.vue';
import MatrixPavZoom from '@/components/MatrixPavZoom.vue';
import HollowAreaFinder from '@/components/HollowAreaFinder.vue';

import {mapState, mapGetters, mapActions} from 'vuex';

export default {
  name: 'LocalFilter',
  components: {
    PavFileParser,
    GffFileParser,
    CoreThreshold,
    MatrixOptimizedZoom,
    MatrixPavZoom,
    DropDownChoice,
    PavMatrixLegend,
    HollowAreaFinder,
  },
  props: {},
  data() {
    return {}
  },
  computed: {
    ...mapState({
      chromNames: 'chromNames',
      firstNt: 'firstNtToDisplay',
      genoNames: 'genomeListInDisplay',
      ntWidthInPx: 'currentDisplayNtWidthInPx',
    }),
    ...mapGetters({
      currentChromData: 'chromDataInDisplay',
      currentGffData: 'gffDataInDisplay',
      displayWindowWidth: 'displayWindowWidth',
      globalLastNt: 'lastNtOfChrom',
      nbOfGenomes: 'nbOfGenomesInDisplay',
    })
  },
  methods: {
    //Get Actions from the store
    ...mapActions([
      'updateChromNames',
      'updateCoordsOfHollowAreas',
      'updateCurrentZoomLvl',
      'updateFirstNtToDisplay',
      'updateFullChromData',
      'updateFullGffData',
      'updateGenomesInDisplay',
      'updateSelectedChrom',
    ]),
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.wrapper {
  display: grid;
  grid-template-rows: repeat(8, auto);
  row-gap: 5px;
}

.title {
  grid-row: 1;
  text-align: center;
}

.pavLoader {
  grid-row: 2;
  text-align: center;
  align-self: center;
}

.gffLoader {
  grid-row: 3;
  text-align: center;
}

.coreThreshold {
  grid-row: 4;
  text-align: center;
}

.chromChoice {
  grid-row: 5;
  text-align: center;
  padding: 0.5em;
}

.pavLegend {
  grid-row: 6;
  text-align: center;
}

.zoomSlider {
  grid-row: 7;
  text-align: center;
}

.haf {
  grid-row: 8;
  text-align: center;
}

.filters-icon {
  position: absolute;
  top: 15px;
  left: 20px
}
</style>
