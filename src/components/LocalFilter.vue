<template>
  <div class='wrapper'>
    <strong class='title' >Local Filters</strong>

    <CoreThreshold
      class='coreThreshold'
    />
    <DropDownChoice
      class='chromChoice'
      msg='Chromosome on display'
      :choices="chromNames"
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
      :arrayOfPanFeatures="chromData"
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

import CoreThreshold from '@/components/CoreThreshold.vue';
import DropDownChoice from '@/components/DropDownChoice.vue';
import PavMatrixLegend from '@/components/PavMatrixLegend.vue';
import MatrixPavZoom from '@/components/MatrixPavZoom.vue';
import HollowAreaFinder from '@/components/HollowAreaFinder.vue';

import { mapState, mapGetters, mapActions } from 'vuex';

export default {
  name: 'LocalFilter',
  components: {
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
      chromData: 'chromDataInDisplay',
      firstNt: 'firstNtToDisplay',
      ntWidthInPx: 'currentDisplayNtWidthInPx',
    }),
    ...mapGetters({
      globalLastNt: 'lastNtOfChrom',
      nbOfGenomes: 'nbOfGenomesInDisplay',
      displayWindowWidth: 'displayWindowWidth',
    })
  },
  methods: {
    //Get Actions from the store
    ...mapActions([
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
  grid-template-rows: repeat(6, auto);
  row-gap: 5px;
}

.title {
  grid-row: 1;
  text-align: center;
}

.coreThreshold {
  grid-row: 2;
  text-align: center;
  align-self: center;
}

.chromChoice {
  grid-row: 3;
  text-align: center;
  padding: 0.5em;
}

.pavLegend {
  grid-row: 4;
  text-align: center;
}

.zoomSlider {
  grid-row: 5;
  text-align: center;
}

.haf {
  grid-row: 6;
  text-align: center;
}

</style>
