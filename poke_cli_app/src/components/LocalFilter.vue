<template>
  <div>
    <strong>Local Filters</strong>

    <core-threshold class="coreThreshold" />

    <DropDownChoice :msg="'Chromosome on display'" :choices="chromNames" :id="'Yuca'"/>

    <PavMatrixLegend class="pavLegend" />

    <MatrixPavZoom
      class='zoomSlider'
      :lastNt="globalLastNt"
      :displayWindowWidth="displayWindowWidth"
      :updateGlobalZoom="function(ntWidthInPx) { updateCurrentZoomLvl(ntWidthInPx) }"
    />

    <HollowAreaFinder
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

  .coreThreshold {
    margin-top: 2rem;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }

  .pavLegend {
    display: block;
    margin-top: 1rem;
  }

  .zoomSlider {
    display: block;
    margin-top: 7rem;
  }
</style>
