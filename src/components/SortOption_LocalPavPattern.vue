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
import {mapActions, mapGetters, mapState} from "vuex";
import {clusterData} from "@greenelab/hclust";
import {nonReactiveDataStore} from '@/store/non-reactive-data';

export default {
  name: "SortOption_LocalPavPattern",
  data() {
    return {
      isSortedByPavPattern: false,
      rightCoord: 0,
      leftCoord: 0,
    }
  },
  computed: {
    ...mapState({
      localAreaSelected: 'localAreaSelected',
      firstNtToDisplay: 'firstNtToDisplay',
      currentDisplayNtWidthInPx : 'currentDisplayNtWidthInPx',
      selectedChrom: 'selectedChrom',
      // fullChromData: 'fullChromData',
      genomeListInDisplay: 'genomeListInDisplay',
    }),
    ...mapGetters({
      displayWindowWidth: 'displayWindowWidth',
    }),
  },
  methods: {
    ...mapActions([
      'updateGenomesInDisplay',
    ]),

    /**
     * Convert a lentgh in pixel to a length in nucleotides
     * @param pxAmount value in pixel
     * @returns {number} value in nucleotide
     */
    pxToNt(pxAmount) {
      if (pxAmount <= 0) { // Make sure the var is not negative
        return 0;
      } else if (pxAmount >= this.displayWindowWidth) { // Check if the value is not higher than the size of the display (this is the case at the beginning)
        return this.displayWindowWidth / this.currentDisplayNtWidthInPx + this.firstNtToDisplay; // TODO: check if this case makes sense
      } else {
        return pxAmount / this.currentDisplayNtWidthInPx + this.firstNtToDisplay;
      }
    },

    /**
     * Order vertically all the genomes based on the similarity of their PAV patterns
     * within the selected boundaries from the component PresencePatternSelector.
     */
    sortPerPavPattern() {
      // Temporarily shut down the display of info on hovering
      this.isSortedByPavPattern = false;

      // Search the genes that match the selected area
      let geneBetweenValues = [];
      let selectedChromData = nonReactiveDataStore.fullChromData[this.selectedChrom]; // Get the data of the chromosome in display
      this.leftCoord = Math.round(this.pxToNt(this.localAreaSelected[0]));
      this.rightCoord = Math.round(this.pxToNt(this.localAreaSelected[1]));
      for (let i = 0; i < selectedChromData.length; i++) { // Check every gene of the chromosome
        if (selectedChromData[i].FeatureStart >= this.leftCoord &&
            selectedChromData[i].FeatureStop <= this.rightCoord) {
          geneBetweenValues.push(selectedChromData[i]); // Add the gene to list if its in the selected area
        }
      }

      // Create a list that contain a list for avery genome and their presence/absence pattern of avery gene in geneBetweenValues
      let presencePatternList = [];
      for (let i = 0; i < this.genomeListInDisplay.length; i++) {
        presencePatternList.push([]);
      }

      // Fill presencePatternList with the data of every gene status for every genome for every gene in geneBetweenValues
      for (let i = 0; i < geneBetweenValues.length; i++) {
        for (let j = 0; j < this.genomeListInDisplay.length; j++) {
          if (parseInt(geneBetweenValues[i][this.genomeListInDisplay[j]]) === 0) { // Check if the presence status === 0
            presencePatternList[j].push(0); // If presence status === 0
          } else {
            presencePatternList[j].push(1); // If presence status >= 0
          }
        }
      }

      // Usage of the hclust library to create a cluster and order the genome by local phylogeny with the gene in geneBetweenValues
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