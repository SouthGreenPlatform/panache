<template>
  <div class="dropdown" style="text-align:center;">
    <label for="`dropdown_${id}`">{{msg}}: </label>

    <select :id="`dropdown_${id}`" :ref="`dropdown_${id}`" @change=setChosen>
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
    id: {
      type: String,
      default: () => this.choices[0]
    }
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

</style>
