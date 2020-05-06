<template>
  <div>
    <img class="logo" alt="Vue logo" src="../assets/logo.png">
    <hr class="blueBar"/>
    <strong>PCA Filters</strong>
    
    
  </div>
</template>

<script>
export default {
  name: 'SampleFilter',
  data() {
    return {
    }
  },
  props: {
    msg: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .blueBar {
    color: grey;
  }

  .logo {
    height: 3rem;
    display:block;
    margin-left: auto;
    margin-right: auto;
  }
</style>
