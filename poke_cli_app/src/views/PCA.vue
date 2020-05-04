<template>
  <div>
    <GenomesPCA :pcaCoordinates="pcaData"/>
    <!-- <main-tab-bar class="mainTabBar"/> -->
  </div>
</template>

<script>
// @ is an alias to /src
//import MainTabBar from '@/components/MainTabBar.vue'

import * as d3 from 'd3';

import GenomesPCA from '@/components/GenomesPCA.vue';

export default {
  name: 'PCA',
  components: {
    GenomesPCA
  },
  data: function() {
    return {
      pcaData: []
    };
  },
  beforeMount() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      let pcaPromise = d3.json("./coordinatesMerci.json");

      let pca = await pcaPromise;
      this.pcaData = pca;
    }
  }
}
</script>

<style>

.graph {
  margin-top: 40px;
  background-color: #F8F8FF;
}

</style>

