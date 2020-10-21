<template>

    <FileLoader :idBonus="'PavFile'" @file-loaded="doSomethingWithDataURL"/>

</template>

<script>
import FileLoader from './components/FileLoader.vue';

export default {
  name: 'PavFileParser',
  components: {
    FileLoader,
  },
  data() {
    return {
    }
  },
  computed: {
    self() {
      return this;
    }
  },
  methods: {
    doSomethingWithDataURL: function(payload) {
      console.log(payload.dataURL);
    }
  }
}
</script>

<style>

</style>
