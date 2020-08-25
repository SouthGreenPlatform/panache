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
      :updateGlobalZoom="function(ntWidthInPx) {$store.dispatch('updateCurrentZoomLvl', ntWidthInPx)}"
    />

  </div>
</template>

<script>

import CoreThreshold from '@/components/CoreThreshold.vue';
import DropDownChoice from '@/components/DropDownChoice.vue';
import PavMatrixLegend from '@/components/PavMatrixLegend.vue';
import MatrixPavZoom from '@/components/MatrixPavZoom.vue';
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'LocalFilter',
  components: {
    CoreThreshold,
    MatrixPavZoom,
    DropDownChoice,
    PavMatrixLegend,
  },
  props: {
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapState({
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
  beforeMount() {
    console.log(this.$store.getters)
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
