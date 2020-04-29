<template>
  <div>
    <img class="logo" alt="Vue logo" src="../assets/logo.png">
    <hr class="blueBar"/>
    <strong>Active Filter</strong>
    <b-form-input v-model="text" placeholder="Filter"/>
    <strong>Region of interest</strong>

    <template>
      <div>
        <label>Chromosome:</label>
        <b-form-tags input-id="tag-basic" v-model="value"></b-form-tags>
        <p>Value: {{ value }}</p>
      </div>
    </template>

    <b-alert show>Test: {{ text }}</b-alert>

    <label>Some range:</label>
    <b-form-input type="range"></b-form-input>
    
  </div>
</template>

<script>
export default {
  name: 'GlobalFilter',
  data() {
    return {
      value: ['apple', 'orange'],
      text: ''
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
