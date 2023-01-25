<template>
  <div>
    <b-button
        id="SortOption_LocalPavPatternDisplayButton"
        @click="sortPerPavPattern"
        size="sm"
        class="buttonPanache"
        block
        variant="light">
      Sort by local PAV pattern
    </b-button>
    <b-popover v-if="isSortedByPavPattern" target="SortOption_LocalPavPatternDisplayButton" triggers="hover" placement="top">
      <template #title class="centerT">Boundaries used for sorting</template>
      <p>
        Left coordinate: {{ leftCoord }}
        <br>
        Right coordinate: {{ rightCoord }}
      </p>
    </b-popover>
  </div>
</template>

<script>
import {mapActions, mapState} from "vuex";
import {clusterData} from "@greenelab/hclust";
import {nonReactiveDataStore} from '@/store/non-reactive-data';

export default {
  name: "SortOption_LocalPavPattern",
  data() {
    return {
      isSortedByPavPattern: false,
      leftCoord: 0,
      rightCoord: 1,
    }
  },
  computed: {
    ...mapState({
      regionForPatternSort: 'regionForPatternSort',
      selectedChrom: 'selectedChrom',
      genomeListInDisplay: 'genomeListInDisplay',
    }),
  },
  methods: {
    ...mapActions([
      'updateGenomesInDisplay',
    ]),

    /**
     * Order vertically all the genomes based on the similarity of their PAV patterns
     * within the selected boundaries from the component PavPatternRegionSelector.
     */
    sortPerPavPattern() {
      // Temporarily shut down the display of info on hovering
      this.isSortedByPavPattern = false;

      // Get the panBlocks located within the selected boundaries
      let panBlocksWithinBoundaries = [];
      // TODO: check the locally visible blocks instead?
      let selectedChromData = nonReactiveDataStore.fullChromData[this.selectedChrom]; // Get the data of the chromosome in display
      this.leftCoord = this.regionForPatternSort[0];
      this.rightCoord = this.regionForPatternSort[1];

      for (let i = 0; i < selectedChromData.length; i++) {
        if (selectedChromData[i].FeatureStart >= this.leftCoord &&
            selectedChromData[i].FeatureStop <= this.rightCoord) {
          panBlocksWithinBoundaries.push(selectedChromData[i]);
        }
      }

      // Create a list that contain a list for avery genome and their presence/absence pattern of avery gene in panBlocksWithinBoundaries
      let presencePatternList = [];
      for (let i = 0; i < this.genomeListInDisplay.length; i++) {
        presencePatternList.push([]);
      }

      // Fill presencePatternList with the data of every gene status for every genome for every gene in panBlocksWithinBoundaries
      for (let i = 0; i < panBlocksWithinBoundaries.length; i++) {
        for (let j = 0; j < this.genomeListInDisplay.length; j++) {
          if (parseInt(panBlocksWithinBoundaries[i][this.genomeListInDisplay[j]]) === 0) { // Check if the presence status === 0
            presencePatternList[j].push(0); // If presence status === 0
          } else {
            presencePatternList[j].push(1); // If presence status >= 0
          }
        }
      }

      // Usage of the hclust library to create a cluster and order the genome by local phylogeny with the gene in panBlocksWithinBoundaries
      let clusterOrder = clusterData({ data: presencePatternList, distance: this.simpleMatching, onProgress: this.displayNothing}).order;
      let genomeListSorted = []; // Create a list that will contain the genomes newly sorted
      for (let i = 0; i < clusterOrder.length; i++) {
        genomeListSorted.push(this.genomeListInDisplay[clusterOrder[i]]) // Fill the list with the genome by their order in clusterOrder
      }
      this.updateGenomesInDisplay(genomeListSorted); // Update the genomes in display with he sorted list

      // Enable the display of info related to the parameters used to sort
      this.isSortedByPavPattern = true;
    },

    /**
     * Function that return the dissimilarity index between two arrays.
     * @param a first binary array
     * @param b second binary array, same length as a
     * @returns {number} dissimilarity index
     */
    simpleMatching(a, b) {
      const arrayLength = Math.min(a.length, b.length); // Keep smallest length to avoid crashes if the lengths are different
      let nbExactMatch = 0;

      // Build the count for a similarity index
      for (let index = 0; index < arrayLength; index++) {
        let arraysHaveSameValue = ((a[index] === 1 && b[index] === 1) || (a[index] === 0 && b[index] === 0));
        if (arraysHaveSameValue) { nbExactMatch++ };
      }

      return 1 - nbExactMatch / size; // Return the dissimilarity index
    },

    displayNothing() {
      // Do nothing
    }
  }
}
</script>

<style scoped>

.centerT {
  text-align: center;
}

</style>

<style>

.popover {
  -webkit-box-shadow: 0px 0px 9px -3px #000000;
  box-shadow: 0px 0px 9px -3px #000000;
}

</style>