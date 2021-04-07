<template>
  <div>
    <div class="row border-bottom bg-light" style="position: relative">
      <b-icon icon="filter" scale="1.5" class="filters-icon"></b-icon>
      <h5 class="mt-2 text-center w-100">
        Filters
      </h5>
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

    <!-- TODO: Extract the shape choice from the core threshold component... -->
    <CoreThreshold/>

    <div class="mt-1"><small>Zoom Level</small></div>

    <MatrixOptimizedZoom
        class='zoomSlider'
        :smallestNtWidthInPx="minNtWidthInPx"
        :largestNtWidthInPx="maxNtWidthInPx"
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

import CoreThreshold from '@/components/CoreThreshold.vue';
import DropDownChoice from '@/components/DropDownChoice.vue';
import PavMatrixLegend from '@/components/PavMatrixLegend.vue';
import MatrixOptimizedZoom from '@/components/MatrixOptimizedZoom.vue';
import HollowAreaFinder from '@/components/HollowAreaFinder.vue';

import {mapState, mapGetters, mapActions} from 'vuex';

import * as d3 from "d3";

export default {
  name: 'LocalFilter',
  components: {
    CoreThreshold,
    MatrixOptimizedZoom,
//    MatrixPavZoom,
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
      maxNtWidthInPx: 'maxNtWidthInMainDisplay',
      minNtWidthInPx: 'minNtWidthForNavigabilityInMainDisplay',
      nbOfGenomes: 'nbOfGenomesInDisplay',
    })
  },
  mounted() {
    //Pre-load vis with bananaGenomeHub data
    this.updateBananaData();
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
    async updateBananaData() {

      //Send parameters not directly extracted from the data files
      this.updateChromNames([
        'chr01', 'chr02', 'chr03', 'chr04', 'chr05', 'chr06', 'chr07', 'chr08',
        'chr09', 'chr10', 'chr11', 'chrUn_random'
        ]);
      this.updateSelectedChrom('chr01');
      this.updateGenomesInDisplay([
        'Bile', 'BSK30', 'Calcutta', 'Ensete01', 'EnseteBedadit', 'EnseteDerea',
        'FHIA', 'Itinerans', 'Kole', 'Lidi', 'MasKirana', 'Pahang', 'PKW',
        'Tanduk', 'TongkatLangitMaluku'
      ]);

      //Send datasets to store
      let pavDataPromise = d3.json('./bananachePAV_preformatted.json');
      let gffDataPromise = d3.json('./bananacheGFF_preformatted.json');

      let [pavData, gffData] = await Promise.all( [pavDataPromise, gffDataPromise] );

      this.updateFullChromData(pavData);
      this.updateFullGffData(gffData);

    }
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
