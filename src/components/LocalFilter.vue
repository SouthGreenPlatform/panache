<template>
  <div class='wrapper'>
    <strong class='title' >Filters</strong>


    <!-- I should check if the output is what I truly expect from those two components vs what the store needs-->
    <PavFileParser
      class='pavLoader'
      :updateChromNames="function(listOfChrom) { updateChromNames(listOfChrom) }"
      :updateDefaultChrom="function(chrom) { updateSelectedChrom(chrom) }"
      :updateGenoNames="function(listOfGenomes) { updateGenomesInDisplay(listOfGenomes) }"
      :updateFunctionsDiversity="function() { return }"
      :updatePavData="function(pavData) { updateFullChromData(pavData) }"
    />
    <!-- updateFunctionDiversity is not used yet?-->
    <GffFileParser
      class='gffLoader'
      :chromList="chromNames"
      :updateAnnotationData="function(gffData) { updateFullGffData(gffData) }"
    />

    <CoreThreshold
      class='coreThreshold'
    />
    <DropDownChoice
      class='chromChoice'
      msg='Chromosome on display'
      :choices="chromNames"
      :updateCurrentChrom="function(chrom) { updateSelectedChrom(chrom) }"
      idBonus='Chrom'
    />
    <PavMatrixLegend
      class="pavLegend"
    />
    <MatrixPavZoom
      class='zoomSlider'
      :lastNt="globalLastNt"
      :displayWindowWidth="displayWindowWidth"
      :updateGlobalZoom="function(ntWidthInPx) { updateCurrentZoomLvl(ntWidthInPx) }"
    />
    <HollowAreaFinder
      class='haf'
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

import { mapState, mapGetters, mapActions } from 'vuex';

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
  props: {
  },
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

</style>
