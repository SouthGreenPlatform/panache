<template>
  <div class="wrapper">

    <label class="dropDownLabel" for="`dropDownButton`">{{msg}}: </label>

    <select :id="`dropDownButton`" :ref="`dropDownButton`" @change=setChosen>
      <option v-for="choice in choices" :key="choice" :value="choice">{{ choice }}</option>
    </select>

  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: 'DropDownChoice',
  props: {
    msg: {
      type: String,
    },
    choices: {
      type: Array,
      default: () => ['']
    },
  },
  data() {
    return {
    }
  },
  methods: {
    setChosen() {
      let value = d3.select(this.$refs[`dropdown_${this.id}`]).node().value;
      this.$store.state.chromSelected = value;
    }
  },
  watch: {
    chosen: function() {
      console.log(this.chosen);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

.wrapper {
  display: grid;
  grid-template-rows: repeat(2, 1fr);
}

.dropDownLabel {
  grid-row: 1;
  text-align: center;
  align-self: center;
}
.dropDownButton {
  grid-row: 2;
  text-align: center;
  align-self: center;
}

</style>
