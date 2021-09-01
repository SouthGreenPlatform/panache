<template>
  <div class="row">
    <div class="col-12">
      <h6 class="mt-3">
        <label :for="`dropDownButton_${idBonus}`" class="m-0">{{msg}}</label>
      </h6>
    </div>

    <div class="col-12">
      <select :id="`dropDownButton_${idBonus}`" :ref="`dropDownButton`" @change="setChosen" class="form-control form-control-sm">
        <option v-for="choice in choices" :key="choice" :value="choice">{{ choice }}</option>
      </select>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
import {mapState} from "vuex";

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
    updateCurrentChrom: {
      type: Function,
      required: true,
    },
    idBonus: {
      type: String,
      default: ''
    },
  },
  computed: {
    ...mapState({
      selectedChrom: 'selectedChrom',
      chromList: 'chromNames',
    }),
  },
  data() {
    return {
    }
  },
  methods: {
    setChosen() {
      let value = d3.select(this.$refs['dropDownButton']).node().value;
      this.updateCurrentChrom(value);
      //this.$store.state.chromSelected = value;
    }
  },
  watch: {
    chosen: function() {
      console.log(this.chosen);
    },
    selectedChrom() {
      for (let i = 0; i < this.chromList.length; i++) {
        if (this.chromList[i] === this.selectedChrom) {
          document.getElementById("dropDownButton_Chrom").selectedIndex = i;
        }
      }
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
