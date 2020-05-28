<template>
  <div>
    <!-- On récupère l'event clicked envoyé par le child component avec les datas associées -->
    <GenomesPCA :pcaCoordinates="pcaData" :crop="crop" @clicked="onClickChild"/>
  </div>
</template>

<script>
import * as d3 from 'd3';

// @ is an alias to /src
import GenomesPCA from '@/components/GenomesPCA.vue';

export default {
  name: 'PCA',
  components: {
    GenomesPCA
  },
  data: function() {
    return {
      pcaData: [],
      crop: ""
    };
  },
  beforeMount() {
    this.fetchData();
  },
  methods: {
    // Lecture du json pour récupérer les données
    async fetchData() {
      let pcaPromise = d3.json("./coordinatesMerci.json");

      let pca = await pcaPromise;
      this.pcaData = pca;
    },
    // 
    onClickChild(data) {
      this.crop = data;
    }
  }
}
</script>

<style>

</style>

