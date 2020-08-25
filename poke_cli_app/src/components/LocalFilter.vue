<template>
  <div>
    <img class="logo" alt="Vue logo" src="../assets/logo.png">
    <hr class="blueBar"/>
    <strong>Local Filters</strong>

    <core-threshold class="coreThreshold" />

    <DropDownChoice :msg="'Chromosome on display'" :choices="$store.state.chromNames" :id="'Yuca'"/>

    <PavMatrixLegend class="pavLegend" />

    <MatrixPavZoom
      class='zoomSlider'
      :lastNt="$store.state.lastNtOfChrom"
      :displayWindowWidth="$store.state.displayWindowWidth"
      :updateGlobalZoom="function(ntWidthInPx) {$store.dispatch('updateCurrentZoomLvl', ntWidthInPx)}"
    />

    <HollowAreaFinder
      :arrayOfPanFeatures="chromData"
      :lastNt="$store.state.lastNtOfChrom"
      :nbOfGenomes="6"
      :currentFirstNt="$store.state.firstNtToDisplay"
      :displayWindowWidth="$store.state.displayWindowWidth"
      :ntWidthInPixel="$store.state.currentDisplayNtWidthInPx"
      :updateGlobalFirstNt="function(payload) {$store.dispatch('updateFirstNtToDisplay', payload)}"
    />

  </div>
</template>

<script>

import CoreThreshold from '@/components/CoreThreshold.vue';
import DropDownChoice from '@/components/DropDownChoice.vue';
import PavMatrixLegend from '@/components/PavMatrixLegend.vue';
import MatrixPavZoom from '@/components/MatrixPavZoom.vue';
import HollowAreaFinder from '@/components/HollowAreaFinder.vue';

export default {
  name: 'LocalFilter',
  components: {
    CoreThreshold,
    MatrixPavZoom,
    DropDownChoice,
    PavMatrixLegend
  },
  props: {
  },
  data() {
    return {
    }
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
