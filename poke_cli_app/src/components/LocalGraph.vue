<template>
    <div> Je suis un autre component et je récupère la donnée: {{ user }} </div>
</template>

<script>
//import * as d3 from "d3";

export default {
  name: 'LocalGraph',
  props: {
      user: String
  },
  mounted() {
  },
  methods: {

  }
};
</script>

<style lang="scss">
</style>