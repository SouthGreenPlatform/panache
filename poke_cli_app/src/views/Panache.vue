<template>
  <div class="panache">
    <graph-panache />
  </div>
</template>

<script>
import * as d3 from 'd3';

import GraphPanache from '@/components/GraphPanache.vue';

export default {
  name: 'Panache',
  components: {
    GraphPanache
  },
  data: function() {
    return {
    };
  },
  props: {
  },
  mounted() {
  },
  methods: {
  }
}
</script>

<style>

.panache {
  background-color: #F8F8FF;
}

</style>