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
      // TODO: check the locally visible blocks instead? Are they stored somewhere other than Panache.vue?
      let selectedChromData = nonReactiveDataStore.fullChromData[this.selectedChrom]; // Get the data of the chromosome in display
      this.leftCoord = this.regionForPatternSort[0];
      this.rightCoord = this.regionForPatternSort[1];
      for (let i = 0; i < selectedChromData.length; i++) {
        if (selectedChromData[i].FeatureStart >= this.leftCoord &&
            selectedChromData[i].FeatureStop <= this.rightCoord) {
          panBlocksWithinBoundaries.push(selectedChromData[i]);
        }
      }

      /* Initiate a binary PAV matrix ahead of the computation of the dissimilarity index:
                  panBlockA   B   C
                 [
        genome1   [0,         1,  0],
        genome2   [0,         0,  0],
        genome3   [1,         1,  1]
                                    ]
      0 being an absence, 1 a presence
      */
      let localBinaryPavMatrix = [];
      for (let i = 0; i < this.genomeListInDisplay.length; i++) {
        localBinaryPavMatrix.push([]);
      }
      console.log(localBinaryPavMatrix);

      // Fill the binary PAV matrix with PAV values (0 or 1)
      let nParsedBlocks = 0;
      panBlocksWithinBoundaries.forEach( panBlock => {
        let nParsedGenomes = 0;
        this.genomeListInDisplay.forEach( geno => {
          console.log({nParsedBlocks, nParsedGenomes});
          if (parseInt(panBlock[geno]) === 0) {
            localBinaryPavMatrix[nParsedGenomes].push(0);
          } else {
            localBinaryPavMatrix[nParsedGenomes].push(1);
          }
          nParsedGenomes+=1;
        });
        nParsedBlocks+=1;
      })

      // Use the hclust library to cluster and order the genomes by their similarities within localBinaryPavMatrix
      let newOrderOfIndex = clusterData({ data: localBinaryPavMatrix, distance: this.simpleMatching, onProgress: this.displayNothing}).order;
      let newlySortedGenoList = []; // Create a list that will contain the genomes newly sorted
      newOrderOfIndex.forEach( oldIndex => {
        newlySortedGenoList.push(this.genomeListInDisplay[oldIndex]) // Fill the list with the genome by their order in newOrderOfIndex
      });

      // Update the order of genomes on display
      this.updateGenomesInDisplay(newlySortedGenoList);

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
        if (arraysHaveSameValue) { nbExactMatch++ }
      }

      return 1 - nbExactMatch / arrayLength; // Return the dissimilarity index
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