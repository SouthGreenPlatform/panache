<template>
  <div>
    <img class="logo" alt="Vue logo" src="../assets/logo.png">
    <hr class="blueBar"/>
    <strong>Local Filters</strong>
    
    <core-threshold class="coreThreshold" />
    
  </div>
</template>

<script>

import CoreThreshold from '@/components/CoreThreshold.vue';

export default {
  name: 'LocalFilter',
  components: {
    CoreThreshold
  },
  data() {
    return {
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
  }
</style>
