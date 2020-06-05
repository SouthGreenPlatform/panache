<template>
  <div id="circos">
    <PanCircos :layoutData="layoutData" :chordsData="chordsData" class="whiteBlock shadow-lg pt-4 mt-2"/>
  </div>
</template>

<script>
import * as d3 from "d3";

import PanCircos from '@/components/PanCircos.vue'

export default {
  name: 'Circos',
  components: {
    PanCircos
  },
  data() {
    return {
      layoutData: [],
      chordsData: []
    }
  },
  beforeMount() {
    this.fetchCircosData();
  },
  methods: {
    async fetchData() {
      console.log('Fetching data');

      let pcaPromise = d3.json("./coordinatesMerci.json");

      let pca = await pcaPromise;
      console.log('Data fetched');
      this.pcaData = pca;
      //console.log(this.pcaData);
    },
    async fetchCircosData() {
      console.log('Fetching circos data');

      let layout = await d3.json('./corn_W22-2_vs_B73-5_m5dw2_layout.json');
      let chords = await d3.json('./corn_W22-2_vs_B73-5_m5dw2_noSameChrom_circos.json');

      console.log('chords fetched');
      console.log('layout fetched');
      //console.log(layout);

      this.layoutData = layout;
      this.chordsData = chords;
    },
  }
}
</script>

<style>
#circos {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.whiteBlock {
  background-color: white;
  width: 77%;
  height: 39rem;
  border-radius: 50px;
  margin-left: 22%;
}
</style>
