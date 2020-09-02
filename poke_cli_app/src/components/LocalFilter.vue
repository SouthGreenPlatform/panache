<template>
  <div>
    <img class="logo" alt="Vue logo" src="../assets/logo.png">
    <hr class="blueBar"/>
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
      displayWindowWidth: 'displayWindowWidth',
      ntWidthInPx: 'currentDisplayNtWidthInPx',
    }),
    ...mapGetters({
      globalLastNt: 'lastNtOfChrom',
      nbOfGenomes: 'nbOfGenomesInDisplay'
    })
  },
  methods: {
    //Get Actions from the store
    ...mapActions([
      'updateCurrentZoomLvl',
      'updateFirstNtToDisplay',
    ]),
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .blueBar {
    color: grey;
  }

  .logo {
    height: 3rem;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }

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
