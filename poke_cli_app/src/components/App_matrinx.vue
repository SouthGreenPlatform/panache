<template>
  <div id="app">
    <PavMatrixAndTracks
      :filteredData="filteredData"
      :genomeList="genomeList"
      :chromList="chromList"
      :coreThreshold="0.85"
      :displaySizeOfNt="1"
      :displayHeight="175"
    />
  </div>
</template>

<script>
import PavMatrixAndTracks from './components/PavMatrixAndTracks.vue'
import * as d3 from 'd3';

export default {
  name: 'App',
  components: {
    PavMatrixAndTracks
  },
  data() {
    return {
      filteredData: [],
      genomeList: [ 'Gen1', 'Gen2', 'Gen3', 'Gen4', 'Gen5', 'Gen6'],
      chromList: ['0', '1', '2', '3',],
      lastNt: 600000, //Must depend on the data !!!
      displayWindowWidth: 600
    }
  },
  beforeMount() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      console.log('Fetching data');

      let dataPromise = d3.json("./mediumFakeDataWithAllBlocks_chrom0_smallPart.json");

      let data = await dataPromise;
      console.log('Data fetched');
      this.filteredData = data;
    },
  }
}
</script>

<style>
</style>
