<template>
  <div>
    <global-graph class="graph" :tweetData=loadData @clicked="onClickChild" />
    <!-- <main-tab-bar class="mainTabBar"/> -->
  </div>
</template>

<script>
// @ is an alias to /src
//import MainTabBar from '@/components/MainTabBar.vue'

import * as d3 from 'd3';

import GlobalGraph from '@/components/GlobalGraph.vue';

export default {
  name: 'Global',
  components: {
    GlobalGraph
  },
  data: function() {
    return {
      loadData: [],
      user: ""
    };
  },
  mounted() {
    console.log("App loaded");
    this.fetchData();
  },
  methods: {
    async fetchData() {
      let data = await d3.json("./tweets.json");
      this.loadData = data;
    },

    onClickChild(data) {
      this.user = data;
      this.$router.push({
        name: 'Local',
        params: { user: this.user }
      });
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

