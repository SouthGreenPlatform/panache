<template>
  <div class="row">
    <div class="col-12">
      <h6 class="mt-3">
        <label :for="`dropDownButton_${idBonus}`" class="m-0">{{msg}}</label>
      </h6>
    </div>

    <div class="mb-1 col-12">
      <select :id="`dropDownButton_${idBonus}`" :disabled="isNewickTreeDisplayed" :ref="`dropDownButton`" @change="sort" class="form-control form-control-sm">
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
      genomeListSave: 'genomeListInDisplaySave',
      genomeListNewickTreeUpload: 'newickTreeData',
      isNewickTreeDisplayed: 'isNewickTreeDisplayed',
    }),
  },
  methods: {
    /**
     *  Sorting method who sort the array genomeListInDisplay in function of the choice in the input dropDownButton_SortMode.
     *  This component uniquely sort directly by four sorting mode :
     *  - None (position by default) : choosing it will restore a save of initial order of the genome from the file uploaded.
     *  - Alphanumerically : sort by letters and numbers ("a" before "b" and "5" before "13" for example).
     *  - Reverse alphanumerically : its the inverse of the one before.
     *  - By phylogenetic tree : will allow the user to upload a Newick file that is a tree of link between the genomes.
     *  The others sort choices only modify the selected value in store to be used by other components.
     */
    sort() {
      let value = d3.select(this.$refs['dropDownButton']).node().value; // Get the value chosen by the user
      this.updateCurrentSortMode(value); // Update the sorting type
      if (this.selectedSortMode === 'None') { // If the choice of sort is "None"
        this.updateGenomesInDisplay(this.genomeListSave); // Use the save to reload the initial order
      } else if (this.selectedSortMode === 'Alphanumeric' ||
                 this.selectedSortMode === 'Reverse alphanumeric') { // If the choice of sort is "Alphanumerically" or "Reverse alphanumerically"
        let genomeListSorted = [];
        genomeListSorted = this.genomeList; // We make a copy of this list to avoid any issue
        genomeListSorted.sort(function (a,b) {
          return a.localeCompare(b, 'en', { numeric: true }); // We compare the letters and numbers (uppercase are treated as lowercase )
        });
        if (this.selectedSortMode === 'Reverse alphanumeric') { // If the choice of sort is "Reverse alphanumerically"
          this.updateGenomesInDisplay(genomeListSorted.reverse()); // Reverse the array previously made and update genomeListInDisplay with it
        } else {
          this.updateGenomesInDisplay(genomeListSorted); // Update genomeListInDisplay with array sort by alphanumerically
        }
      } else if (this.selectedSortMode === 'Phylogenetic tree') {
        this.updateGenomesInDisplay(this.genomeListNewickTreeUpload); // Update genomeListInDisplay with the array extracted from the Newick file uploaded.
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