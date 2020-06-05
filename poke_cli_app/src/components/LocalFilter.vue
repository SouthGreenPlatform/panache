<template>
  <div>
    <img class="logo" alt="Vue logo" src="../assets/logo.png">
    <hr class="blueBar"/>
    <strong>Local Filters</strong>
    
    <core-threshold class="coreThreshold" />

    <DropDownChoice :msg="'Chromosome on display'" :choices="chromList" :id="'Yuca'"/>

    <PavMatrixLegend class="pavLegend" />
    
    <MatrixPavZoom class="zoomSlider" :lastNt="lastNt" :displayWindowWidth="displayWindowWidth" />
    
  </div>
</template>

<script>

import CoreThreshold from '@/components/CoreThreshold.vue';
import MatrixPavZoom from '@/components/MatrixPavZoom.vue';
import DropDownChoice from '@/components/DropDownChoice.vue';
import PavMatrixLegend from '@/components/PavMatrixLegend.vue';

export default {
  name: 'LocalFilter',
  components: {
    CoreThreshold,
    MatrixPavZoom,
    DropDownChoice,
    PavMatrixLegend
  },
  data() {
    return {
      lastNt: 41332,
      displayWindowWidth: 1100,
      chromList: ['0', '1', '2', '3',],
    }
  },
  props: {
    msg: String
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
