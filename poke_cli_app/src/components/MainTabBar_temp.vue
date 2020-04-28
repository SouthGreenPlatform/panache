<template>
  <div>
    <b-navbar class="grey-back border-bottom mx-2" toggleable="lg" type="dark">
        <b-navbar-nav class="ml">
            <b-nav-form>
                <b-form-input size="sm" class="ml-sm-2" placeholder="Search"></b-form-input>
                <b-button size="sm" class="my-2 my-sm-0" type="submit">Search</b-button>
            </b-nav-form>
        </b-navbar-nav>
        <b-navbar-brand class="text-dark mx-auto">Title</b-navbar-brand>
    </b-navbar>
    <template>
        <div class="mt-3 mr-5">
            <b-nav pills align="center">
                <b-nav-item>Organism</b-nav-item>
                <b-nav-item>Sample diversity</b-nav-item>
                <b-nav-item active>Global diversity</b-nav-item>
                <b-nav-item>Local diversity</b-nav-item>
                <b-nav-item>Nucloetide diversity</b-nav-item>
            </b-nav>
        </div>
    </template>
    <template>
        <global-graph class="graph" :tweetData=loadData />
    </template>
  </div>
</template>

<script>
import * as d3 from 'd3';

import GlobalGraph from './GlobalGraph.vue';

export default {
  name: 'MainTabBar',
  components: {
      GlobalGraph
  },
  data: function() {
    return {
      loadData: []
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
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .grey-back {
        background-color: #F8F8FF;
    }
    .graph {
      margin-top: 40px;
      margin-left: 19rem;
    }
</style>
