<template>
  <div v-show="isLoading" class='text-center'>
    <div class="spinner-border text-info" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>

<script>
//import * as d3 from "d3";

export default {
  name: 'LoadingSpinner',
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },

  },
  data() {
    return {
    }
  },
  methods: {
  },
  watch: {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.spinner-border {
  border: 0.4em solid currentColor;
}

</style>
