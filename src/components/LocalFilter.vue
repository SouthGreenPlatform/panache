<template>
  <div style="position: relative;">
    <div class="row border-bottom bg-light text-center" style="position: relative">
      <b-icon icon="filter" scale="1.5" class="filters-icon"></b-icon>
      <h5 class="mt-2 text-center w-100">
        Filters
        <div class="float-right" v-if="isLoading">
          <b-spinner
            label="Spinning"
            :small="true"
            style="position: absolute; top: 12px; right: 15px;border-width: 2px;">
          </b-spinner>
        </div>
      </h5>
    </div>
    <div class="row" style="position: absolute;left: 0;right: 0">
        <b-progress :max="100" height="2px" class="w-100" striped>
          <b-progress-bar variant="primary" :value="loadingPercent"></b-progress-bar>
        </b-progress>
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

    <MatrixPavZoom
        class='zoomSlider'
        :lastNt="globalLastNt"
        :displayWindowWidth="displayWindowWidth"
        :updateGlobalZoom="function(ntWidthInPx) { updateCurrentZoomLvl(ntWidthInPx) }"
    />

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
import MatrixPavZoom from '@/components/MatrixPavZoom.vue';
import HollowAreaFinder from '@/components/HollowAreaFinder.vue';

import {mapState, mapGetters, mapActions} from 'vuex';

export default {
  name: 'LocalFilter',
  components: {
    PavFileParser,
    GffFileParser,
    CoreThreshold,
    MatrixPavZoom,
    DropDownChoice,
    PavMatrixLegend,
    HollowAreaFinder,
  },
  props: {},
  data() {
    return {
    }
  },
  computed: {
    ...mapState({
      genoNames: 'genomeListInDisplay',
      chromNames: 'chromNames',
      firstNt: 'firstNtToDisplay',
      ntWidthInPx: 'currentDisplayNtWidthInPx',
    }),
    ...mapGetters({
      currentChromData: 'chromDataInDisplay',
      currentGffData: 'gffDataInDisplay',
      globalLastNt: 'lastNtOfChrom',
      nbOfGenomes: 'nbOfGenomesInDisplay',
      displayWindowWidth: 'displayWindowWidth',
      isLoading: 'isLoading',
      loadingPercent: "loadingPercent"
    })
  },
  methods: {
    //Get Actions from the store
    ...mapActions([
      'updateChromNames',
      'updateGenomesInDisplay',
      'updateFullChromData',
      'updateFullGffData',
      'updateSelectedChrom',
      'updateCurrentZoomLvl',
      'updateFirstNtToDisplay',
      'updateCoordsOfHollowAreas'
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
