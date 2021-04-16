<template>
  <div class="row">
    <div class="col-12">
      <h6 class="mt-3">
        <label :for="`dropDownButton_${idBonus}`" class="m-0">{{msg}}</label>
      </h6>
    </div>

    <div class="mb-1 col-12">
      <select :id="`dropDownButton_${idBonus}`" :ref="`dropDownButton`" @change="sort" class="form-control form-control-sm">
        <option v-for="choice in sortChoice" :key="choice" :value="choice">{{ choice }}</option>
      </select>
    </div>

    <!--<div class="col-12" v-show="selectedSortMode === 'Phylogenetic tree'">
      <select :id="`dropDownButton_PhylTreeChoice`" :ref="`dropDownButton`" class="form-control form-control-sm">
        <option value="Most ancien">Most ancient common ancestor</option>
        <option value="Most recent">Most recent common ancestor</option>
      </select>
      <p>Phylogenetic tree sort selected !</p>
    </div>-->

  </div>
</template>

<script>
import * as d3 from "d3";
import {mapActions, mapState} from "vuex";

export default {
  name: "SortTracks",
  props: {
    msg: {
      type: String,
      default: 'Sort the tracks',
    },
    sortChoice: {
      type: Array,
      required: true,
    },
    updateCurrentSortMode: {
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
      selectedSortMode: 'selectedSortMode',
      genomeList: 'genomeListInDisplay',
      genomeListSave: 'genomeListInDisplaySave'
    }),
  },
  methods: {
    sort() {
      let value = d3.select(this.$refs['dropDownButton']).node().value;
      this.updateCurrentSortMode(value);
      if (this.selectedSortMode === this.sortChoice[0]) {
        this.updateGenomesInDisplay(this.genomeListSave);
        console.log("CHOICE NONE SAVE : " + this.genomeListSave);
      } else if (this.selectedSortMode === this.sortChoice[1] || this.selectedSortMode === this.sortChoice[2]) {
        let genomeListSorted = [];
        genomeListSorted = this.genomeList;
        genomeListSorted.sort(function (a,b) {
          return a.localeCompare(b, 'en', { numeric: true });
        });
        if (this.selectedSortMode === this.sortChoice[2]) {
          this.updateGenomesInDisplay(genomeListSorted.reverse());
        } else {
          this.updateGenomesInDisplay(genomeListSorted);
        }
      }
    },
    ...mapActions([
      'updateGenomesInDisplay',
    ]),
  },
  watch: {
    chosen: function() {
      console.log(this.chosen);
    }
  }
}
</script>

<style scoped>

</style>