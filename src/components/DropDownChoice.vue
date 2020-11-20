<template>
  <div class="wrapperDropDown">

    <label class="dropDownLabel" :for="`dropDownButton_${idBonus}`">{{msg}}: </label>

    <select :id="`dropDownButton_${idBonus}`" :ref="`dropDownButton`" @change=setChosen>
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
    idBonus: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
    }
  },
  methods: {
    setChosen() {
      let value = d3.select(this.$refs['dropDownButton']).node().value;
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
<style scoped>

.wrapperDropDown {
  display: grid;
  grid-template-rows: repeat(2, auto);
}

.dropDownLabel {
  grid-row: 1;
  text-align: center;
  align-self: center;
  margin-bottom: 0;
}
#dropDownButton {
  grid-row: 2;
  align-self: center;
}

</style>
