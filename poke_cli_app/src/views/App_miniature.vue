<template>
  <div id="app">
    <Canvas :chromosomeData="chromosomeData"/>
  </div>
</template>

<script>
import * as d3 from "d3";

import Canvas from '@/components/Canvas.vue'

export default {
  name: 'App',
  components: {
    Canvas
  },
  data() {
    return {
      chromosomeData: []
    }
  },
  beforeMount() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      console.log('Fetching data');

      let dataPromise = d3.json("./mediumFakeDataWithAllBlocks_chrom0.json");

      let data = await dataPromise;
      console.log('Data fetched');
      this.chromosomeData = data;
    },
  }
}
</script>

<style>
</style>
