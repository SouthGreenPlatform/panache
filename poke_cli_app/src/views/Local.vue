<template>
  <div class="local">
    <local-graph class="graph" :user=user :tweetData="loadData" />
  </div>
</template>

<script>
// @ is an alias to /src
//import MainTabBar from '@/components/MainTabBar.vue'

import * as d3 from 'd3';

import LocalGraph from '@/components/LocalGraph.vue';

export default {
  name: 'Local',
  components: {
    LocalGraph
  },
  data: function() {
    return {
      loadData: []
    };
  },
  props: {
    user: String
  },
  mounted() {
    console.log("App loaded");
    this.fetchData();
  },
  methods: {
    async fetchData() {
      let data = await d3.json("./tweets.json");
      for(var i = 0; i < data.length; i++){
        if(data[i].user === this.user){
          this.loadData.push(data[i]);
        }
      }
    },

    onClickChild(data) {
      this.user = data;
    }
  }
}
</script>

<style>

.local {
  background-color: #F8F8FF;
}

</style>